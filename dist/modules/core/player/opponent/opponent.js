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
var player_1 = require("../player");
var types_1 = require("../../../../types/types");
var constants_1 = require("../../../../util/constants");
var Opponent = /** @class */ (function (_super) {
    __extends(Opponent, _super);
    function Opponent(name, startCity, finance, level, queue, routes, upgrades, id) {
        var _this = _super.call(this, name, types_1.PlayerType.Computer, startCity, finance, level, queue, routes, upgrades, id) || this;
        _this.handleTurn = function (info, game) {
            if (_this.shouldLevelBeIncreased()) {
                _this.increaseLevel();
            }
            _this.handleQueue();
            _this.handleRoutes(info);
            _this.handleFinance(info);
            _this.deduceAction(info, game);
        };
        /**
         * Main function for deducing the best action for the non-human player in question.
         */
        _this.deduceAction = function (info, game) {
            _this.log("turn=" + info.turn + ";comp=" + _this.name + ";avgr=" + _this._finance.getAverageRevenue() + "g;curg=" + _this._finance.getGold() + ";rout=" + _this._routes.length + ";queu=" + _this._queue.length + ";leve=" + _this._level + ";");
            if (_this._lastLevel < _this._level || _this._level === types_1.PlayerLevel.Novice) {
                _this.buyAvailableUpgrades(info, game, Math.floor(_this._finance.getGold() / 2));
                _this._level !== types_1.PlayerLevel.Novice ? _this._lastLevel++ : null;
            }
            if (_this.shouldPurchaseRoutes) {
                var train = _this.getSuggestedTrain(game.getArrayOfAdjustedTrains());
                _this.purchaseRoutes(game, _this.pickNInterestingRoutes(_this.getInterestingRoutes(game, train), _this.getN(), train));
            }
            _this.optimizeUnprofitableRoutes();
            _this.log('\n\n');
        };
        /**
         * Iterate over each unique origin. Then iterate over routes from that origin.
         * Sort those routes after highest potential profitability.
         */
        _this.getInterestingRoutes = function (game, train) { return (_this.getRoutePowerPotential(game, train).map(function (origin) {
            _this.log("routes from " + origin.origin.name, [origin.aRoutes, origin.pRoutes]);
            return __assign(__assign({}, origin), { aRoutes: origin.aRoutes.filter(function (aRoute) { return (origin.pRoutes[aRoute.index].goldCost + train.cost <= _this._finance.getGold()); })
                    .sort(function (a, b) { return b.power.powerIndex - a.power.powerIndex; }) });
        })); };
        /**
         * Reduce an array of OriginRoutePotential to a sorted array of BuyableRoutes with length n.
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
         * Buy all available upgrades but respect the maxSpend constraint.
         */
        _this.buyAvailableUpgrades = function (info, game, maxSpend) {
            if (maxSpend === void 0) { maxSpend = _this._finance.getGold(); }
            var spent = 0;
            info.data.upgrades.filter(function (upgrade) { return (_this._level >= upgrade.levelRequired &&
                _this._upgrades.filter(function (boughtUpgrade) { return boughtUpgrade.equals(upgrade); }).length <= 0); }).forEach(function (upgrade) {
                if (upgrade.cost + spent <= maxSpend) {
                    _this.log("purchasing upgrade " + upgrade.name + " for " + upgrade.cost + "g");
                    game.addUpgradeToPlayer(upgrade.id);
                    spent += upgrade.cost;
                }
            });
        };
        /**
         * Each origin will have its own unique routes. There can be multiple origins each with multiple routes.
         * Assign a "power index" to each route associated with each origin. Higher the index, better the route.
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
         * What would the expected profit be from a full revolution? That is from origin, to destination and back again.
         * How many turns will it take? The power index is the expected profit over the turns a full revolution requires.
         */
        _this.getPower = function (distance, train, routePlan) {
            var fullRevolutionInTurns = Math.ceil(distance / train.speed) * 2;
            // plus four is to account for loading/unloading in both cities
            var upkeep = (fullRevolutionInTurns + 4) * train.upkeep;
            var expectedProfitValue = [routePlan.cityOne, routePlan.cityTwo].map(function (plan) { return (plan.map(function (cargo) { return (cargo.targetAmount * cargo.resource.getValue()); }).reduce(function (a, b) { return a + b; }, 0)); }).reduce(function (a, b) { return a + b; }, 0) - upkeep;
            return {
                expectedProfitValue: expectedProfitValue,
                fullRevolutionInTurns: fullRevolutionInTurns,
                powerIndex: expectedProfitValue / fullRevolutionInTurns
            };
        };
        /**
         * Try and deduce the best RoutePlanCargo for a given route between two cities.
         */
        _this.getSuggestedRoutePlan = function (route, cargoConstraint) {
            var c1Supply = route.cityOne.getSupply();
            var c2Supply = route.cityTwo.getSupply();
            var c1p = c1Supply[0];
            var c1m = c1Supply[1];
            var c2p = c2Supply[0];
            var c2m = c2Supply[1];
            return {
                cityOne: _this.getSuggestedCargo(c1Supply.filter(function (cr) { return !cr.resource.equals(c1p.resource) && !cr.resource.equals(c1m.resource); }), route.cityTwo, cargoConstraint, [c1p, c1m]),
                cityTwo: _this.getSuggestedCargo(c2Supply.filter(function (cr) { return !cr.resource.equals(c2p.resource) && !cr.resource.equals(c2m.resource); }), route.cityOne, cargoConstraint, [c2p, c2m])
            };
        };
        /**
         * supply will be medium-to-high-yield Resources. filler will be the highest valued low-yield Resource.
         * Prioritize supply but if all are either not demand in destination or weights more than current cargoConstraint,
         * then fill up the rest of the cargo space with filler Resource.
         */
        _this.getSuggestedCargo = function (supply, destination, cargoConstraint, filler) {
            var result = [];
            supply.sort(function (a, b) { return b.resource.getValue() - a.resource.getValue(); })
                .forEach(function (cr) {
                if (destination.isDemand(cr.resource)) {
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
                var ini = Math.ceil(cargoConstraint / 2);
                var diff = cargoConstraint - ini;
                result.push.apply(result, [
                    {
                        resource: filler[0].resource,
                        targetAmount: ini,
                        actualAmount: 0
                    },
                    {
                        resource: filler[1].resource,
                        targetAmount: diff > 0 ? diff : 0,
                        actualAmount: 0
                    }
                ]);
            }
            return result;
        };
        _this.getN = function () { return (_this._finance.getAverageRevenue() >= 0 && _this._finance.getGold() > 0 ? (_this._queue.length === 0 ? 3 : 1) : 0); };
        _this.shouldPurchaseRoutes = function () {
            var levelUpReq = constants_1.levelUpRequirements[_this._level + 1];
            return !(_this._routes.length >= levelUpReq.routes &&
                _this._finance.getAverageRevenue() >= levelUpReq.revenuePerTurn &&
                !(_this._finance.getGold() >= levelUpReq.gold));
        };
        _this.purchaseRoutes = function (game, routes) {
            _this.log("attempting to purchase " + routes.length + " routes", routes);
            for (var i = 0; i < routes.length; i++) {
                if (_this._finance.getGold() - (routes[i].goldCost + routes[i].trainCost) < 0) {
                    _this.log('cannot purchase anymore routes');
                    break;
                }
                _this.log('purchasing route', routes[i]);
                game.addRouteToPlayerQueue(routes[i]);
            }
        };
        _this.optimizeUnprofitableRoutes = function () {
            _this.log('active routes', _this._routes);
            _this._routes.forEach(function (e, i) {
                var p = e.getProfit();
                _this.log((p > 0 ? 'profitable' : 'unprofitable') + " " + i);
            });
        };
        /**
         * Find the valueRatio of each Train, which is cost (negative) over the sum of the speed and space (positive).
         */
        _this.getSuggestedTrain = function (trains) {
            var relevantTrains = trains.filter(function (e) { return _this._level >= e.train.levelRequired; });
            var currentSpace = 0;
            var valueRatio = Infinity;
            var i = 0;
            relevantTrains.forEach(function (train, index) {
                var vr = train.cost / (train.train.speed + train.train.cargoSpace);
                _this.log("possible train: nme=" + train.train.name + ";vr=" + vr.toFixed(3) + ";cst=" + train.cost + ";vel=" + train.train.speed + ";spa=" + train.train.cargoSpace);
                if ((vr < valueRatio && train.train.cargoSpace >= currentSpace) || (Math.abs(vr - valueRatio) < Number.EPSILON && train.train.cargoSpace > currentSpace)) {
                    currentSpace = train.train.cargoSpace;
                    valueRatio = vr;
                    i = index;
                }
            });
            _this.log("suggested train: " + relevantTrains[i].train.name);
            return relevantTrains[i];
        };
        /**
         * Get array of all cities currently connected to the Route network of the player. These cities will
         * serve as potential origins for new routes.
         */
        _this.getUniqueOrigins = function () {
            var origins = [];
            !_this._startCity.isFull() ? origins.push(_this._startCity) : null;
            var _loop_1 = function (i) {
                var _a = [_this._routes[i].getCityOne(), _this._routes[i].getCityTwo()], c1 = _a[0], c2 = _a[1];
                if (origins.filter(function (e) { return e.equals(c1); }).length <= 0 && !c1.isFull()) {
                    origins.push(c1);
                }
                if (origins.filter(function (e) { return e.equals(c2); }).length <= 0 && !c2.isFull()) {
                    origins.push(c2);
                }
            };
            for (var i = 0; i < _this._routes.length; i++) {
                _loop_1(i);
            }
            _this.log("found " + origins.length + " unique origins");
            return origins;
        };
        /**
         * Temp for debug purposes
         */
        _this.log = function (msg, obj) {
            if (!!parseInt(window['nardisNonHumanDebug'])) {
                console.log(msg);
                obj ? console.log(obj) : null;
            }
        };
        _this._lastLevel = _this._level;
        return _this;
    }
    return Opponent;
}(player_1.default));
exports.default = Opponent;
