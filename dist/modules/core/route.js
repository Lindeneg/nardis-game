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
var base_component_1 = require("../component/base-component");
var util_1 = require("../../util/util");
var types_1 = require("../../types/types");
/**
 * @constructor
 * @param {string}     name                - String with name.
 * @param {City}       cityOne             - City specifying initial departure.
 * @param {City}       cityTwo             - City specifying initial arrival.
 * @param {Train}      train               - Train instance to be used.
 * @param {RoutePlan}  routePlan           - RoutePlan describing cargo.
 * @param {number}     distance            - Number with distance in kilometers.
 * @param {number}     cost                - Number with cost in gold.
 * @param {number}     purchasedOnTurn     - Number with turn count.
 *
 * @param {number}     profit              - (optional) Number with profit in gold.
 * @param {number}     kilometersTravelled - (optional) Number with total kilometers travelled.
 * @param {RouteState} routeState          - (optional) RouteState of the route.
 * @param {string}     id                  - (optional) String number describing id.
 */
var Route = /** @class */ (function (_super) {
    __extends(Route, _super);
    function Route(name, cityOne, cityTwo, train, routePlanCargo, distance, cost, purchasedOnTurn, profit, kilometersTravelled, routeState, id) {
        var _this = _super.call(this, name, id) || this;
        _this.getCityOne = function () { return _this._cityOne; };
        _this.getCityTwo = function () { return _this._cityTwo; };
        _this.getTrain = function () { return _this._train; };
        _this.getRoutePlan = function () { return _this._routePlanCargo; };
        _this.getDistance = function () { return _this._distance; };
        _this.getCost = function () { return _this._cost; };
        _this.getPurchasedOnTurn = function () { return _this._purchasedOnTurn; };
        _this.getRouteState = function () { return _this._routeState; };
        _this.getProfit = function () { return _this._profit; };
        _this.getKilometersTravelled = function () { return _this._kilometersTravelled; };
        /**
         * Handle Route events by checking the current state using this logic:
         * Is the current distance greater than zero?
         *
         * Yes -> Decrement current distance by Train speed + Player speed upgrades.
         *
         * No  -> Change destination and cargo and reset current distance to route distance.
         *
         * @param  {HandleTurnInfo}  info - Object with relevant turn information.
         */
        _this.handleTurn = function (info) {
            if (_this._routeState.hasArrived) {
                _this._routeState.destination = _this._routeState.destination.equals(_this._cityOne) ? _this._cityTwo : _this._cityOne;
                _this._routeState.distance = _this._distance;
                _this._routeState.cargo = _this.getChangedCargo();
                _this._routeState.hasArrived = false;
            }
            else {
                if (_this._routeState.distance <= 0) {
                    _this._routeState.hasArrived = true;
                }
                else {
                    var trainSpeed = _this.getTrainSpeed(info.playerData.upgrades);
                    _this._kilometersTravelled += trainSpeed;
                    _this._routeState.distance -= trainSpeed;
                }
            }
        };
        /**
         * Add gold to Route profits.
         *
         * @param {number} - Number with value in gold to add.
         */
        _this.addToProfit = function (value) {
            _this._profit += value;
        };
        /**
         * Remove gold from Route profits.
         *
         * @param {number} - Number with value in gold to remove.
         */
        _this.subtractFromProfit = function (value) {
            _this._profit -= value;
        };
        /**
         * Change Train or RoutePlanCargo from active route.
         */
        _this.change = function (train, routePlan) {
            if (!_this._train.equals(train)) {
                _this._profit = 0;
                _this._kilometersTravelled = 0;
            }
            _this._train = train;
            _this._routePlanCargo = routePlan;
            _this.resetRouteState(true);
        };
        /**
         * @returns {string} String with JSON stringified property keys and values.
        */
        _this.deconstruct = function () { return JSON.stringify({
            name: _this.name,
            id: _this.id,
            distance: _this._distance,
            cost: _this._cost,
            purchasedOnTurn: _this._purchasedOnTurn,
            profit: _this._profit,
            kilometersTravelled: _this._kilometersTravelled,
            cityOne: _this._cityOne.id,
            cityTwo: _this._cityTwo.id,
            train: _this._train.id,
            routePlanCargo: {
                cityOne: _this._routePlanCargo.cityOne.map(function (c1) { return ({
                    resource: {
                        id: c1.resource.id
                    },
                    targetAmount: c1.targetAmount,
                    actualAmount: c1.actualAmount
                }); }),
                cityTwo: _this._routePlanCargo.cityTwo.map(function (c2) { return ({
                    resource: {
                        id: c2.resource.id
                    },
                    targetAmount: c2.targetAmount,
                    actualAmount: c2.actualAmount
                }); })
            },
            routeState: {
                hasArrived: _this._routeState.hasArrived,
                destination: {
                    id: _this._routeState.destination.id
                },
                distance: _this._routeState.distance,
                cargo: !!_this._routeState.cargo ? _this._routeState.cargo.map(function (c) { return ({
                    resource: {
                        id: c.resource.id
                    },
                    targetAmount: c.targetAmount,
                    actualAmount: c.actualAmount
                }); }) : null
            }
        }); };
        /**
         * Get Train speed with Player upgrades taken into consideration.
         *
         * @returns {number} - Number with the correct Train speed.
         */
        _this.getTrainSpeed = function (upgrades) {
            var relevantUpgrades = upgrades.filter(function (e) { return e.type === types_1.UpgradeType.TrainSpeedQuicker; });
            var speed = _this._train.speed;
            if (relevantUpgrades.length > 0) {
                relevantUpgrades.forEach(function (e) {
                    speed += Math.floor(speed * e.value);
                });
            }
            return speed;
        };
        /**
         * Get appropriate array RouteCargo when between arrival and departure. Ensures that the
         * amount of each cargo respects the available amount from the City where the cargo is fetched from.
         *
         * @returns {RouteCargo[]} - Array of RouteCargo objects.
         */
        _this.getChangedCargo = function () {
            var isDestinationCityOne = _this._routeState.destination.equals(_this._cityOne);
            var inCity = isDestinationCityOne ? _this._cityTwo : _this._cityOne;
            var cargo = isDestinationCityOne ? _this._routePlanCargo.cityTwo : _this._routePlanCargo.cityOne;
            cargo.forEach(function (routeCargo) {
                var citySupply = inCity.getCityResourceFromResource(routeCargo.resource);
                var diff = citySupply ? citySupply.available - routeCargo.targetAmount : null;
                var available = citySupply.available;
                if (util_1.isNumber(diff)) {
                    if (diff <= 0 && inCity.subtractSupply(routeCargo.resource, available)) {
                        // target amount is greater than available, so set actual amount to available 
                        routeCargo.actualAmount = available;
                    }
                    else if (diff > 0 && inCity.subtractSupply(routeCargo.resource, routeCargo.targetAmount)) {
                        // target amount is satisfied and we can have the desired amount of cargo
                        routeCargo.actualAmount = routeCargo.targetAmount;
                    }
                    else {
                        // resource could not be fetched from city
                        routeCargo.actualAmount = 0;
                    }
                }
                else {
                    throw Error('cargo does not exist in city trying to be used');
                }
            });
            return cargo;
        };
        /**
         * Reset the RouteState to its default values.
         *
         * @param {boolean} edit - True if the reset is due to an edit of an active Route, else false.
         */
        _this.resetRouteState = function (edit) {
            _this._routeState = {
                hasArrived: edit ? true : false,
                destination: edit ? _this._cityOne : _this._cityTwo,
                distance: edit ? 0 : _this._distance,
                cargo: null
            };
            _this._routeState.cargo = _this.getChangedCargo();
        };
        _this._cityOne = cityOne;
        _this._cityTwo = cityTwo;
        _this._train = train;
        _this._routePlanCargo = routePlanCargo;
        _this._distance = distance;
        _this._cost = cost;
        _this._purchasedOnTurn = purchasedOnTurn;
        _this._profit = util_1.isDefined(profit) ? profit : 0;
        _this._kilometersTravelled = util_1.isDefined(kilometersTravelled) ? kilometersTravelled : 0;
        if (util_1.isDefined(routeState)) {
            _this._routeState = routeState;
        }
        else {
            _this.resetRouteState(false);
        }
        return _this;
    }
    /**
     * Get Route instance from stringified JSON.
     *
     * @param   {string}     stringifiedJSON - String with information to be used.
     * @param   {City[]}     cities          - Array of City instances used in game.
     * @param   {Train[]}    trains          - Array of Train instances used in game.
     * @param   {Resource[]} resources       - Array of Resource instances used in game.
     *
     * @returns {Route}      Route instance created from the string.
     */
    Route.createFromStringifiedJSON = function (stringifiedJSON, cities, trains, resources) {
        var parsedJSON = typeof stringifiedJSON === 'string' ? JSON.parse(stringifiedJSON) : stringifiedJSON;
        return new Route(parsedJSON.name, cities.filter(function (e) { return e.id === parsedJSON.cityOne; })[0], cities.filter(function (e) { return e.id === parsedJSON.cityTwo; })[0], trains.filter(function (e) { return e.id === parsedJSON.train; })[0], {
            cityOne: parsedJSON.routePlanCargo.cityOne.map(function (c1) { return ({
                resource: resources.filter(function (r) { return r.id === c1.resource.id; })[0],
                targetAmount: c1.targetAmount,
                actualAmount: c1.actualAmount
            }); }),
            cityTwo: parsedJSON.routePlanCargo.cityTwo.map(function (c2) { return ({
                resource: resources.filter(function (r) { return r.id === c2.resource.id; })[0],
                targetAmount: c2.targetAmount,
                actualAmount: c2.actualAmount
            }); })
        }, parsedJSON.distance, parsedJSON.cost, parsedJSON.purchasedOnTurn, parsedJSON.profit, parsedJSON.kilometersTravelled, {
            hasArrived: parsedJSON.routeState.hasArrived,
            destination: cities.filter(function (e) { return e.id === parsedJSON.routeState.destination.id; })[0],
            distance: parsedJSON.routeState.distance,
            cargo: !!parsedJSON.routeState.cargo ? parsedJSON.routeState.cargo.map(function (c) { return ({
                resource: resources.filter(function (e) { return e.id === c.resource.id; })[0],
                targetAmount: c.targetAmount,
                actualAmount: c.actualAmount
            }); }) : null
        }, parsedJSON.id);
    };
    return Route;
}(base_component_1.default));
exports.default = Route;
