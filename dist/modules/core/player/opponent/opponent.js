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
var finance_1 = require("../finance");
var route_1 = require("../../route");
var types_1 = require("../../../../types/types");
var constants_1 = require("../../../../util/constants");
;
var Opponent = /** @class */ (function (_super) {
    __extends(Opponent, _super);
    function Opponent(name, startGold, startCity, finance, level, queue, routes, upgrades, save, id) {
        var _this = _super.call(this, name, startGold, types_1.PlayerType.Computer, startCity, finance, level, queue, routes, upgrades, id) || this;
        // TODO
        _this.handleTurn = function (info, game) {
            if (_this.shouldLevelBeIncreased()) {
                _this.increaseLevel();
                _this._save = {
                    should: false,
                    turn: info.turn,
                    diff: 0
                };
            }
            _this.handleQueue();
            _this.handleRoutes(info);
            _this.handleFinance(info);
            _this.deduceAction(info, game);
        };
        // only for unit testing purposes
        _this.setSave = function (save) {
            _this._save = save;
        };
        // TODO
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
            }); })
        }); };
        /**
         * Main function for deducing the best action for the non-human player in question.
         */
        _this.deduceAction = function (info, game) {
            _this.log("turn=" + info.turn + ";comp=" + _this.name + ";avgr=" + _this._finance.getAverageRevenue() + "g;curg=" + _this._finance.getGold() + ";rout=" + _this._routes.length + ";queu=" + _this._queue.length + ";leve=" + _this._level + ";");
            _this.buyAvailableUpgrades(info, game);
            var stockOptions = _this.inspectStockOptions();
            if (_this.shouldPurchaseRoutes(info.turn)) {
                var train = _this.getSuggestedTrain(game.getArrayOfAdjustedTrains());
                var originRoutes = _this.getInterestingRoutes(game, train);
                _this.purchaseRoutes(game, _this.pickNInterestingRoutes(originRoutes, _this.getN(originRoutes), train));
            }
            _this.deleteConsistentlyUnprofitableRoutes();
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
         * Buy all available upgrades.
         */
        _this.buyAvailableUpgrades = function (info, game) {
            if (_this._save.should) {
                return;
            }
            info.data.upgrades.filter(function (upgrade) { return (_this._level >= upgrade.levelRequired &&
                _this._upgrades.filter(function (boughtUpgrade) { return boughtUpgrade.equals(upgrade); }).length <= 0); }).forEach(function (upgrade) {
                if (_this._finance.getGold() - upgrade.cost >= 0) {
                    _this.log("purchasing upgrade " + upgrade.name + " for " + upgrade.cost + "g");
                    game.addUpgradeToPlayer(upgrade.id);
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
            var expectedProfitValue = [routePlan.cityOne, routePlan.cityTwo].map(function (plan) { return (plan.map(function (cargo) { return (cargo.targetAmount * cargo.resource.getValue()); }).reduce(function (a, b) { return a + b; }, 0)); }).reduce(function (a, b) { return a + b; }, (upkeep * -1));
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
        // TODO 
        _this.inspectStockOptions = function () {
        };
        /**
         * Supply will be medium-to-high-yield Resources. Filler will be the two low-yield Resources.
         * Prioritize supply but if all are either not demand in destination or weights more than current cargoConstraint,
         * then fill up the rest of the cargo space with filler Resources.
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
        // TODO
        _this.getFillerCargo = function (cargoConstraint, fillers) {
            var result = [];
            var initialAmount = fillers[0].available >= cargoConstraint ? cargoConstraint : fillers[0].available;
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
        // TODO
        _this.getN = function (originRoutes) {
            var amount = originRoutes
                .map(function (origin) { return origin.aRoutes.length; })
                .reduce(function (a, b) { return a + b; }, 0);
            return _this._finance.getAverageRevenue() >= 0 && _this._finance.getGold() > 0 ? (_this._queue.length === 0 ? amount : Math.floor(amount / 2)) : 0;
        };
        // TODO
        _this.shouldPurchaseRoutes = function (turn) {
            var shouldPurchase;
            if (_this._save.should && turn < _this._save.turn + _this._save.diff) {
                shouldPurchase = false;
            }
            else {
                var levelUpReq = constants_1.levelUpRequirements[_this._level + 1];
                if (typeof levelUpReq !== 'undefined') {
                    if (_this._routes.length < levelUpReq.routes) {
                        shouldPurchase = true;
                    }
                    else {
                        if (_this._finance.getAverageRevenue() >= levelUpReq.revenuePerTurn && _this._finance.getGold() < levelUpReq.gold) {
                            _this._save = {
                                should: true,
                                turn: turn,
                                diff: 5
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
            }
            _this.log("should purchase: " + shouldPurchase);
            return shouldPurchase;
        };
        // TODO
        _this.purchaseRoutes = function (game, routes) {
            _this.log("attempting to purchase " + routes.length + " routes", routes);
            var min = Math.floor(_this._finance.getGold() * 0.1);
            for (var i = 0; i < routes.length; i++) {
                if (_this._finance.getGold() - (routes[i].goldCost + routes[i].trainCost) <= min || _this._queue.length > 5) {
                    _this.log('cannot purchase anymore routes');
                    break;
                }
                _this.log('purchasing route', routes[i]);
                game.addRouteToPlayerQueue(routes[i]);
            }
        };
        // TODO
        _this.deleteConsistentlyUnprofitableRoutes = function () {
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
                var vr = (train.cost + train.train.upkeep) / (train.train.speed + train.train.cargoSpace);
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
        _this._save = save ? save : {
            should: false,
            turn: 1,
            diff: 0
        };
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
    Opponent.createFromStringifiedJSON = function (stringifiedJSON, cities, trains, resources, upgrades) {
        var parsedJSON = JSON.parse(stringifiedJSON);
        return new Opponent(parsedJSON.name, parsedJSON.startGold, cities.filter(function (e) { return e.id === parsedJSON.startCityId; })[0], finance_1.default.createFromStringifiedJSON(parsedJSON.finance), parsedJSON.level, parsedJSON.queue.map(function (e) { return ({
            route: route_1.default.createFromStringifiedJSON(e.route, cities, trains, resources),
            turnCost: e.turnCost
        }); }), parsedJSON.routes.map(function (e) { return route_1.default.createFromStringifiedJSON(e, cities, trains, resources); }), parsedJSON.upgrades.map(function (e) { return upgrades.filter(function (j) { return j.id === e.id; })[0]; }), parsedJSON.save, parsedJSON.id);
    };
    return Opponent;
}(player_1.default));
exports.default = Opponent;
