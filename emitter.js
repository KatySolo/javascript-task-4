'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    var events = {};

    return {

        on: function (event, context, handler) {
            if (event in events) {
                events[event].push({
                    data: context,
                    action: handler,
                    finishTime: Infinity,
                    frequency: 1,
                    count: 0
                });
            } else {
                events[event] = [{
                    data: context,
                    action: handler,
                    finishTime: Infinity,
                    frequency: 1,
                    count: 0
                }];
            }

            return this;
        },

        off: function (event, context) {
            const allEventsToOff = findAllSubEvents(event, events).concat(event);
            allEventsToOff.forEach(function (e) {
                const allContexts = events[e];
                const subscriberIndex = findSubscriber(allContexts, context);
                subscriberIndex.forEach(function (i) {
                    if (i !== -1) {
                        events[e].splice(i, 1);
                    }
                });
            });

            return this;
        },


        emit: function (event) {
            const allEvents = getAllEvents(event);
            allEvents.forEach(function (e) {
                const allSubscribers = events[e];
                if (allSubscribers !== undefined) {
                    allSubscribers.forEach(function (i) {
                        const permissionToEmit = checkEvent(i);
                        if (!permissionToEmit) {
                            i.count++;
                            i.action.call(i.data);
                        } else {
                            i.count++;
                        }
                    });
                }
            });

            return this;
        },

        several: function (event, context, handler, times) {
            if (times <= 0) {
                this.on(event, context, handler);
            }
            this.on(event, context, handler);
            events[event][findSubscriber(events[event], context)].finishTime = times;

            return this;
        },

        through: function (event, context, handler, frequency) {
            if (frequency <= 0) {
                this.on(event, context, handler);
            }
            this.on(event, context, handler);
            events[event][findSubscriber(events[event], context)].frequency = frequency;

            return this;
        }
    };
}

function checkEvent(event) {
    const isTimeAppropriate = event.finishTime <= event.count;
    const isFrequencyAppropriate = event.count % event.frequency !== 0;

    return isTimeAppropriate || isFrequencyAppropriate;
}

function findAllSubEvents(event, events) {
    var result = [];
    Object.keys(events).forEach(function (i) {
        const subEvents = i.slice(event.length);
        const rootEvent = i.substr(0, event.length);
        if (subEvents[0] === '.' && rootEvent === event) {
            result.push(i);
        }
    });

    return result;
}

function findSubscriber(allContexts, context) {
    const endValue = (allContexts !== undefined) ? allContexts.length : 0;
    if (endValue === 0) {
        return [-1];
    }
    var result = [];
    for (var i = 0; i < endValue; i++) {
        if (allContexts[i].data === context) {
            result.push(i);
        }
    }

    return result.reverse();
}

function getAllEvents(event) {
    const splittedEvent = event.split('.');
    if (splittedEvent.length === 1) {
        return [event];
    }
    var result = [splittedEvent[0]];
    splittedEvent.reduce(function (prev, cur) {
        result.push(prev + '.' + cur);

        return prev + '.' + cur;
    });

    return result.reverse();
}

module.exports = {
    getEmitter,
    isStar
};
