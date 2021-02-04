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
var base_component_1 = require("../component/base-component");
var constants_1 = require("../../util/constants");
var util_1 = require("../../util/util");
/**
 * @constructor
 * @param {string}         name                - String with name.
 * @param {number}         size                - Number with size.
 * @param {CityCoordinate} coords              - Object with location coordinates.
 * @param {CityResource[]} supply              - Object with info for City supplies.
 * @param {CityResource[]} demand              - Object with info for City demands.
 * @param {number}         growthRate          - Float describing growth rate.
 * @param {number}         supplyRefillRate    - Int describing refill rate.
 *
 * @param {number}         growthChangeDecider - (optional) Float describing growth change decider.
 * @param {number}         supplyRefillDecider - (optional) Float describing supply refill decider.
 * @param {number}         currentRouteCount   - (optional) Int describing current number of routes.
 * @param {string}         id                  - (optional) String number describing id.
 */
var City = /** @class */ (function (_super) {
    __extends(City, _super);
    function City(name, size, coords, supply, demand, growthRate, supplyRefillRate, growthChangeDecider, supplyRefillDecider, currentRouteCount, id) {
        var _this = _super.call(this, name, id) || this;
        _this.getSize = function () { return _this._size; };
        _this.getCoords = function () { return _this._coords; };
        _this.getSupply = function () { return _this._supply; };
        _this.getDemand = function () { return _this._demand; };
        _this.getGrowthRate = function () { return _this._growthRate; };
        _this.getGrowthDecider = function () { return _this._growthChangeDecider; };
        _this.getSupplyRefillRate = function () { return _this._supplyRefillRate; };
        _this.getSupplyDecider = function () { return _this._supplyRefillDecider; };
        _this.getCurrentRouteCount = function () { return _this._currentRouteCount; };
        _this.getMaxRouteCount = function () { return _this._maxConcurrentRoutes; };
        _this.isFull = function () { return _this._currentRouteCount >= _this._maxConcurrentRoutes; };
        _this.isSupply = function (resource) { return _this._supply.filter(function (e) { return e.resource.equals(resource); }).length > 0; };
        _this.isDemand = function (resource) { return _this._demand.filter(function (e) { return e.resource.equals(resource); }).length > 0; };
        /**
         * Handle City events which pertains to growth and refill of supplies. A city grow if the decision variable
         * is equal or greater than a certain value. If so, grow the city and set new resources else increment decision.
         *
         * Supplies will be refilled every nth turn, where n is the number specified in supplyRefillRate.
         *
         * @param {HandleTurnInfo} info - Object with relevant turn information.
         */
        _this.handleTurn = function (info) {
            if (_this._growthChangeDecider >= constants_1.CITY_GROWTH_DECISION_TARGET && _this.grow(info.data.resources)) {
                _this._growthChangeDecider = 0;
            }
            else {
                _this._growthChangeDecider += _this._growthRate;
            }
            if (_this._supplyRefillDecider >= _this._supplyRefillRate) {
                _this.refill();
                _this._supplyRefillDecider = 0;
            }
            else {
                _this._supplyRefillDecider++;
            }
        };
        /**
         * Increment currentRouteCount if City is not at peak capacity.
         *
         * @return {boolean} True if count was incremented else false.
         */
        _this.incrementRouteCount = function () {
            if (!(_this.isFull())) {
                _this._currentRouteCount++;
                return true;
            }
            return false;
        };
        /**
         * Decrement currentRouteCount if the count is above or equal one.
         *
         * @return {boolean} True if count was decremented else false.
         */
        _this.decrementRouteCount = function () {
            if (_this._currentRouteCount >= 1) {
                _this._currentRouteCount--;
                return true;
            }
            return false;
        };
        /**
         * Get distance between two City instances in kilometers using haversine formula.
         *
         * @param {City}    city - City instance to calculate distance to.
         *
         * @return {number}        Number with distance in kilometers.
         */
        _this.distanceTo = function (city) {
            if (!(_this.equals(city))) {
                var _a = [_this.getCoords(), city.getCoords()], loc1 = _a[0], loc2 = _a[1];
                var _b = [util_1.degreesToRadians(loc1.phi), util_1.degreesToRadians(loc1.lambda)], p1 = _b[0], l1 = _b[1];
                var _c = [util_1.degreesToRadians(loc2.phi), util_1.degreesToRadians(loc2.lambda)], p2 = _c[0], l2 = _c[1];
                var _d = [Math.abs(p2 - p1), Math.abs(l2 - l1)], dp = _d[0], dl = _d[1];
                var a = Math.pow(Math.sin(dp / 2), 2) + ((Math.cos(p1) * Math.cos(p2)) * (Math.pow(Math.sin(dl / 2), 2)));
                return Math.round(constants_1.MAP_RADIUS_IN_KILOMETERS * (2 * Math.atan2(Math.sqrt(Math.abs(a)), Math.sqrt(Math.abs(1 - a)))));
            }
            return -1;
        };
        /**
         * Subtract available amount from a CityResource.
         *
         * @param {Resource} supply   - Resource in supply to subtract from.
         * @param {number}   subtract - Number to subtract.
         *
         * @return {number}             True if subtracted else false.
         */
        _this.subtractSupply = function (supply, subtract) {
            for (var i = 0; i < _this._supply.length; i++) {
                // only subtract if the operation resolves in a non-negative number
                if (_this._supply[i].resource.equals(supply) && _this._supply[i].available >= subtract) {
                    _this._supply[i].available -= subtract;
                    return true;
                }
            }
            return false;
        };
        /**
         * Get CityResource from Resource instance.
         *
         * @param {Resource} resource - Resource to match.
         *
         * @return {CityResource}       CityResource if found else null.
         */
        _this.getCityResourceFromResource = function (resource) {
            var result = _this._supply.filter(function (e) { return e.resource.equals(resource); });
            return result.length > 0 ? result[0] : null;
        };
        /**
         * @param {Resource} resource - Resource to match.
         *
         * @return {boolean}            True if Resource is found in supply or demand else false.
         */
        _this.isSupplyOrDemand = function (resource) {
            return (_this.isSupply(resource) || _this.isDemand(resource));
        };
        /**
         * Grow the size of City with 50% roll chance, if City size is not max.
         *
         * @param {Resource[]} resources - Resource instances used in the current game.
         *
         * @return {boolean}               True if City did grow else false.
         */
        _this.grow = function (resources) {
            if (_this._size >= constants_1.MAX_CITY_SIZE || util_1.randomNumber() > 5) {
                return false;
            }
            _this._size++;
            _this.updateCityAfterGrowth(resources);
            return true;
        };
        /**
         * Set all City supplies available amount to their default amount.
         */
        _this.refill = function () {
            _this._supply.forEach(function (supply) {
                supply.available = supply.amount;
            });
        };
        /**
         * Update maxConcurrentRoutes to reflect City growth and set new supplies and demands if applicable.
         *
         * @param {Resource[]} resources - Resource instances used in the current game.
         */
        _this.updateCityAfterGrowth = function (resources) {
            var resourceLimit = constants_1.resourcesPerSize[_this._size - 1];
            var resourceDiff = resourceLimit - _this._supply.length;
            _this._maxConcurrentRoutes = _this.getMaxConcurrentRoutes();
            if (resourceDiff > 0) {
                var newSupplies = __spreadArrays(_this._supply);
                var newDemands = __spreadArrays(_this._demand);
                for (var _ = 0; _ < resourceDiff; _++) {
                    newSupplies.push(_this.rollNewResource(resources));
                    newDemands.push(_this.rollNewResource(resources));
                }
                _this._supply = newSupplies;
                _this._demand = newDemands;
            }
        };
        /**
         * Get new CityResource which Resource is ensured to be unique among the City supply and demand.
         *
         * Throws an Error if no unique Resource could be found.
         *
         * @param {Resource[]} resources - Resource instances used in the current game.
         *
         * @return {CityResource}        - CityResource not found in City supply or demand.
         */
        _this.rollNewResource = function (resources) {
            var relevantResources = resources.filter(function (e) {
                return !_this.isSupplyOrDemand(e);
            });
            if (relevantResources.length <= 0) {
                throw Error('cannot add anymore resources');
            }
            var amount = util_1.randomNumber.apply(void 0, constants_1.resourcePerSize[_this._size - 1]);
            return {
                resource: relevantResources[util_1.randomNumber(0, relevantResources.length - 1)],
                amount: amount,
                available: amount
            };
        };
        /**
         * @return {number} maxConcurrentRoutes from the current City size.
         */
        _this.getMaxConcurrentRoutes = function () {
            var result = constants_1.CitySizeMaxConcurrentRoutes.filter(function (e) {
                return e.size === _this._size;
            })[0];
            return result ? result.maxRoutes : 0;
        };
        _this.isStartCity = size <= constants_1.MAX_START_CITY_SIZE;
        _this._size = size;
        _this._coords = coords;
        _this._supply = supply;
        _this._demand = demand;
        _this._growthRate = growthRate;
        _this._supplyRefillRate = supplyRefillRate;
        _this._growthChangeDecider = growthChangeDecider ? growthChangeDecider : 0;
        _this._supplyRefillDecider = supplyRefillDecider ? supplyRefillDecider : 0;
        _this._currentRouteCount = currentRouteCount ? currentRouteCount : 0;
        _this._maxConcurrentRoutes = _this.getMaxConcurrentRoutes();
        return _this;
    }
    /**
     * Get City instance from a CityModel.
     *
     * @param {CityModel}  model     - CityModel to be used.
     * @param {Resource[]} resources - Resource instances used in the current game.
     *
     * @return {City}                  City instance created from the model.
     */
    City.createFromModel = function (model, resources) {
        return new City(model.name, model.size, { phi: model.phi, lambda: model.lambda }, City.getCityResources(model.supply, resources), City.getCityResources(model.demand, resources), model.growthRate, model.supplyRefillRate);
    };
    /**
     * Get City instance from stringified JSON.
     *
     * @param {string}     stringifiedJSON - string with information to be used.
     * @param {Resource[]} resources       - Resource instances used in the current game.
     *
     * @return {City}                        City instance created from the string.
     */
    City.createFromStringifiedJSON = function (stringifiedJSON, resources) {
        // it is not pretty but it does the job
        var parsedJSON = JSON.parse(stringifiedJSON);
        var resource = (function (supply, demand) {
            var s = supply.map(function (su) {
                return {
                    resource: resources.filter(function (e) { return e.id === su.resource.id; })[0],
                    amount: su.amount,
                    available: su.available
                };
            });
            var d = demand.map(function (su) {
                return {
                    resource: resources.filter(function (e) { return e.id === su.resource.id; })[0],
                    amount: su.amount,
                    available: su.available
                };
            });
            return { s: s, d: d };
        })(parsedJSON._supply, parsedJSON._demand);
        return new City(parsedJSON.name, parsedJSON._size, parsedJSON._coords, resource.s, resource.d, parsedJSON._growthRate, parsedJSON._supplyRefillRate, parsedJSON._growthChangeDecider, parsedJSON._supplyRefillDecider, parsedJSON._currentRouteCount, parsedJSON.id);
    };
    /**
     * Get array of CityResources from CityResourceModels.
     *
     * @param {CityResourceModel[]} cityResourceModels - CityModel to be used.
     * @param {Resource[]}          resources          - Resource instances used in the current game.
     *
     * @return {CityResource[]}                        - Array of CityResources.
     */
    City.getCityResources = function (cityResourceModels, resources) {
        return cityResourceModels.map(function (e) {
            return {
                resource: resources.filter(function (r) { return r.name === e.name; })[0],
                amount: e.amount,
                available: e.available
            };
        });
    };
    return City;
}(base_component_1.default));
exports.default = City;
