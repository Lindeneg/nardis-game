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
var constants_1 = require("../../../util/constants");
var types_1 = require("../../../types/types");
/**
 * @constructor
 * @param {string}         name         - string with name
 * @param {number}         gold         - number with current gold
 *
 * @param {FinanceHistory} history      - (optional) FinanceHistory object
 * @param {FinanceTotal}   totalHistory - (optional) FinanceTotal object
 * @param {number}         totalProfits - (optional) Number with total profits.
 * @param {string}         id           - (optional) string number describing id
 */
var Finance = /** @class */ (function (_super) {
    __extends(Finance, _super);
    function Finance(name, gold, history, totalHistory, totalProfits, id) {
        var _a;
        var _this = _super.call(this, name, id) || this;
        _this.getGold = function () { return _this._gold; };
        _this.getHistory = function () { return _this._history; };
        _this.getTotalHistory = function () { return _this._totalHistory; };
        _this.getTotalProfits = function () { return _this._totalProfits; };
        /**
        * Handle Finance events at each turn
        *
        * @param  {HandleTurnInfo}  info - object with relevant turn information
        */
        _this.handleTurn = function (info) {
            _this.handleStartTurn();
            if (info.playerData.routes.length > 0) {
                info.playerData.routes.forEach(function (route) {
                    _this.handleRoute(route, info.playerData.upgrades);
                });
            }
        };
        /**
        * Add entry to expense object from the turn at hand
        *
        * @param {FinanceType} type   - FinanceType of the expense
        * @param {string}      id     - string with id of the expense
        * @param {number}      amount - number with amount of the expense
        * @param {number}      value  - number with value of the expense
        */
        _this.addToFinanceExpense = function (type, id, amount, value) {
            _this.addToTotalHistory(constants_1.localKeys[type], amount * value);
            _this._totalProfits -= amount * value;
            _this.addNthTurnObject(types_1.FinanceGeneralType.Expense, type, id, amount, value);
        };
        /**
        * Remove entry from expense object.
        *
        * @param {FinanceType} type   - FinanceType of the expense to be removed
        * @param {string}      id     - string with id of the expense to be removed
        *
        * @returns {boolean}            true if removed else false
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
        * @returns {number} number that describes the revenue in gold over the last three turns
        */
        _this.getAverageRevenue = function () {
            var keys = Object.keys(_this._history.income);
            var sum = 0;
            keys.forEach(function (key) {
                sum += _this._history.income[key].reduce(function (prev, cur) { return prev + (cur.amount * cur.value); }, 0);
            });
            return Math.round(sum / keys.length);
        };
        /**
        * Set nthTurn array of income and expense object to an empty array
        */
        _this.handleStartTurn = function () {
            _this.updateHistoryItemsOnStartedTurn(_this._history.income);
            _this.updateHistoryItemsOnStartedTurn(_this._history.expense);
        };
        /**
        * Check if a Route has arrived and handle income accordingly
        *
        * @param {Route} route - Route to be checked and handled
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
         * Get Train upkeep with Player upgrades taken into consideration
         *
        * @return {number} - number with the correct Train upkeep
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
        * Add to gold count
        *
        * @param {number} value - number with gold to be added
        */
        _this.addGold = function (value) {
            _this._gold += value;
        };
        /**
        * Remove gold from count
        *
        * @param {number} value - number with gold to be subtracted
        */
        _this.removeGold = function (value) {
            _this._gold -= value;
        };
        /**
        * Add entry to FinanceTotal.
        *
        * @param {string} id    - string with id of the entry target
        * @param {number} value - number with value to add to target
        */
        _this.addToTotalHistory = function (id, value) {
            if (typeof _this._totalHistory[id] !== 'undefined') {
                _this._totalHistory[id] += value;
            }
            else {
                _this._totalHistory[id] = value;
            }
        };
        /**
        * Remove entry from FinanceTotal.
        *
        * @param {string} id    - string with id of the entry target
        * @param {number} value - number with value to remove from target
        */
        _this.removeFromTotalHistory = function (id, value) {
            if (typeof _this._totalHistory[id] !== 'undefined') {
                _this._totalHistory[id] -= value;
            }
        };
        /**
        * Add entry to any nthTurn object
        *
        * @param {FinanceGeneralType} generalType - FinanceGeneralType of the entry
        * @param {FinanceType}        type   - FinanceType of the expense
        * @param {string}             id     - string with id of the expense
        * @param {number}             amount - number with amount of the expense
        * @param {number}             value  - number with value of the expense
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
        * Shift each entry one place forward and then reset the nthTurn array
        *
        * @param {FinanceHistoryItem} item - FinanceHistoryItem to be shifted
        */
        _this.updateHistoryItemsOnStartedTurn = function (item) {
            item.nthTurnMinusTwo = item.nthTurnMinusOne;
            item.nthTurnMinusOne = item.nthTurn;
            item.nthTurn = [];
        };
        /**
        * @returns {FinanceHistory} FinanceHistory default starting state
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
        _this._gold = gold;
        _this._history = history ? history : _this.getInitialHistoryState();
        _this._totalProfits = totalProfits ? totalProfits : 0;
        _this._totalHistory = totalHistory ? totalHistory : (_a = {},
            _a[constants_1.localKeys[types_1.FinanceType.Train]] = 0,
            _a[constants_1.localKeys[types_1.FinanceType.Track]] = 0,
            _a[constants_1.localKeys[types_1.FinanceType.Upkeep]] = 0,
            _a[constants_1.localKeys[types_1.FinanceType.Upgrade]] = 0,
            _a);
        return _this;
    }
    /**
     * Get Finance instance from stringified JSON.
     *
    * @param {string}     stringifiedJSON - string with information to be used
    *
    * @return {Finance}                     Finance instance created from the model
    */
    Finance.createFromStringifiedJSON = function (stringifiedJSON) {
        var parsedJSON = JSON.parse(stringifiedJSON);
        return new Finance(parsedJSON.name, parsedJSON._gold, parsedJSON._history, parsedJSON._totalHistory, parsedJSON._totalProfits, parsedJSON.id);
    };
    return Finance;
}(base_component_1.default));
exports.default = Finance;
