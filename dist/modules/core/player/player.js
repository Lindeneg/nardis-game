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
Object.defineProperty(exports, "__esModule", { value: true });
var base_component_1 = require("../../component/base-component");
var finance_1 = require("./finance");
var upgrade_1 = require("./upgrade");
var route_1 = require("../route");
var types_1 = require("../../../types/types");
var util_1 = require("../../../util/util");
var constants_1 = require("../../../util/constants");
/**
 * @constructor
 * @param {string}            name       - String with name.
 * @param {PlayerType}        playerType - PlayerType either human or computer.
 * @param {City}              startCity  - City describing the start location.
 *
 * @param {Finance}           finance    - (optional) Finance instance.
 * @param {PlayerLevel}       level      - (optional) PlayerLevel.
 * @param {QueuedRouteItem[]} queue      - (optional) Array of queued Routes.
 * @param {Route[]}           routes     - (optional) Array of Routes.
 * @param {Upgrade[]}         upgrades   - (optional) Array of Upgrades.
 * @param {string}            id         - (optional) String number describing id.
 */
var Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(name, playerType, startCity, finance, level, queue, routes, upgrades, id) {
        var _this = _super.call(this, name, id) || this;
        _this.getStartCity = function () { return _this._startCity; };
        _this.getFinance = function () { return _this._finance; };
        _this.getLevel = function () { return _this._level; };
        _this.getRange = function () { return _this._range; };
        _this.getQueue = function () { return _this._queue; };
        _this.getRoutes = function () { return _this._routes; };
        _this.getUpgrades = function () { return _this._upgrades; };
        /**
         * Handle Player events by checking if level should be increased.
         * Then handle Route queue, built Routes and Finance.
         *
         * @param {HandleTurnInfo} info - Object with relevant turn information.
         */
        _this.handleTurn = function (info) {
            if (_this.shouldLevelBeIncreased()) {
                _this.increaseLevel();
            }
            _this.handleQueue();
            _this.handleRoutes(info);
            _this.handleFinance(info);
        };
        /**
         * Add Route to queue.
         *
         * @param {Route} route    - Route instance to be added.
         * @param {Route} turnCost - Number describing turn cost.
         */
        _this.addRouteToQueue = function (route, turnCost) {
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
         * @param {string}    id - String with id of Route to remove.
         *
         * @returns {boolean}      True if the Route was removed from queue else false.
         */
        _this.removeRouteFromQueue = function (id) {
            for (var i = 0; i < _this._queue.length; i++) {
                var route = _this._queue[i].route;
                if (route.id === id) {
                    route.getCityOne().decrementRouteCount();
                    route.getCityTwo().decrementRouteCount();
                    _this._queue.splice(i, 1);
                    return true;
                }
            }
            return false;
        };
        /**
         * Remove Route from routes.
         *
         * @param {string}    id - String with id of Route to remove.
         *
         * @returns {boolean}      True if the Route was removed from queue else false.
         */
        _this.removeRouteFromRoutes = function (id) {
            for (var i = 0; i < _this._routes.length; i++) {
                var route = _this._routes[i];
                if (route.id === id) {
                    route.getCityOne().decrementRouteCount();
                    route.getCityTwo().decrementRouteCount();
                    _this._routes.splice(i, 1);
                    return true;
                }
            }
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
         * Handle all Routes in queue by checking current turn cost,
         * If non-positive, remove from queue and add to Routes,
         * else decrement current turn cost by one.
         */
        _this.handleQueue = function () {
            var completed = [];
            for (var i = 0; i < _this._queue.length; i++) {
                if (_this._queue[i].turnCost <= 0) {
                    _this._routes.push(_this._queue[i].route);
                    completed.push(_this._queue[i].route.id);
                }
                else {
                    _this._queue[i].turnCost--;
                }
            }
            _this._queue = _this._queue.filter(function (e) { return !(completed.indexOf(e.route.id) > -1); });
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
            var requirements = constants_1.levelUpRequirements[_this._level];
            if (requirements) {
                return (_this._routes.length >= requirements.routes &&
                    _this._finance.getAverageRevenue() >= requirements.revenuePerTurn &&
                    _this.gold >= requirements.gold);
            }
            return false;
        };
        /**
         * @returns {boolean} True if level did increase else false.
         */
        _this.increaseLevel = function () {
            var newLevel = util_1.getPlayerLevelFromNumber(_this._level + 1);
            if (newLevel !== types_1.PlayerLevel.None) {
                _this._level = newLevel;
                _this._range = _this.getRangeFromLevel();
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
        _this.playerType = playerType;
        _this._startCity = startCity;
        _this._finance = finance ? finance : new finance_1.default(_this.name, constants_1.START_GOLD);
        _this._level = level ? level : types_1.PlayerLevel.Novice;
        _this._queue = queue ? queue : [];
        _this._routes = routes ? routes : [];
        _this._upgrades = upgrades ? upgrades : [];
        _this._range = _this.getRangeFromLevel();
        _this.gold = (function () { return _this._finance.getGold(); })();
        return _this;
    }
    /**
     * Get Player instance from stringified JSON.
     *
     * @param {string}     stringifiedJSON - String with information to be used.
     * @param {City[]}     cities          - City instances used in the current game.
     * @param {Upgrades[]} upgrades        - Upgrade instances used in the current game.
     *
     * @return {Player}                      Player instance created from stringifiedJSON.
     */
    Player.createFromStringifiedJSON = function (stringifiedJSON, cities, trains, resources) {
        var parsedJSON = JSON.parse(stringifiedJSON);
        return new Player(parsedJSON.name, parsedJSON.playerType, cities.filter(function (e) { return e.id === parsedJSON._startCity.id; })[0], new finance_1.default(parsedJSON._finance.name, parsedJSON._finance._gold, parsedJSON._finance._history, parsedJSON._finance.id), parsedJSON._level, parsedJSON._queue.map(function (e) {
            return {
                route: route_1.default.createFromStringifiedJSON(JSON.stringify(e.route), cities, trains, resources),
                turnCost: e.turnCost
            };
        }), parsedJSON._routes.map(function (e) { return route_1.default.createFromStringifiedJSON(JSON.stringify(e), cities, trains, resources); }), parsedJSON._upgrades.map(function (e) { return upgrade_1.default.createFromStringifiedJSON(JSON.stringify(e)); }), parsedJSON.id);
    };
    return Player;
}(base_component_1.default));
exports.default = Player;
