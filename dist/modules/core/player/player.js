"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var base_component_1 = require("../../component/base-component");
var finance_1 = require("./finance");
var route_1 = require("../route");
var logger_1 = require("../../../util/logger");
var types_1 = require("../../../types/types");
var util_1 = require("../../../util/util");
var constants_1 = require("../../../util/constants");
/**
 * @constructor
 * @param {string}            name       - String with name.
 * @param {number}            startGold  - Number with start gold.
 * @param {PlayerType}        playerType - PlayerType either human or computer.
 * @param {City}              startCity  - City describing the start location.
 *
 * @param {Finance}           finance    - (optional) Finance instance.
 * @param {PlayerLevel}       level      - (optional) PlayerLevel.
 * @param {QueuedRouteItem[]} queue      - (optional) Array of queued Routes.
 * @param {Route[]}           routes     - (optional) Array of Routes.
 * @param {Upgrade[]}         upgrades   - (optional) Array of Upgrades.
 * @param {boolean}           isActive   - (optional) Boolean with active specifier.
 * @param {string}            id         - (optional) String number describing id.
 */
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(name, startGold, playerType, startCity, finance, level, queue, routes, upgrades, isActive, id) {
        var _this = _super.call(this, name, id) || this;
        _this.getStartCity = function () { return _this._startCity; };
        _this.getFinance = function () { return _this._finance; };
        _this.getLevel = function () { return _this._level; };
        _this.getRange = function () { return _this._range; };
        _this.getQueue = function () { return _this._queue; };
        _this.getRoutes = function () { return _this._routes; };
        _this.getUpgrades = function () { return _this._upgrades; };
        _this.isActive = function () { return _this._isActive; };
        /**
         * Handle Player events by checking if level should be increased.
         * Then handle Route queue, built Routes and Finance.
         *
         * @param {HandleTurnInfo} info - Object with relevant turn information.
         *
         * @param {Nardis}         game - (optional) Nardis game instance.
         */
        _this.handleTurn = function (info, game) {
            if (_this._isActive) {
                _this.checkLevel();
                _this.handleQueue();
                _this.handleRoutes(info);
                _this.handleFinance(info);
            }
            else {
                _this.handleFinance(__assign(__assign({}, info), { playerData: { routes: [], queue: [], upgrades: [] } }));
            }
        };
        /**
         * Check if level should be increased and act accordingly.
         */
        _this.checkLevel = function () {
            if (_this.shouldLevelBeIncreased()) {
                _this.increaseLevel();
            }
        };
        /**
         * Merge current Route array with another,
         *
         * @param   {Route[]} routes - Array of Routes to append to active Route array.
         *
         * @returns {number}  Number with amount of Routes appended to Player.
         */
        _this.mergeRoutes = function (routes) {
            _this._routes = _this._routes.concat(routes);
            return routes.length;
        };
        /**
         * Merge current queue array with another,
         *
         * @param   {QueuedRouteItem[]} queue - Array of QueuedRouteItem to append to current queue array.
         *
         * @returns {number}            Number with amount of Routes appended to Player.
         */
        _this.mergeQueue = function (queue) {
            _this._queue = _this._queue.concat(queue);
            return queue.length;
        };
        /**
         * Set Player to inactive. Also removes all Routes and Upgrades.
         */
        _this.setInactive = function () {
            _this.log("setting player inactive");
            _this._routes = [], _this._queue = [], _this._upgrades = [];
            _this._isActive = false;
        };
        /**
         * Add Route to queue.
         *
         * @param {Route} route    - Route instance to be added.
         * @param {Route} turnCost - Number describing turn cost.
         */
        _this.addRouteToQueue = function (route, turnCost) {
            _this.log("adding route '" + route.id + "' to queue with turn cost " + turnCost);
            route.getCityOne().incrementRouteCount();
            route.getCityTwo().incrementRouteCount();
            _this._queue.push({
                route: route,
                turnCost: turnCost
            });
        };
        /**
         * Remove Route from queue.
         *
         * @param   {string}  id - String with id of Route to remove.
         *
         * @returns {boolean} True if the Route was removed from queue else false.
         */
        _this.removeRouteFromQueue = function (id) {
            for (var i = 0; i < _this._queue.length; i++) {
                var _a = _this._queue[i], route = _a.route, turnCost = _a.turnCost;
                if (route.id === id) {
                    _this.log("removing route '" + route.id + "' from queue with turns " + turnCost + " left");
                    route.getCityOne().decrementRouteCount();
                    route.getCityTwo().decrementRouteCount();
                    _this._queue.splice(i, 1);
                    return true;
                }
            }
            _this.log("cannot remove route '" + id + "' from queue: not found");
            return false;
        };
        /**
         * Remove Route from routes.
         *
         * @param   {string}  id - String with id of Route to remove.
         *
         * @returns {boolean} True if the Route was removed from queue else false.
         */
        _this.removeRouteFromRoutes = function (id) {
            for (var i = 0; i < _this._routes.length; i++) {
                var route = _this._routes[i];
                if (route.id === id) {
                    _this.log("removing route '" + route.id + "' from active routes");
                    route.getCityOne().decrementRouteCount();
                    route.getCityTwo().decrementRouteCount();
                    _this._routes.splice(i, 1);
                    return true;
                }
            }
            _this.log("cannot remove route '" + id + "' from active routes: not found");
            return false;
        };
        /**
         * Add Upgrade.
         *
         * @param {Upgrade} upgrade - Upgrade to add.
         */
        _this.addUpgrade = function (upgrade) {
            _this._upgrades.push(upgrade);
        };
        /**
         * @returns {string} String with JSON stringified property keys and values.
        */
        _this.deconstruct = function () { return JSON.stringify({
            name: _this.name,
            playerType: _this.playerType,
            level: _this._level,
            id: _this.id,
            startCityId: _this._startCity.id,
            startGold: _this.startGold,
            finance: _this._finance.deconstruct(),
            queue: _this._queue.map(function (queued) { return ({
                route: queued.route.deconstruct(),
                turnCost: queued.turnCost
            }); }),
            routes: _this._routes.map(function (route) { return route.deconstruct(); }),
            upgrades: _this._upgrades.map(function (upgrade) { return ({
                id: upgrade.id
            }); }),
            isActive: _this._isActive
        }); };
        /**
         * Handle all Routes in queue by checking current turn cost,
         * If non-positive, remove from queue and add to Routes,
         * else decrement current turn cost by one.
         */
        _this.handleQueue = function () {
            var completed = [];
            _this.log("handling " + _this._queue.length + " queue items");
            for (var i = 0; i < _this._queue.length; i++) {
                if (_this._queue[i].turnCost <= 0) {
                    _this._routes.push(_this._queue[i].route);
                    completed.push(_this._queue[i].route.id);
                }
                else {
                    _this._queue[i].turnCost--;
                }
            }
            _this.log("handled " + _this._queue.length + " queue items and finished " + completed.length + " of them");
            _this._queue = _this._queue.filter(function (item) { return !(completed.indexOf(item.route.id) > -1); });
        };
        /**
         * Handle all Routes each turn.
         *
         * @param {HandleTurnInfo} info - Object with relevant turn information.
         */
        _this.handleRoutes = function (info) {
            _this._routes.forEach(function (route) {
                route.handleTurn(info);
            });
        };
        /**
         * Handle Finance each turn.
         *
         * @param {HandleTurnInfo} info - Object with relevant turn information.
         */
        _this.handleFinance = function (info) {
            _this._finance.handleTurn(info);
        };
        /**
         * @returns {boolean} True if level should be increased else false.
         */
        _this.shouldLevelBeIncreased = function () {
            if (_this._level < types_1.PlayerLevel.Master) {
                var requirements = constants_1.levelUpRequirements[_this._level + 1];
                var r = _this._routes.length >= requirements.routes;
                var a = _this._finance.getAverageRevenue() >= requirements.revenuePerTurn;
                var g = _this._finance.getGold() >= requirements.gold;
                _this.log("met level up requirements: routes=" + r + ", revenue=" + a + ", gold=" + g);
                return r && a && g;
            }
            return false;
        };
        /**
         * @returns {boolean} True if level did increase else false.
         */
        _this.increaseLevel = function () {
            var newLevel = util_1.getPlayerLevelFromNumber(_this._level + 1);
            if (newLevel !== types_1.PlayerLevel.None) {
                var r = _this._range;
                _this._level = newLevel;
                _this._range = _this.getRangeFromLevel();
                _this.log("increasing level " + (_this._level - 1) + "->" + _this._level);
                _this.log("increasing range " + r + "->" + _this._range);
                return true;
            }
            return false;
        };
        /**
         * @returns {number} Number describing maximum Route distance given current level.
         */
        _this.getRangeFromLevel = function () {
            return constants_1.rangePerLevel[_this._level] || _this._range;
        };
        _this.startGold = startGold;
        _this.playerType = playerType;
        _this._startCity = startCity;
        _this._finance = util_1.isDefined(finance) ? finance : new finance_1.default(_this.name, _this.id, _this.startGold);
        _this._level = util_1.isDefined(level) ? level : types_1.PlayerLevel.Novice;
        _this._queue = util_1.isDefined(queue) ? queue : [];
        _this._routes = util_1.isDefined(routes) ? routes : [];
        _this._upgrades = util_1.isDefined(upgrades) ? upgrades : [];
        _this._isActive = util_1.isDefined(isActive) ? isActive : true;
        _this._range = _this.getRangeFromLevel();
        _this.log = logger_1.default.log.bind(null, (playerType === types_1.PlayerType.Human ? types_1.LogLevel.All : types_1.LogLevel.Opponent), "player-" + _this.name);
        return _this;
    }
    /**
     * Get Player instance from stringified JSON.
     *
     * @param   {string}     stringifiedJSON - String with information to be used.
     * @param   {City[]}     cities          - City instances used in the current game.
     * @param   {Train[]}    trains          - Train instances used in the current game.
     * @param   {Resource[]} resources       - Resource instances used in the current game.
     * @param   {Upgrades[]} upgrades        - Upgrade instances used in the current game.
     *
     * @returns {Player}     Player instance created from stringifiedJSON.
     */
    Player.createFromStringifiedJSON = function (stringifiedJSON, cities, trains, resources, upgrades) {
        var parsedJSON = JSON.parse(stringifiedJSON);
        return new Player(parsedJSON.name, parsedJSON.startGold, parsedJSON.playerType, cities.filter(function (e) { return e.id === parsedJSON.startCityId; })[0], finance_1.default.createFromStringifiedJSON(parsedJSON.finance), parsedJSON.level, parsedJSON.queue.map(function (e) { return ({
            route: route_1.default.createFromStringifiedJSON(e.route, cities, trains, resources),
            turnCost: e.turnCost
        }); }), parsedJSON.routes.map(function (e) { return route_1.default.createFromStringifiedJSON(e, cities, trains, resources); }), parsedJSON.upgrades.map(function (e) { return upgrades.filter(function (j) { return j.id === e.id; })[0]; }), parsedJSON.isActive, parsedJSON.id);
    };
    return Player;
}(base_component_1.default));
exports.default = Player;
