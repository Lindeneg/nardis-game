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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRangeTurnCost = exports.getUpgradeModels = exports.getTrainModels = exports.getHighYieldResources = exports.getMediumYieldResourceModels = exports.getLowYieldResourceModels = exports.generateArrayOfRandomNames = exports.createId = exports.degreesToRadians = exports.getPlayerLevelFromNumber = exports.randomNumber = exports.isNumber = exports.isString = exports.isDefined = void 0;
var constants_1 = require("../util/constants");
var types_1 = require("../types/types");
var preparedData_1 = require("../data/preparedData");
/**
 * Get an array of either vowels or consonants.
 *
 * @returns {string[]} Array string with names.
 */
var getRandomLetterArray = function () { return exports.randomNumber() > 5 ? constants_1.VOWELS : constants_1.CONSONANTS; };
/**
 * Generate a value volatility between two given whole numbers.
 *
 * @param   {number} min - Number describing minimum volatility
 * @param   {number} max - Number describing maximum volatility
 *
 * @returns {number} Number describing random volatility.
 */
var getRandomValueVolatility = function (min, max) { return exports.randomNumber(min, max) / 10; };
/**
 * Generate a random name with length between two given whole numbers.
 *
 * @param   {number} min - Number describing minimum name length.
 * @param   {number} max - Number describing maximum name length.
 *
 * @returns {string} String with generated name.
 */
var generateName = function (min, max) {
    var name = '';
    for (var _ = 0; _ < exports.randomNumber(min, max); _++) {
        var arr = getRandomLetterArray();
        if (name.length < 1) {
            name += arr[exports.randomNumber(0, arr.length - 1)].toUpperCase();
        }
        else {
            if (constants_1.CONSONANTS.indexOf(name[name.length - 1].toLowerCase()) > -1) {
                name += constants_1.VOWELS[exports.randomNumber(0, constants_1.VOWELS.length - 1)];
            }
            else {
                name += arr[exports.randomNumber(0, arr.length - 1)];
            }
        }
    }
    return name;
};
/**
 * Check if a variable is defined
 *
 * @param   {any}     target - Target to check if defined.
 *
 * @returns {boolean} True if target defined else false.
 */
var isDefined = function (target) { return typeof target !== 'undefined'; };
exports.isDefined = isDefined;
/**
 * Check if a variable is a string.
 *
 * @param   {any}     target - Target to check if defined.
 *
 * @returns {boolean} True if target is a string else false.
 */
var isString = function (target) { return exports.isDefined(target) && typeof target === 'string'; };
exports.isString = isString;
/**
 * Check if a variable is a non-NaN number.
 *
 * @param   {any}     target - Target to check if defined.
 *
 * @returns {boolean} True if target is a non-NaN number else false.
 */
var isNumber = function (target) { return exports.isDefined(target) && typeof target === 'number' && !Number.isNaN(target); };
exports.isNumber = isNumber;
/**
 * Generate a random number between two given whole numbers.
 *
 * @param   {number} from - Number describing minimum value, default 1.
 * @param   {number} to   - Number describing maximum value, default 10.
 *
 * @returns {number} Number between from and to constrains.
 */
var randomNumber = function (from, to) {
    if (from === void 0) { from = 1; }
    if (to === void 0) { to = 10; }
    return Math.floor(Math.random() * (to - from + 1) + from);
};
exports.randomNumber = randomNumber;
/**
 * Get PlayerLevel from number.
 *
 * @param   {number}      n - Number to be matched with PlayerLevel.
 *
 * @returns {PlayerLevel} PlayerLevel found.
 */
var getPlayerLevelFromNumber = function (n) {
    if (n >= 0 && n < constants_1.playerLevelMapping.length) {
        return constants_1.playerLevelMapping[n];
    }
    return types_1.PlayerLevel.None;
};
exports.getPlayerLevelFromNumber = getPlayerLevelFromNumber;
/**
 * Convert degrees to radians.
 *
 * @param   {number} degrees - Number with degrees to convert.
 *
 * @returns {number} Number with radians.
 */
var degreesToRadians = function (degrees) {
    return (degrees * Math.PI) / 180;
    ;
};
exports.degreesToRadians = degreesToRadians;
/**
 * Get a 32bit random Id.
 *
 * @returns {string} String with generated Id.
 */
