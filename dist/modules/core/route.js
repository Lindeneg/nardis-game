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
var base_component_1 = require("../component/base-component");
var types_1 = require("../../types/types");
/**
 * @constructor
 * @param {string}     name                - string with name.
 * @param {City}       cityOne             - City specifying initial departure.
 * @param {City}       cityTwo             - City specifying initial arrival.
 * @param {Train}      train               - Train instance to be used.
 * @param {RoutePlan}  routePlan           - RoutePlan describing cargo.
 * @param {number}     distance            - number with distance in kilometers.
 * @param {number}     cost                - number with cost in gold.
 * @param {number}     purchasedOnTurn     - number with turn count.
 *
 * @param {number}     profit              - (optional) number with profit in gold.
 * @param {number}     kilometersTravelled - (optional) kilometers travelled in total for route.
 * @param {RouteState} routeState          - (optional) RouteState of the route.
 * @param {string}     id                  - (optional) string number describing id.
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
            _this.resetRouteState();
        };
        /**
         * Get Train speed with Player upgrades taken into consideration.
         *
         * @return {number} - Number with the correct Train speed.
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
         * @return {RouteCargo[]} - Array of RouteCargo objects.
         */
        _this.getChangedCargo = function () {
            var isDestinationCityOne = _this._routeState.destination.equals(_this._cityOne);
            var inCity = isDestinationCityOne ? _this._cityTwo : _this._cityOne;
            var cargo = isDestinationCityOne ? _this._routePlanCargo.cityTwo : _this._routePlanCargo.cityOne;
            cargo.forEach(function (routeCargo) {
                var citySupply = inCity.getCityResourceFromResource(routeCargo.resource);
                var diff = citySupply ? citySupply.available - routeCargo.targetAmount : null;
                var available = citySupply.available;
                if (typeof diff === 'number' && !Number.isNaN(diff)) {
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
        _this.resetRouteState = function () {
            _this._routeState = {
                hasArrived: false,
                destination: _this._cityTwo,
                distance: _this._distance,
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
        _this._profit = profit ? profit : 0;
        _this._kilometersTravelled = kilometersTravelled ? kilometersTravelled : 0;
        if (routeState) {
            _this._routeState = routeState;
        }
        else {
            _this.resetRouteState();
        }
        return _this;
    }
    /**
     * Get Route instance from stringified JSON.
     *
     * @param {string}     stringifiedJSON - String with information to be used.
     * @param {City[]}     cities          - Array of City instances used in game.
     * @param {Train[]}    trains          - Array of Train instances used in game.
     * @param {Resource[]} resources       - Array of Resource instances used in game.
     *
     * @return {Route}                       Route instance created from the string.
     */
    Route.createFromStringifiedJSON = function (stringifiedJSON, cities, trains, resources) {
        var parsedJSON = JSON.parse(stringifiedJSON);
        var routeState = parsedJSON._routeState;
        var cargo = !!routeState.cargo ? routeState.cargo.map(function (e) { return (__assign(__assign({}, e), { resource: resources.filter(function (j) { return j.id === e.resource.id; })[0] })); }) : routeState.cargo;
        return new Route(parsedJSON.name, cities.filter(function (e) { return e.id === parsedJSON._cityOne.id; })[0], cities.filter(function (e) { return e.id === parsedJSON._cityTwo.id; })[0], trains.filter(function (e) { return e.id === parsedJSON._train.id; })[0], {
            cityOne: parsedJSON._routePlanCargo.cityOne.map(function (e) {
                return __assign(__assign({}, e), { resource: resources.filter(function (j) { return j.id === e.resource.id; })[0] });
            }),
            cityTwo: parsedJSON._routePlanCargo.cityTwo.map(function (e) {
                return __assign(__assign({}, e), { resource: resources.filter(function (j) { return j.id === e.resource.id; })[0] });
            })
        }, parsedJSON._distance, parsedJSON._cost, parsedJSON._purchasedOnTurn, parsedJSON._profit, parsedJSON._kilometersTravelled, __assign(__assign({}, parsedJSON._routeState), { destination: cities.filter(function (e) { return e.id === parsedJSON._routeState.destination.id; })[0], cargo: cargo }), parsedJSON.id);
    };
    return Route;
}(base_component_1.default));
exports.default = Route;
