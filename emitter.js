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
    var currentTime = 0;

    return {

        on: function (event, context, handler) {
            if (event in events) {
                events[event].push({
                    data: context,
                    action: handler,
                    finishTime: Infinity,
                    frequency: 1
                });
            } else {
                events[event] = [{
                    data: context,
                    action: handler,
                    finishTime: Infinity,
                    frequency: 1
                }];
            }

            // идемпотентность
            return this;
        },

        off: function (event, context) {
            const allEventsToOff = findAllSubEvents(event, events).concat(event);
            allEventsToOff.forEach(function (e) {
                const allContexts = events[e];
                const subscriberIndex = findSubscriber(allContexts, context);
                if (subscriberIndex !== -1) {
                    events[e].splice(subscriberIndex, 1);
                }
            });

            return this;
        },


        emit: function (event) {
            const allEvents = getAllEvents(event);
            allEvents.forEach(function (e) {
                const allSubscribers = events[e];
                if (allSubscribers !== undefined) {
                    allSubscribers.forEach(function (i) {
                        const permissionToEmit = checkEvent(i, currentTime);
                        if (permissionToEmit) {
                            i.action.call(i.data);
                        }
                    });
                }
            });
            if (event !== 'begin') {
                currentTime++;
            }

            return this;
        },

        several: function (event, context, handler, times) {
            if (times <= 0) {
                this.on(event, context, handler);
            }
            const finishTime = currentTime + times;
            this.on(event, context, handler);
            events[event][findSubscriber(events[event], context)].finishTime = finishTime;
            console.info(event, context, handler, times);

            return this;
        },

        through: function (event, context, handler, frequency) {
            if (frequency <= 0) {
                this.on(event, context, handler);
            }
            this.on(event, context, handler);
            events[event][findSubscriber(events[event], context)].frequency = frequency;
            console.info(event, context, handler, frequency);

            return this;
        }
    };
}

function checkEvent(event, currentTime) {
    const isTimeAppropriate = event.finishTime > currentTime;
    const isFrequencyAppropriate = currentTime % event.frequency === 0;

    return isTimeAppropriate && isFrequencyAppropriate;
}

function findAllSubEvents(event, events) {
    var result = [];
    Object.keys(events).forEach(function (i) {
        const a = i.slice(event.length);
        if (a[0] === '.') {
            result.push(i);
        }
    });

    return result;
}

function findSubscriber(allContexts, context) {
    for (var i = 0; i < allContexts.length; i++) {
        if (allContexts[i].data === context) {
            return i;
        }
    }

    return -1;
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
