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
var constants_1 = require("../../../util/constants");
var util_1 = require("../../../util/util");
var base_component_1 = require("../../component/base-component");
var Stock = /** @class */ (function (_super) {
    __extends(Stock, _super);
    function Stock(name, owningPlayerId, value, valueHistory, supply, id) {
        var _a;
        var _this = _super.call(this, name, id) || this;
        _this.getBuyValue = function () { return Math.floor(_this._value * constants_1.stockConstant.multipliers.stockBuy); };
        _this.getSellValue = function () { return _this._value; };
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
            return false;
        };
        _this.sellStock = function (playerId) {
            if (util_1.isDefined(_this._supply[playerId]) && _this._supply[playerId] > 0) {
                _this._supply[playerId] -= 1;
                return true;
            }
            return false;
        };
        _this.currentAmountOfStockHolders = function () { return (Object.keys(_this._supply).map(function (key) { return (_this._supply[key]); }).reduce(function (a, b) { return a + b; }, 0)); };
        _this.setValue = function (value) {
            _this._value = value;
        };
        _this.updateValue = function (finance, routes, turn) {
            var newValue = (Math.floor(routes * constants_1.stockConstant.multipliers.routeLength) +
                Math.floor(finance.getAverageRevenue() / constants_1.stockConstant.divisors.avgRevenue) +
                Math.floor(_this.currentAmountOfStockHolders() * constants_1.stockConstant.multipliers.stockHolder)) + Math.floor(finance.getTotalProfits() / constants_1.stockConstant.divisors.totalProfits);
            if (newValue !== _this._value) {
                _this.updateValueHistory(newValue, turn);
                _this._value = newValue;
            }
        };
        /**
         *
         */
        _this.deconstruct = function () { return JSON.stringify(_this); };
        /**
         *
         * @param value
         * @param turn
         */
        _this.updateValueHistory = function (value, turn) {
            if (_this._valueHistory.length >= constants_1.MAX_VALUE_HISTORY_LENGTH) {
                _this._valueHistory.shift();
            }
            _this._valueHistory.push({
                value: value,
                turn: turn
            });
        };
        _this._owningPlayerId = owningPlayerId;
        _this._value = util_1.isDefined(value) ? value : Math.floor(constants_1.stockConstant.startingShares * constants_1.stockConstant.multipliers.stockHolder);
        _this._valueHistory = util_1.isDefined(valueHistory) ? valueHistory : [{
                value: _this._value,
                turn: 1
            }];
        _this._supply = util_1.isDefined(supply) ? supply : (_a = {},
            _a[_this._owningPlayerId] = constants_1.stockConstant.startingShares,
            _a);
        return _this;
    }
    /**
     * Get Stock instance from stringified JSON.
     *
     * @param {string}     stringifiedJSON - string with information to be used
     *
     * @return {Stock}                     Stock instance created from the model
     */
    Stock.createFromStringifiedJSON = function (stringifiedJSON) {
        var parsedJSON = typeof stringifiedJSON === 'string' ? JSON.parse(stringifiedJSON) : stringifiedJSON;
        return new Stock(parsedJSON.name, parsedJSON._owningPlayerId, parsedJSON._value, parsedJSON._valueHistory, parsedJSON._supply, parsedJSON.id);
    };
    return Stock;
}(base_component_1.default));
exports.default = Stock;
