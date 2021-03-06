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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var player_1 = require("../player");
var finance_1 = require("../finance");
var route_1 = require("../../route");
var util_1 = require("../../../../util/util");
var constants_1 = require("../../../../util/constants");
var types_1 = require("../../../../types/types");
/**
 * @constructor
 * @param {string}            name       - String with name.
 * @param {number}            startGold  - Number with start gold.
 * @param {City}              startCity  - City describing the start location.
 *
 * @param {Finance}           finance    - (optional) Finance instance.
 * @param {PlayerLevel}       level      - (optional) PlayerLevel.
 * @param {QueuedRouteItem[]} queue      - (optional) Array of queued Routes.
 * @param {Route[]}           routes     - (optional) Array of Routes.
 * @param {Upgrade[]}         upgrades   - (optional) Array of Upgrades.
 * @param {ActionSave}        save       - (optional) Object with save information.
 * @param {boolean}           isActive   - (optional) Boolean with active specifier.
 * @param {string}            id         - (optional) String number describing id.
 */
var Opponent = /** @class */ (function (_super) {
    __extends(Opponent, _super);
    function Opponent(name, startGold, startCity, finance, level, queue, routes, upgrades, save, isActive, id) {
        var _this = _super.call(this, name, startGold, types_1.PlayerType.Computer, startCity, finance, level, queue, routes, upgrades, isActive, id) || this;
        /**
         * Handle Opponent events and actions.
         *
         * @param {HandleTurnInfo} info - Object with relevant turn information.
         * @param {Nardis}         game - Nardis game instance.
         */
        _this.handleTurn = function (info, game) {
            if (_this._isActive) {
                if (_this.shouldLevelBeIncreased()) {
                    _this.increaseLevel();
                }
                _this.handleQueue();
                _this.handleRoutes(info);
                _this.handleFinance(info);
                _this.deduceAction(info, game);
            }
            else {
                _this.handleFinance(__assign(__assign({}, info), { playerData: { routes: [], upgrades: [], queue: [] } }));
            }
        };
        /**
         * @returns {string} String with JSON stringified property keys and values.
         */
        _this.deconstruct = function () { return JSON.stringify({
            name: _this.name,
            startGold: _this.startGold,
            playerType: _this.playerType,
            level: _this._level,
            id: _this.id,
            startCityId: _this._startCity.id,
            finance: _this._finance.deconstruct(),
            save: _this._save,
            queue: _this._queue.map(function (e) { return ({
                route: e.route.deconstruct(),
                turnCost: e.turnCost
            }); }),
            routes: _this._routes.map(function (e) { return e.deconstruct(); }),
            upgrades: _this._upgrades.map(function (e) { return ({
                id: e.id
            }); }),
            isActive: _this._isActive
        }); };
        /**
         * There are basically five actions:
         * - Buy Route
         * - Buy Upgrade
         * - Buy Stock
         * - Delete Route
         * - Sell Stock
         *
         * Upgrades should be prioritized, then Stock options and then purchase of Routes.
         * Lastly, delete and recoup the cost of consistently unprofitable Routes.
         *
         * It is also possible to alter an unprofitable Route to potentially make it profitable,
         * if, say, new Trains or Resources becomes available. However, that, for now, is not utilized by Opponent.
         *
         * @param {HandleTurnInfo} info - Object with relevant turn information.
         * @param {Nardis}         game - Nardis game instance.
         */
        _this.deduceAction = function (info, game) {
            if (_this._save.should && info.turn < _this._save.turn + _this._save.diff) {
                _this.log("saving until turn " + (_this._save.turn + _this._save.diff));
                return;
            }
            else if (_this._save.should && info.turn >= _this._save.turn + _this._save.diff) {
                if (_this._save.callback()) {
                    _this._save = _this.getDefaultSave(info.turn);
                }
                else {
                    return;
                }
            }
            _this.buyAvailableUpgrades(info, game);
            _this.inspectStockOptions(game);
            if (_this.shouldPurchaseRoutes(info.turn)) {
                var train = _this.getSuggestedTrain(game.getArrayOfAdjustedTrains());
                var originRoutes = _this.getInterestingRoutes(game, train);
                var n = originRoutes.length > 0 ? (_this.isAllGameStockOwned(game) ? 1 : originRoutes[0].pRoutes.length) : 0;
                _this.purchaseRoutes(game, _this.pickNInterestingRoutes(originRoutes, n, train));
            }
            _this.deleteConsistentlyUnprofitableRoutes(game, info.turn);
            _this.checkIfAnyPlayerCanBeBoughtOut(game, info.turn);
        };
        /**
         * Iterate over each unique origin. Then iterate over routes from that origin.
         * Filter for affordable Routes and sort for highest potential profitability.
         *
         * @param   {Nardis}                 game  - Nardis game instance.
         * @param   {AdjustedTrain}          train - AdjustedTrain object.
         *
         * @returns {OriginRoutePotential[]} Array of origins and their respective routes.
         */
        _this.getInterestingRoutes = function (game, train) { return (_this.getRoutePowerPotential(game, train).map(function (origin) {
            _this.log("found " + origin.aRoutes.length + " routes from '" + origin.origin.name + "'");
            return __assign(__assign({}, origin), { aRoutes: origin.aRoutes.filter(function (aRoute) { return (origin.pRoutes[aRoute.index].goldCost + train.cost <= _this._finance.getGold()); })
                    .sort(function (a, b) { return b.power.powerIndex - a.power.powerIndex; }) });
        })); };
        /**
         * Reduce an array of OriginRoutePotential to a sorted array of BuyableRoutes with length n.
         *
         * @param   {OriginRoutePotential[]} routes - Array of origins and their respective routes.
         * @param   {number}                 n      - Number with length of returned array.
         * @param   {AdjustedTrain}          train  - AdjustedTrain object.
         *
         * @returns {BuyableRoute[]}         Array of BuyableRoute objects ready to be purchased.
         */
        _this.pickNInterestingRoutes = function (routes, n, train) { return (routes.map(function (route, originIndex) { return (route.aRoutes.map(function (aRoute, aRouteIndex) { return ({
            originIndex: originIndex,
            aRouteIndex: aRouteIndex,
            powerIndex: aRoute.power.powerIndex
        }); })); })
            .reduce(function (a, b) { return a.concat(b); }, [])
            .sort(function (a, b) { return b.powerIndex - a.powerIndex; })
            .splice(0, n)
            .map(function (chosenRoute) {
            var origin = routes[chosenRoute.originIndex];
            var aRoute = origin.aRoutes[chosenRoute.aRouteIndex];
            var pRoute = origin.pRoutes[aRoute.index];
            return __assign(__assign({}, pRoute), { train: train.train, trainCost: train.cost, routePlanCargo: aRoute.suggestedRoutePlan });
        })); };
        /**
         * Buy all available upgrades.
         *
         * @param {HandleTurnInfo} info - Object with relevant turn information.
         * @param {Nardis}         game - Nardis game instance.
         */
        _this.buyAvailableUpgrades = function (info, game) {
            info.data.upgrades.filter(function (upgrade) { return (_this._level >= upgrade.levelRequired &&
                _this._upgrades.filter(function (boughtUpgrade) { return boughtUpgrade.equals(upgrade); }).length <= 0); }).forEach(function (upgrade) {
                if (_this._finance.getGold() - upgrade.cost >= 0) {
                    _this.log("purchasing upgrade '" + upgrade.name + "' for " + upgrade.cost + "g");
                    game.addUpgradeToPlayer(upgrade.id);
                }
            });
        };
        /**
         * Each origin will have its own unique routes. There can be multiple origins each with multiple routes.
         * Assign a "power index" to each route associated with each origin. Higher the index, better the route.
         *
         * @param   {Nardis}                 game           - Nardis game instance.
         * @param   {AdjustedTrain}          suggestedTrain - AdjustedTrain object.
         *
         * @returns {OriginRoutePotential[]} Array of OriginRoutePotentials from each unique origin.
         */
        _this.getRoutePowerPotential = function (game, suggestedTrain) { return (_this.getUniqueOrigins().map(function (origin) {
            var pRoutes = game.getArrayOfPossibleRoutes(origin);
            return {
                origin: origin,
                pRoutes: pRoutes,
                aRoutes: pRoutes.map(function (route, index) {
                    var suggestedRoutePlan = _this.getSuggestedRoutePlan(route, suggestedTrain.train.cargoSpace);
                    return {
                        index: index,
                        suggestedRoutePlan: suggestedRoutePlan,
                        tradeableResources: suggestedRoutePlan.cityOne.length + suggestedRoutePlan.cityTwo.length,
                        power: __assign({}, _this.getPower(route.cityOne.distanceTo(route.cityTwo), suggestedTrain.train, suggestedRoutePlan))
                    };
                })
            };
        })); };
        /**
         * Get RoutePower of a potential route by asking a few questions.
         *
         * What would the expected profit be from a full revolution? That is from origin, to destination and back again.
         * How many turns will it take? The power index is the expected profit over the turns a full revolution requires.
         *
         * @param   {number}         distance  - Number with distance in kilometers.
         * @param   {Train}          train     - Train instance to be used.
         * @param   {RoutePlanCargo} routePlan - RoutePlanCargo object with suggested cargo.
         *
         * @returns {RoutePower}     RoutePower object for the given parameters.
         */
        _this.getPower = function (distance, train, routePlan) {
            var fullRevolutionInTurns = Math.ceil(distance / train.speed) * 2;
            // plus four is to account for loading/unloading in both cities
            var upkeep = (fullRevolutionInTurns + 4) * train.upkeep;
            var expectedProfitValue = [routePlan.cityOne, routePlan.cityTwo].map(function (plan) { return (plan.map(function (cargo) { return (cargo.targetAmount * cargo.resource.getValue()); }).reduce(function (a, b) { return a + b; }, 0)); }).reduce(function (a, b) { return a + b; }, (upkeep * -1));
            return {
                expectedProfitValue: expectedProfitValue,
                fullRevolutionInTurns: fullRevolutionInTurns,
                powerIndex: expectedProfitValue / fullRevolutionInTurns
            };
        };
        /**
         * Get suggested RoutePlanCargo for a given route between two cities.
         *
         * @param   {PotentialRoute} route           - PotentialRoute object.
         * @param   {number}         cargoConstraint - Number of available cargo spaces.
         *
         * @returns {RoutePlanCargo} RoutePlanCargo suggested for the route.
         */
        _this.getSuggestedRoutePlan = function (route, cargoConstraint) {
            var c1Supply = route.cityOne.getSupply();
            var c2Supply = route.cityTwo.getSupply();
            // first two entries are always low-yield, anything else are medium-to-high yield
            var c1p = c1Supply[0];
            var c1m = c1Supply[1];
            var c2p = c2Supply[0];
            var c2m = c2Supply[1];
            var pgt = c1p.resource.getValue() > c1m.resource.getValue();
            return {
                cityOne: _this.getSuggestedCargo(c1Supply.filter(function (cr) { return !cr.resource.equals(c1p.resource) && !cr.resource.equals(c1m.resource); }), route.cityTwo, cargoConstraint, pgt ? [c1p, c1m] : [c1m, c1p]),
                cityTwo: _this.getSuggestedCargo(c2Supply.filter(function (cr) { return !cr.resource.equals(c2p.resource) && !cr.resource.equals(c2m.resource); }), route.cityOne, cargoConstraint, pgt ? [c2p, c2m] : [c2m, c2p])
            };
        };
        /**
         * Inspect Stock options and depending upon the Finance at hand, either buy, sell or hold Stock.
         *
         * If selling, sell hightest valued Stock. If buying, buy lowest valued Stock.
         *
         * @param {nardis} game - Nardis game instance.
         */
        _this.inspectStockOptions = function (game) {
            var currentGold = _this._finance.getGold();
            var ownedStock = _this._finance.getStocks();
            var profit = _this._finance.getAverageRevenue() - _this._finance.getAverageExpense();
            if (currentGold <= 0 && profit <= 0) {
                var keys = Object.keys(ownedStock);
                if (keys.length > 0) {
                    var stock = keys.map(function (key) { return ({
                        id: key,
                        amount: ownedStock[key],
                        value: game.stocks[key].getSellValue()
                    }); })
                        .filter(function (e) { return e.amount > 0; })
                        .sort(function (a, b) { return b.value - a.value; });
                    if (stock.length > 0) {
                        _this.log("selling stock: '" + stock[0].id + "' due to low cash availability");
                        game.sellStock(stock[0].id);
                    }
                }
            }
            else {
                var potentialStock = Object.keys(game.stocks)
                    .map(function (key) { return game.stocks[key]; })
                    .filter(function (e) { return e.currentAmountOfStockHolders() < constants_1.stockConstant.maxStockAmount && currentGold >= e.getBuyValue(); })
                    .sort(function (a, b) { return a.getBuyValue() - b.getBuyValue(); });
                if (potentialStock.length > 0 &&
                    _this._finance.getAverageRevenue() > 0) {
                    _this.log("buying stock: '" + potentialStock[0].owningPlayerId + "'");
                    game.buyStock(potentialStock[0].owningPlayerId);
                }
            }
        };
        /**
         * Check if any Player can be bought out and either buyout that Player or save and try again.
         *
         * @param {Nardis} game - Nardis game instance.
         * @param {number} turn - Number with current turn.
         */
        _this.checkIfAnyPlayerCanBeBoughtOut = function (game, turn) {
            var keys = __spreadArrays(Object.keys(game.stocks).filter(function (key) { return key !== _this.id; }), [_this.id]);
            var _loop_1 = function (i) {
                var stock = game.stocks[keys[i]];
                if (util_1.isDefined(stock) &&
                    stock.isActive() &&
                    stock.currentAmountOfStockHolders() >= constants_1.stockConstant.maxStockAmount) {
                    var buyOut = stock.getBuyOutValues().filter(function (e) { return e.id !== _this.id; }).reduce(function (a, b) { return a + b.totalValue; }, 0);
                    if (_this._finance.getGold() >= buyOut) {
                        _this.log("commencing buyout of stock '" + stock.owningPlayerId + "'");
                        game.buyOutPlayer(stock.owningPlayerId, stock.owningPlayerId === _this.id);
                        return "break";
                    }
                    else if (_this._level >= types_1.PlayerLevel.Advanced) {
                        _this.log("commencing save to buyout stock '" + stock.owningPlayerId + "'");
                        _this._save = {
                            should: true,
                            turn: turn,
                            diff: _this.isAllGameStockOwned(game) ? 10 : 4,
                            callback: (function (game, id, turn) {
                                if (_this._finance.getGold() >= game.stocks[id].getBuyOutValues().filter(function (e) { return e.id !== _this.id; }).reduce(function (a, b) { return a + b.totalValue; }, 0)) {
                                    game.buyOutPlayer(id, stock.owningPlayerId === _this.id);
                                    return true;
                                }
                                var continueSave = !(game.getCurrentTurn() < turn + (_this.isAllGameStockOwned(game) ? 10 : 4));
                                _this.log("save initiated on turn: " + turn + " | continue: " + continueSave);
                                return continueSave;
                            }).bind(_this, game, stock.owningPlayerId, turn)
                        };
                        return "break";
                    }
                }
            };
            for (var i = 0; i < keys.length; i++) {
                var state_1 = _loop_1(i);
                if (state_1 === "break")
                    break;
            }
        };
        /**
         * Get array of suggested RouteCargo for a given route.
         *
         * Supply will be medium-to-high-yield Resources. Filler will be the two low-yield Resources.
         * Prioritize supply but if all are either not demand in destination or weights more than current cargoConstraint,
         * then fill up the rest of the cargo space with filler Resources.
         *
         * @param   {CityResource[]}               supply          - Array of CityResources to be used.
         * @param   {City}                         destination     - City instance to check demand from.
         * @param   {number}                       cargoConstraint - Number of available cargo spaces.
         * @param   {[CityResource, CityResource]} fillers         - Tuple of two low-yield CityResources.
         *
         * @returns {RouteCargo[]}                 Array of suggested RouteCargo.
         */
        _this.getSuggestedCargo = function (supply, destination, cargoConstraint, fillers) {
            var result = [];
            supply.sort(function (a, b) { return b.resource.getValue() - a.resource.getValue(); })
                .forEach(function (cr) {
                if (destination.isDemand(cr.resource) && cr.available > 0) {
                    var weight = cr.resource.getWeight();
                    var weightRatio = Math.floor(cargoConstraint / weight);
                    if (weightRatio > 0) {
                        var amount = cargoConstraint - weightRatio >= 0 ? weightRatio : (cargoConstraint - weight >= 0 ? 1 : 0);
                        if (amount > 0) {
                            cargoConstraint -= amount * weight;
                            result.push({
                                resource: cr.resource,
                                targetAmount: amount,
                                actualAmount: 0
                            });
                        }
                    }
                }
            });
            if (cargoConstraint > 0) {
                result.push.apply(result, _this.getFillerCargo(cargoConstraint, fillers));
            }
            return result;
        };
        /**
         * Get an array of filler CityResources within the given constraint.
         *
         * @param   {number}                       cargoConstraint - Number of available cargo spaces.
         * @param   {[CityResource, CityResource]} fillers         - Tuple of two low-yield CityResources.
         *
         * @returns {RouteCargo[]}                 Array of filler CityResources.
         */
        _this.getFillerCargo = function (cargoConstraint, fillers) {
            var result = [];
            var initialAmount = Math.ceil(cargoConstraint / 2); // fillers[0].available >= cargoConstraint ? cargoConstraint : fillers[0].available;
            var diff = cargoConstraint - initialAmount;
            result.push({
                resource: fillers[0].resource,
                targetAmount: initialAmount,
                actualAmount: 0
            });
            if (diff > 0) {
                result.push({
                    resource: fillers[1].resource,
                    targetAmount: diff,
                    actualAmount: 0
                });
            }
            return result;
        };
        /**
         * The default state is basically to buy Routes unless cash is needed for level up or stock purchase.
         *
         * @param   {number}  turn - Number with current turn.
         *
         * @returns {boolean} True if should purchase Route else false.
         */
        _this.shouldPurchaseRoutes = function (turn) {
            var shouldPurchase;
            var levelUpReq = constants_1.levelUpRequirements[_this._level + 1];
            if (util_1.isDefined(levelUpReq)) {
                if (_this._routes.length < levelUpReq.routes) {
                    shouldPurchase = true;
                }
                else {
                    var gold = _this._finance.getGold();
                    if (_this._finance.getAverageRevenue() >= levelUpReq.revenuePerTurn && gold < levelUpReq.gold) {
                        _this.log("commencing save for levelup, missing " + (levelUpReq.gold - gold) + " gold");
                        _this._save = {
                            should: true,
                            turn: turn,
                            diff: constants_1.DEFAULT_SAVE,
                            callback: function () { return true; }
                        };
                        shouldPurchase = false;
                    }
                    else {
                        shouldPurchase = true;
                    }
                }
            }
            else {
                shouldPurchase = true;
            }
            return shouldPurchase;
        };
        /**
         * Purchase the given Routes until respecting some generic constraints for gold and queue length.
         *
         * @param {Nardis}         game   - Nardis game instance.
         * @param {BuyableRoute[]} routes - BuyableRoutes to purchase.
         */
        _this.purchaseRoutes = function (game, routes) {
            _this.log("attempting to purchase " + routes.length + " routes");
            var min = _this._level === types_1.PlayerLevel.Novice ? 0 : Math.floor(_this._finance.getGold() * ((_this._level + 2) / 10));
            for (var i = 0; i < routes.length; i++) {
                if (_this._finance.getGold() - (routes[i].goldCost + routes[i].trainCost) <= min || _this._queue.length >= 5) {
                    _this.log("stopped purchasing after " + i + " routes");
                    break;
                }
                game.addRouteToPlayerQueue(routes[i]);
            }
        };
        /**
         * Useful when deciding how long to save when commencing buyouts.
         *
         * @param   {Nardis}  game - Nardis game instance.
         *
         * @returns {boolean} True if all shares of every Stock is currently held else false.
         */
        _this.isAllGameStockOwned = function (game) {
            var result = Object.keys(game.stocks).map(function (key) {
                var stock = game.stocks[key];
                return stock.currentAmountOfStockHolders() >= constants_1.stockConstant.maxStockAmount ? 0 : 1;
            })
                .reduce(function (a, b) { return a + b; }, 0) === 0;
            _this.log("all shares of every stock currently owned: " + result);
            return result;
        };
        /**
         * If any Route has been unprofitable for four the amount of turns a full revolution takes, delete it.
         *
         * @param {Nardis}  game - Nardis game instance.
         * @param {number}  turn - Number with current turn.
         */
        _this.deleteConsistentlyUnprofitableRoutes = function (game, turn) {
            _this._routes.forEach(function (route) {
                var profit = route.getProfit();
                if (profit < 0) {
                    if (turn - route.getPurchasedOnTurn() >= (Math.ceil(route.getDistance() / route.getTrain().speed) * 2) * 2) {
                        _this.log("deleting route '" + route.id + "' due to unprofitability " + profit);
                        game.removeRouteFromPlayerRoutes(route.id, Math.floor(route.getCost() / 2));
                    }
                }
            });
        };
        /**
         * Get optimal Train by finding the valueRatio of each Train,
         * which is the sum of cost and upkeep over the sum of the speed and space.
         *
         * @param   {AdjustedTrain[]} trains - Array of AdjustedTrains to be used.
         *
         * @returns {AdjustedTrain}   AdjustedTrain object.
         */
        _this.getSuggestedTrain = function (trains) {
            var relevantTrains = trains.filter(function (e) { return _this._level >= e.train.levelRequired && (_this._level > types_1.PlayerLevel.Novice ? e.train.cargoSpace >= 5 : true); });
            var currentSpace = 0;
            var valueRatio = Infinity;
            var i = 0;
            relevantTrains.forEach(function (train, index) {
                var vr = (train.cost + (train.train.upkeep * 5)) / (train.train.speed + (train.train.cargoSpace * 4)); // TODO test higher multiplier for cargo space
                if ((vr < valueRatio && train.train.cargoSpace >= currentSpace) || (Math.abs(vr - valueRatio) < Number.EPSILON && train.train.cargoSpace > currentSpace)) {
                    currentSpace = train.train.cargoSpace;
                    valueRatio = vr;
                    i = index;
                }
            });
            _this.log("suggested train: '" + relevantTrains[i].train.name + "', vr=" + valueRatio.toFixed(3));
            return relevantTrains[i];
        };
        /**
         * Get array of all non-empty cities currently connected to the Route network of the Player.
         * These cities will serve as potential origins for new routes.
         *
         * @returns {City[]} Array of unique City origins.
         */
        _this.getUniqueOrigins = function () {
            var origins = [];
            !_this._startCity.isFull() ? origins.push(_this._startCity) : null;
            var _loop_2 = function (i) {
                var _a = [_this._routes[i].getCityOne(), _this._routes[i].getCityTwo()], c1 = _a[0], c2 = _a[1];
                if (origins.filter(function (e) { return e.equals(c1); }).length <= 0 && !c1.isFull()) {
                    origins.push(c1);
                }
                if (origins.filter(function (e) { return e.equals(c2); }).length <= 0 && !c2.isFull()) {
                    origins.push(c2);
                }
            };
            for (var i = 0; i < _this._routes.length; i++) {
                _loop_2(i);
            }
            _this.log("found " + origins.length + " unique origins");
            return origins;
        };
        /**
         * Get default ActionSave object.
         *
         * @param   {number}     turn - Number with current turn.
         *
         * @returns {ActionSave} ActionSave object with default values.
         */
        _this.getDefaultSave = function (turn) { return ({
            turn: turn,
            should: false,
            diff: 0,
            callback: function () { return false; }
        }); };
        _this._save = util_1.isDefined(save) ? save : _this.getDefaultSave(1);
        return _this;
    }
    /**
     * Get Opponent instance from stringified JSON.
     *
     * @param  {string}     stringifiedJSON - String with information to be used.
     * @param  {City[]}     cities          - City instances used in the current game.
     * @param  {Train[]}    trains          - Train instances used in the current game.
     * @param  {Resource[]} resources       - Resource instances used in the current game.
     * @param  {Upgrades[]} upgrades        - Upgrade instances used in the current game.
     *
     * @return {Opponent}   Opponent instance created from stringifiedJSON.
     */
    Opponent.createFromStringifiedJSON = function (stringifiedJSON, cities, trains, resources, upgrades) {
        var parsedJSON = JSON.parse(stringifiedJSON);
        return new Opponent(parsedJSON.name, parsedJSON.startGold, cities.filter(function (e) { return e.id === parsedJSON.startCityId; })[0], finance_1.default.createFromStringifiedJSON(parsedJSON.finance), parsedJSON.level, parsedJSON.queue.map(function (e) { return ({
            route: route_1.default.createFromStringifiedJSON(e.route, cities, trains, resources),
            turnCost: e.turnCost
        }); }), parsedJSON.routes.map(function (e) { return route_1.default.createFromStringifiedJSON(e, cities, trains, resources); }), parsedJSON.upgrades.map(function (e) { return upgrades.filter(function (j) { return j.id === e.id; })[0]; }), {
            should: parsedJSON.save.should,
            turn: parsedJSON.save.turn,
            diff: parsedJSON.save.diff,
            callback: function () { return true; }
        }, parsedJSON.isActive, parsedJSON.id);
    };
    return Opponent;
}(player_1.default));
exports.default = Opponent;
