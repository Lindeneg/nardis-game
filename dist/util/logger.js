"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
/**
 * Very basic static logging class for debugging purposes.
 */
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.turn = 0;
    Logger.setTurn = function (turn) {
        Logger.turn = turn;
        Logger.shouldLog(1) ? console.log('\n\n') : null;
    };
    Logger.log = function (level, origin, msg) {
        var rest = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            rest[_i - 3] = arguments[_i];
        }
        if (Logger.shouldLog(level)) {
            console.log.apply(console, __spreadArrays([("t" + Logger.turn + " : " + origin + " => " + msg).toLowerCase()], rest));
        }
    };
    Logger.shouldLog = function (level) {
        var n = parseInt(window['nardisDebug']);
        return util_1.isNumber(n) && n >= level;
    };
    return Logger;
}());
exports.default = Logger;
