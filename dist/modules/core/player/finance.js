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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var base_component_1 = require("../../component/base-component");
var util_1 = require("../../../util/util");
var constants_1 = require("../../../util/constants");
var types_1 = require("../../../types/types");
/**
 * @constructor
 * @param {string}         name         - String with name.
 * @param {string}         playerId     - String with owning playerId.
 * @param {number}         gold         - Number with current gold.
 *
 * @param {FinanceHistory} history      - (optional) FinanceHistory object.
 * @param {FinanceTotal}   totalHistory - (optional) FinanceTotal object.
 * @param {number}         totalProfits - (optional) Number with total profits.
 * @param {number}         netWorth     - (optional) Number with net worth.
 * @param {StockHolding}   stock        - (optional) StockHolding object.
 * @param {string}         id           - (optional) String number describing id.
 */
var Finance = /** @class */ (function (_super) {
    __extends(Finance, _super);
    function Finance(name, playerId, gold, history, totalHistory, totalProfits, netWorth, stocks, id) {
        var _a, _b;
        var _this = _super.call(this, name, id) || this;
        _this.getGold = function () { return _this._gold; };
        _this.getHistory = function () { return _this._history; };
        _this.getTotalHistory = function () { return _this._totalHistory; };
        _this.getTotalProfits = function () { return _this._totalProfits; };
        _this.getNetWorth = function () { return _this._netWorth; };
        _this.getStocks = function () { return _this._stocks; };
        /**
         * Handle Finance events at each turn.
         *
         * @param  {HandleTurnInfo}  info - Object with relevant turn information.
         */
        _this.handleTurn = function (info) {
            _this.handleStartTurn();
            if (info.playerData.routes.length > 0) {
                info.playerData.routes.forEach(function (route) {
                    _this.handleRoute(route, info.playerData.upgrades);
                });
            }
            _this.updateNetWorth(info.playerData);
        };
        /**
         * Add entry to expense object from the turn at hand.
         *
         * @param {FinanceType} type   - FinanceType of the expense.
         * @param {string}      id     - String with id of the expense.
         * @param {number}      amount - Number with amount of the expense.
         * @param {number}      value  - Number with value of the expense.
         */
        _this.addToFinanceExpense = function (type, id, amount, value) {
            _this.addToTotalHistory(constants_1.localKeys[type], amount * value);
            _this._totalProfits -= amount * value;
            _this.addNthTurnObject(types_1.FinanceGeneralType.Expense, type, id, amount, value);
        };
        /**
         * Remove entry from expense object.
         *
         * @param   {FinanceType} type   - FinanceType of the expense to be removed.
         * @param   {string}      id     - string with id of the expense to be removed.
         *
         * @returns {boolean}     True if removed else false.
         */
        _this.removeFromFinanceExpense = function (type, id) {
            var targets = Object.keys(_this._history.expense).map(function (e) { return _this._history.expense[e]; });
            for (var i = 0; i < targets.length; i++) {
                var target = targets[i];
                for (var j = 0; j < target.length; j++) {
                    if (target[j].type === type && target[j].id === id) {
                        var value = target[j].amount * target[j].value;
                        target.splice(j, 1);
                        _this._totalProfits += value;
                        _this.removeFromTotalHistory(constants_1.localKeys[type], value);
                        _this.addGold(value);
                        return true;
                    }
                }
            }
            return false;
        };
        /**
         * @returns {number} Number that describes the revenue in gold over the last three turns.
         */
        _this.getAverageRevenue = function () { return _this.getAverageHistory(_this._history.income); };
        /**
         * @returns {number} Number that describes the expense in gold over the last three turns.
         */
        _this.getAverageExpense = function () { return _this.getAverageHistory(_this._history.expense); };
        /**
         * Add to gold from a deleted Route.
         *
         * @param {number} value - Number wih gold to recoup.
         */
        _this.recoupDeletedRoute = function (value) {
            var id = constants_1.localKeys[types_1.FinanceType.Recoup];
            _this.addToTotalHistory(id, value);
            _this._totalProfits += value;
            _this.addNthTurnObject(types_1.FinanceGeneralType.Income, types_1.FinanceType.Recoup, id, 1, value);
        };
        /**
         * Update the net worth of the owning Player.
         *
         * @param {PlayerData} data - Object with PlayerData.
         */
        _this.updateNetWorth = function (data) {
            _this._netWorth = __spreadArrays(data.queue.map(function (queue) { return queue.route; }), data.routes).map(function (route) { return (Math.floor(route.getCost() / constants_1.netWorthDivisors.tracks) +
                Math.floor(route.getTrain().cost / constants_1.netWorthDivisors.train)); }).reduce(function (a, b) { return a + b; }, data.upgrades.map(function (upgrade) { return (Math.floor(upgrade.cost / constants_1.netWorthDivisors.upgrade)); }).reduce(function (a, b) { return a + b; }, _this.getValueOfOwnedStock(data.gameStocks) + Math.floor(_this._gold / constants_1.netWorthDivisors.gold)));
        };
        /**
         * Add Stock to StockHolding and handle expense.
         *
         * @param {string} playerId - String with id of the owning player of Stock to add.
         * @param {number} value    - BuyValue of the Stock.
         */
        _this.buyStock = function (playerId, value) {
            if (util_1.isDefined(_this._stocks[playerId])) {
                _this._stocks[playerId] += 1;
            }
            else {
                _this._stocks[playerId] = 1;
            }
            _this.addToFinanceExpense(types_1.FinanceType.StockBuy, constants_1.localKeys[types_1.FinanceType.StockBuy], 1, value);
        };
        /**
         * Remove Stock from StockHolding and handle income.
         *
         * @param {string} playerId - String with id of the owning player of Stock to remove.
         * @param {number} value    - SellValue of the Stock.
         */
        _this.sellStock = function (playerId, value) {
            if (util_1.isDefined(_this._stocks[playerId]) && _this._stocks[playerId] > 0) {
                _this._stocks[playerId] -= 1;
                _this.addNthTurnObject(types_1.FinanceGeneralType.Income, types_1.FinanceType.StockSell, constants_1.localKeys[types_1.FinanceType.StockSell], 1, value);
                _this._totalProfits += value;
                _this.addToTotalHistory(constants_1.localKeys[types_1.FinanceType.StockSell], value);
            }
        };
        /**
         * @returns {string} String with JSON stringified property keys and values.
         */
        _this.deconstruct = function () { return JSON.stringify(_this); };
        /**
         * Set nthTurn array of income and expense object to an empty array.
         */
        _this.handleStartTurn = function () {
            _this.updateHistoryItemsOnStartedTurn(_this._history.income);
            _this.updateHistoryItemsOnStartedTurn(_this._history.expense);
        };
        /**
         * @param   {FinanceHistoryItem} historyItem - History object to average.
         *
         * @returns {number}             Number with average value of the history item.
         */
        _this.getAverageHistory = function (historyItem) {
            var keys = Object.keys(historyItem);
            return Math.round(keys.map(function (key) { return historyItem[key]
                .reduce(function (a, b) { return a + (b.amount * b.value); }, 0); })
                .reduce(function (a, b) { return a + b; }, 0) /
                keys.length);
        };
        /**
         * Check if a Route has arrived and handle income accordingly.
         *
         * @param {Route}     route    - Route to be checked and handled.
         * @param {Upgrade[]} upgrades - Upgrades to be accounted for.
         */
        _this.handleRoute = function (route, upgrades) {
            var state = route.getRouteState();
            var train = route.getTrain();
            var upkeep = _this.getTrainUpkeep(train, upgrades);
            route.subtractFromProfit(upkeep);
            _this.addToFinanceExpense(types_1.FinanceType.Upkeep, train.id, 1, upkeep);
            if (state.hasArrived) {
                state.cargo.forEach(function (cargo) {
                    if (state.destination.isDemand(cargo.resource)) {
                        var value = cargo.actualAmount * cargo.resource.getValue();
                        route.addToProfit(value);
                        _this._totalProfits += value;
                        _this.addToTotalHistory(cargo.resource.id, value);
                        _this.addNthTurnObject(types_1.FinanceGeneralType.Income, types_1.FinanceType.Resource, cargo.resource.id, cargo.actualAmount, cargo.resource.getValue());
                    }
                });
            }
        };
        /**
         * Get Train upkeep with Player upgrades taken into consideration.
         *
         * @param   {Train}     train    - Train to get upkeep from.
         * @param   {Upgrade[]} upgrades - Upgrades to be accounted for.
         *
         * @returns {number}    Number with the correct Train upkeep.
         */
        _this.getTrainUpkeep = function (train, upgrades) {
            var relevantUpgrades = upgrades.filter(function (e) { return e.type === types_1.UpgradeType.TrainUpkeepCheaper; });
            var upkeep = train.upkeep;
            if (relevantUpgrades.length > 0) {
                relevantUpgrades.forEach(function (e) {
                    upkeep -= Math.floor(upkeep * e.value);
                });
            }
            return upkeep;
        };
        /**
         * Add to gold count.
         *
         * @param {number} value - Number with gold to be added.
         */
        _this.addGold = function (value) {
            _this._gold += value;
        };
        /**
         * Remove gold from count.
         *
         * @param {number} value - number with gold to be subtracted.
         */
        _this.removeGold = function (value) {
            _this._gold -= value;
        };
        /**
         * Get total value of the owning Player's current stock holdings.
         *
         * @param   {Stocks} stocks - Stocks object with all game Stock objects.
         *
         * @returns {number} Number with value of Stocks.
         */
        _this.getValueOfOwnedStock = function (stocks) {
            if (util_1.isDefined(stocks)) {
                return Object.keys(_this._stocks).map(function (key) { return (util_1.isDefined(stocks[key]) ? stocks[key].getSellValue() * _this._stocks[key] : 0); }).reduce(function (a, b) { return a + b; }, 0);
            }
            return 0;
        };
        /**
         * Add entry to FinanceTotal.
         *
         * @param {string} id    - String with id of the entry target.
         * @param {number} value - Number with value to add to target.
         */
        _this.addToTotalHistory = function (id, value) {
            if (util_1.isDefined(_this._totalHistory[id])) {
                _this._totalHistory[id] += value;
            }
            else {
                _this._totalHistory[id] = value;
            }
        };
        /**
         * Remove entry from FinanceTotal.
         *
         * @param {string} id    - String with id of the entry target.
         * @param {number} value - Number with value to remove from target.
         */
        _this.removeFromTotalHistory = function (id, value) {
            if (util_1.isDefined(_this._totalHistory[id])) {
                _this._totalHistory[id] -= value;
            }
        };
        /**
         * Add entry to any nthTurn object.
         *
         * @param {FinanceGeneralType} generalType - FinanceGeneralType of the entry.
         * @param {FinanceType}        type        - FinanceType of the expense.
         * @param {string}             id          - string with id of the expense.
         * @param {number}             amount      - number with amount of the expense.
         * @param {number}             value       - number with value of the expense.
         */
        _this.addNthTurnObject = function (generalType, type, id, amount, value) {
            var isIncome = generalType === types_1.FinanceGeneralType.Income;
            var object = {
                type: type,
                id: id,
                amount: amount,
                value: value
            };
            var target = isIncome ? _this._history.income : _this._history.expense;
            var goldTarget = isIncome ? _this.addGold : _this.removeGold;
            target.nthTurn.push(object);
            goldTarget(object.amount * object.value);
        };
        /**
         * Shift each entry one place forward and then reset the nthTurn array.
         *
         * @param {FinanceHistoryItem} item - FinanceHistoryItem to be shifted.
         */
        _this.updateHistoryItemsOnStartedTurn = function (item) {
            item.nthTurnMinusTwo = item.nthTurnMinusOne;
            item.nthTurnMinusOne = item.nthTurn;
            item.nthTurn = [];
        };
        /**
         * @returns {FinanceHistory} FinanceHistory default starting state.
         */
        _this.getInitialHistoryState = function () {
            return {
                income: {
                    nthTurn: [],
                    nthTurnMinusOne: [],
                    nthTurnMinusTwo: []
                },
                expense: {
                    nthTurn: [],
                    nthTurnMinusOne: [],
                    nthTurnMinusTwo: []
                }
            };
        };
        _this._playerId = playerId;
        _this._gold = gold;
        _this._history = util_1.isDefined(history) ? history : _this.getInitialHistoryState();
        _this._totalProfits = util_1.isDefined(totalProfits) ? totalProfits : 0;
        _this._totalHistory = util_1.isDefined(totalHistory) ? totalHistory : (_a = {},
            _a[constants_1.localKeys[types_1.FinanceType.Train]] = 0,
            _a[constants_1.localKeys[types_1.FinanceType.Track]] = 0,
            _a[constants_1.localKeys[types_1.FinanceType.Upkeep]] = 0,
            _a[constants_1.localKeys[types_1.FinanceType.Upgrade]] = 0,
            _a[constants_1.localKeys[types_1.FinanceType.Recoup]] = 0,
            _a[constants_1.localKeys[types_1.FinanceType.StockBuy]] = 0,
            _a[constants_1.localKeys[types_1.FinanceType.StockSell]] = 0,
            _a);
        _this._netWorth = util_1.isDefined(netWorth) ? netWorth : _this._gold + Math.floor(constants_1.stockConstant.startingShares * constants_1.stockConstant.multipliers.stockHolder);
        _this._stocks = util_1.isDefined(stocks) ? stocks : (_b = {},
            _b[_this._playerId] = constants_1.stockConstant.startingShares,
            _b);
        return _this;
    }
    /**
     * Get Finance instance from stringified JSON.
     *
     * @param   {string}     stringifiedJSON - String with information to be used.
     *
     * @returns {Finance}    Finance instance created from the model.
     */
    Finance.createFromStringifiedJSON = function (stringifiedJSON) {
        var parsedJSON = typeof stringifiedJSON === 'string' ? JSON.parse(stringifiedJSON) : stringifiedJSON;
        return new Finance(parsedJSON.name, parsedJSON._playerId, parsedJSON._gold, parsedJSON._history, parsedJSON._totalHistory, parsedJSON._totalProfits, parsedJSON._netWorth, parsedJSON._stocks, parsedJSON.id);
    };
    return Finance;
}(base_component_1.default));
exports.default = Finance;