var createId = function () {
    var result = '';
    for (var _ = 0; _ < constants_1.ID_LENGTH; _++) {
        result += constants_1.ID_CHARS.charAt(Math.floor(Math.random() * constants_1.ID_CHARS.length));
    }
    return result;
};
exports.createId = createId;
/**
 * Get array of random names.
 *
 * @param   {number}    arraySize     - Number with desired size of the returned array.
 * @param   {number}    nameMinLength - Number with minimum name length.
 * @param   {number}    nameMaxLength - Number with maximum name length.
 * @param   {string[]}  exclude       - Array of strings with names to exclude.
 *
 * @returns {string[]}  Array of strings with generated names.
 */
var generateArrayOfRandomNames = function (arraySize, nameMinLength, nameMaxLength, exclude) {
    var result = [];
    for (var _ = 0; _ < arraySize; _++) {
        while (true) {
            var name_1 = generateName(nameMinLength, nameMaxLength);
            if (exclude.indexOf(name_1) <= -1) {
                result.push(name_1);
                exclude.push();
                break;
            }
        }
    }
    return result;
};
exports.generateArrayOfRandomNames = generateArrayOfRandomNames;
/**
 * Generate low yield ResourceModels with random entries for
 * Resource value and Resource value volatility.
 *
 * @returns {ResourceModel[]} Array with generated low yield ResourceModels.
 */
var getLowYieldResourceModels = function () { return preparedData_1.lowYieldData.map(function (e) { return (__assign(__assign({}, e), { value: exports.randomNumber.apply(void 0, e.value), valueVolatility: getRandomValueVolatility.apply(void 0, e.valueVolatility) })); }); };
exports.getLowYieldResourceModels = getLowYieldResourceModels;
/**
 * Generate medium yield ResourceModels with random entries for
 * Resource value and Resource value volatility.
 *
 * @returns {ResourceModel[]} Array with generated medium yield ResourceModels.
 */
var getMediumYieldResourceModels = function () { return preparedData_1.mediumYieldData.map(function (e) { return (__assign(__assign({}, e), { value: exports.randomNumber.apply(void 0, e.value), valueVolatility: exports.randomNumber.apply(void 0, e.valueVolatility) })); }); };
exports.getMediumYieldResourceModels = getMediumYieldResourceModels;
/**
 * Generate high yield ResourceModels with random entries for
 * Resource value and Resource value volatility.
 *
 * @returns {ResourceModel[]} Array with generated high yield ResourceModels.
 */
var getHighYieldResources = function () { return preparedData_1.highYieldData.map(function (e) { return (__assign(__assign({}, e), { value: exports.randomNumber.apply(void 0, e.value), valueVolatility: exports.randomNumber.apply(void 0, e.valueVolatility) })); }); };
exports.getHighYieldResources = getHighYieldResources;
/**
 * Generate TrainModels with random entries for cost, upkeep and speed.
 *
 * @returns {TrainModel[]} Array with generated TrainModels.
 */
var getTrainModels = function () { return preparedData_1.trainData.map(function (e) { return (__assign(__assign({}, e), { cost: exports.randomNumber.apply(void 0, e.cost), upkeep: exports.randomNumber.apply(void 0, e.upkeep), speed: exports.randomNumber.apply(void 0, e.speed), cargoSpace: exports.randomNumber.apply(void 0, e.cargoSpace) })); }); };
exports.getTrainModels = getTrainModels;
/**
 * Get fixed UpgradeModels.
 *
 * @returns {UpgradeModel[]} Array with UpgradeModels.
 */
var getUpgradeModels = function () { return preparedData_1.upgradeData; };
exports.getUpgradeModels = getUpgradeModels;
/**
 * Get the turn cost for a given distance.
 *
 * @returns {number} Number describing the maximum range.
 */
var getRangeTurnCost = function (distance) {
    var turnKey = Object.keys(constants_1.rangeCost).filter(function (key) {
        var _a = key.split(','), lower = _a[0], upper = _a[1];
        return parseInt(lower) >= distance && distance < parseInt(upper);
    })[0];
    return !turnKey ? constants_1.rangeCost['260,10000'] : constants_1.rangeCost[turnKey];
};
exports.getRangeTurnCost = getRangeTurnCost;
