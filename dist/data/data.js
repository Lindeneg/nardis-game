"use strict";
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
exports.generateData = void 0;
var util_1 = require("../util/util");
var constants_1 = require("../util/constants");
// array for randomly generated names to avoid duplicates
var excluded = [];
var trainModels = util_1.getTrainModels();
var lowResources = util_1.getLowYieldResourceModels();
var mediumResources = util_1.getMediumYieldResourceModels();
var highResources = util_1.getHighYieldResources();
// convert a ResourceModel to a CityResourceModel
var getCityResourceModel = function (resource, citySize) {
    var amount = util_1.randomNumber.apply(void 0, constants_1.resourcePerSize[citySize - 1]);
    return {
        name: resource.name,
        amount: amount,
        available: amount
    };
};
// Generate a ResourceModel based upon the City size
var rollResource = function (resources, citySize, currentResources) {
    var highResource = citySize >= 5 && util_1.randomNumber() <= citySize;
    var resource = null;
    if (highResource) {
        resource = highResources[util_1.randomNumber(0, highResources.length - 1)];
    }
    else {
        resource = mediumResources[util_1.randomNumber(0, mediumResources.length - 1)];
    }
    if (resources.filter(function (e) { return e.name === resource.name; }).length > 0 || currentResources.filter(function (e) { return e.name === resource.name; }).length > 0) {
        return rollResource(resources, citySize, currentResources);
    }
    return resource;
};
// Return a resource and an amount of stock, amount is -1 if type is demand
var getCityResources = function (citySize, isDemand, currentResources) {
    if (currentResources === void 0) { currentResources = []; }
    var limit = constants_1.resourcesPerSize[citySize - 1];
    var resources = __spreadArrays(lowResources.map(function (e) {
        return isDemand ? { name: e.name, amount: -1, available: -1 } : getCityResourceModel(e, citySize);
    }));
    var diff = limit - resources.length;
    if (diff > 0) {
        for (var _ = 0; _ < diff; _++) {
            var resource = rollResource(resources, citySize, currentResources);
            var cityResourceModel = isDemand ? { name: resource.name, amount: -1, available: -1 } : getCityResourceModel(resource, citySize);
            resources.push(cityResourceModel);
        }
    }
    return resources;
};
var generateResources = function () { return __spreadArrays(lowResources, mediumResources, highResources); };
var generateCities = function () {
    var names = util_1.generateArrayOfRandomNames(constants_1.possibleCityCoords.length, 4, 7, excluded);
    return names.map(function (name) {
        var _a = constants_1.possibleCityCoords.splice(util_1.randomNumber(0, constants_1.possibleCityCoords.length - 1), 1)[0], phi = _a[0], lambda = _a[1];
        var size = constants_1.citySizes.splice(util_1.randomNumber(0, constants_1.citySizes.length - 1), 1)[0];
        var supply = getCityResources(size, false);
        var demand = getCityResources(size, true, supply);
        return {
            name: name,
            size: size,
            phi: phi,
            lambda: lambda,
            supply: supply,
            demand: demand,
            growthRate: util_1.randomNumber(1, 6) / 10,
            supplyRefillRate: util_1.randomNumber(2, 4)
        };
    });
};
var generateTrains = function () {
    var names = util_1.generateArrayOfRandomNames(trainModels.length, 3, 5, excluded);
    return trainModels.map(function (e) {
        return __assign(__assign({}, e), { name: names.splice(util_1.randomNumber(0, names.length - 1), 1)[0] });
    });
};
exports.generateData = function () {
    return {
        cities: generateCities(),
        trains: generateTrains(),
        resources: generateResources(),
        upgrades: util_1.getUpgradeModels()
    };
};
