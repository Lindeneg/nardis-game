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
var logger_1 = require("../../../util/logger");
var constants_1 = require("../../../util/constants");
var util_1 = require("../../../util/util");
var types_1 = require("../../../types/types");
/**
 * @constructor
 * @param {string}         name           - Name of the Stock instance.
 * @param {string}         owningPlayerId - String with Id of owning Player.
 *
 * @param {number}         value          - (optional) Number with Stock sell value.
 * @param {ValueHistory[]} valueHistory   - (optional) Object with Stock ValueHistory.
 * @param {StockSupply}    supply         - (optional) Object with StockSupply.
 * @param {boolean}        isActive       - (optional) Boolean with active specifier.
 * @param {string}         id             - (optional) String number describing id.
 */
var Stock = /** @class */ (function (_super) {
    __extends(Stock, _super);
    function Stock(name, owningPlayerId, value, valueHistory, supply, isActive, id) {
        var _a;
        var _this = _super.call(this, name, id) || this;
        _this.getBuyValue = function () { return Math.floor(_this._value * constants_1.stockConstant.multipliers.stockBuy); };
        _this.getSellValue = function () { return _this._value; };
        _this.getSupply = function () { return _this._supply; };
        _this.getHistory = function () { return _this._valueHistory; };
        _this.isActive = function () { return _this._isActive; };
        /**
         * Set Stock as inactive.
         *
         * @param {number} turn - Number with current turn at hand.
         */
        _this.setInactive = function (turn) {
            _this.log('setting stock inactive');
            _this._value = 0;
            _this._valueHistory.push({ turn: turn, value: _this._value });
            _this._isActive = false;
        };
        /**
         * Get buyout value for all Stock holders, if there's no Stock supply left.
         *
         * @returns {BuyOutValue[]} Array of BuyOutValue objects.
         */
        _this.getBuyOutValues = function () {
            var buyOutValues = [];
            if (_this.currentAmountOfStockHolders() >= constants_1.stockConstant.maxStockAmount) {
                buyOutValues.push.apply(buyOutValues, Object.keys(_this._supply).map(function (id) { return ({
                    totalValue: Math.floor(_this._supply[id] * _this._value),
                    shares: _this._supply[id],
                    id: id
                }); }));
            }
            return buyOutValues;
        };
        /**
         * Buy Stock to the specified playerId.
         *
         * @param   {string}  playerId - String with playerId to buy Stock to.
         *
         * @returns {boolean} True if Stock was bought else false.
         */
        _this.buyStock = function (playerId) {
            if (_this.currentAmountOfStockHolders() + 1 <= constants_1.stockConstant.maxStockAmount) {
                if (!util_1.isDefined(_this._supply[playerId])) {
                    _this._supply[playerId] = 1;
                }
                else {
                    _this._supply[playerId] += 1;
                }
                return true;
            }
            _this.log("could not buy stock for '" + playerId + "': supply exhausted");
            return false;
        };
        /**
         * Sell Stock from the specified playerId.
         *
         * @param   {string}  playerId - String with playerId to sell Stock from.
         *
         * @param   {number}  amount   - (optional) Number with share amount to sell.
         *
         * @returns {boolean} True if Stock was sold else false.
         */
        _this.sellStock = function (playerId, amount) {
            if (amount === void 0) { amount = 1; }
            if (util_1.isDefined(_this._supply[playerId]) && _this._supply[playerId] - amount >= 0) {
                _this._supply[playerId] -= amount;
                return true;
            }
            _this.log("could not sell stock for '" + playerId + "': supply not found");
            return false;
        };
        /**
         * Get total amount of current Stock holders and their respective quantities.
         *
         * @returns {number} Number with total amount of owned Stock.
         */
        _this.currentAmountOfStockHolders = function () { return (Object.keys(_this._supply).map(function (key) { return (_this._supply[key]); }).reduce(function (a, b) { return a + b; }, 0)); };
        /**
         * Update base value of Stock.
         *
         * @param {Finance} finance - Finance instance of the owning Player.
         * @param {number}  routes  - Number with sum of Route and Queue length.
         * @param {number}  turn    - Number with current turn.
         */
        _this.updateValue = function (finance, routes, turn) {
            if (_this.isActive()) {
                var newValue = (Math.floor(routes * constants_1.stockConstant.multipliers.routeLength) +
                    Math.floor(finance.getAverageRevenue() / constants_1.stockConstant.divisors.avgRevenue) +
                    Math.floor(_this.currentAmountOfStockHolders() * constants_1.stockConstant.multipliers.stockHolder)) + ((turn > 1 ? Math.floor(finance.getTotalProfits() / constants_1.stockConstant.divisors.totalProfits) : 0) + constants_1.stockConstant.baseValue);
                if (newValue !== _this._value) {
                    _this.log("setting new value: " + _this._value + "->" + newValue);
                    _this.updateValueHistory(newValue, turn);
                    _this._value = newValue;
                }
            }
        };
        /**
         * Check if a Player holds any Stock.
         *
         * @param   {string}  playerId - String with player id to check.
         *
         * @returns {boolean} True if Player is Stock holder else false.
         *
         */
        _this.isStockHolder = function (playerId) { return (util_1.isDefined(_this._supply[playerId]) && _this._supply[playerId] > 0); };
        /**
         * @returns {string} String with JSON stringified property keys and values.
         */
        _this.deconstruct = function () { return JSON.stringify(_this); };
        /**
         * Update Stock value and ValueHistory.
         *
         * @param {number} value - Number with new value of the Stock.
         * @param {number} turn  - Number with current turn.
         */
        _this.updateValueHistory = function (value, turn) {
            if (turn > 1 && _this._valueHistory.length > 0 && _this._valueHistory[_this._valueHistory.length - 1].turn === turn) {
                _this._valueHistory[_this._valueHistory.length - 1].value = value;
            }
            else if (turn > 1) {
                _this._valueHistory.push({
                    value: value,
                    turn: turn
                });
            }
            else {
                _this.log("cannot update value to " + value + " in turn 1");
            }
        };
        _this.owningPlayerId = owningPlayerId;
        _this._value = util_1.isDefined(value) ? value : Math.floor(constants_1.stockConstant.startingShares * constants_1.stockConstant.multipliers.stockHolder) + constants_1.stockConstant.baseValue;
        _this._valueHistory = util_1.isDefined(valueHistory) ? valueHistory : [{
                value: _this._value,
                turn: 1
            }];
        _this._supply = util_1.isDefined(supply) ? supply : (_a = {},
            _a[_this.owningPlayerId] = constants_1.stockConstant.startingShares,
            _a);
        _this._isActive = util_1.isDefined(isActive) ? isActive : true;
        _this.log = logger_1.default.log.bind(null, types_1.LogLevel.All, "stock-'" + _this.owningPlayerId + "'");
        return _this;
    }
    /**
     * Get Stock instance from stringified JSON.
     *
     * @param   {string} stringifiedJSON - string with information to be used
     *
     * @returns {Stock}  Stock instance created from the model
     */
    Stock.createFromStringifiedJSON = function (stringifiedJSON) {
        var parsedJSON = typeof stringifiedJSON === 'string' ? JSON.parse(stringifiedJSON) : stringifiedJSON;
        return new Stock(parsedJSON.name, parsedJSON.owningPlayerId, parsedJSON._value, parsedJSON._valueHistory, parsedJSON._supply, parsedJSON._isActive, parsedJSON.id);
    };
    return Stock;
}(base_component_1.default));
exports.default = Stock;
