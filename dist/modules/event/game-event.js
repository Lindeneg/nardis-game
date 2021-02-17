"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("../../types/types");
var constants_1 = require("../../util/constants");
// TODO
var NardisEvent = /** @class */ (function () {
    function NardisEvent() {
    }
    NardisEvent.gameEvents = [];
    NardisEvent.currentGameEvents = [];
    NardisEvent.getAllEvents = function () { return NardisEvent.gameEvents; };
    NardisEvent.getGameEvents = function () { return NardisEvent.gameEvents.filter(function (e) { return e.level === types_1.EventLogLevel.GAME; }); };
    NardisEvent.getCurrentGameEvents = function () { return NardisEvent.currentGameEvents.filter(function (e) { return e.level === types_1.EventLogLevel.GAME; }); };
    NardisEvent.logEvent = function (event) {
        NardisEvent.currentGameEvents.push(event);
        if (event.level <= NardisEvent.getEventLogLevel()) {
            console.log('nardis ' + constants_1.eventLogLevelName[event.level] + ' ' + event.origin + ': ' + event.message);
        }
    };
    NardisEvent.endTurn = function () {
        NardisEvent.gameEvents = __spreadArrays(NardisEvent.gameEvents, NardisEvent.currentGameEvents);
        NardisEvent.currentGameEvents = [];
    };
    NardisEvent.getEventLogLevel = function () {
        window.location.search.replace('?', '').split('&').filter(function (param) {
            var _a = param.split('='), key = _a[0], value = _a[1];
            if (key === 'nd') {
                var level = parseInt(value);
                return Number.isNaN(level) ? types_1.EventLogLevel.GAME : level;
            }
        });
        return types_1.EventLogLevel.GAME;
    };
    return NardisEvent;
}());
exports.default = NardisEvent;
