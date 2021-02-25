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
var logger_1 = require("../../util/logger");
var types_1 = require("../../types/types");
var util_1 = require("../../util/util");
var constants_1 = require("../../util/constants");
/**
 * @constructor
 * @param {string}                 name               - String with name.
 * @param {number}                 weight             - Number with weight in units.
 * @param {number}                 value              - Number with value in gold.
 * @param {number}                 minValue           - Number with minimum value in gold.
 * @param {number}                 maxValue           - Number with maximum value in gold.
 * @param {number}                 valueVolatility    - Number with value volatility.
 *
 * @param {number}                 valueChangeDecider - (optional) Number with value decider.
 * @param {ValueHistory[]}         valueHistory       - (optional) Object with history.
 * @param {string}                 id                 - (optional) String number describing id.
 */
var Resource = /** @class */ (function (_super) {
    __extends(Resource, _super);
    function Resource(name, weight, value, minValue, maxValue, valueVolatility, valueChangeDecider, valueHistory, id) {
        var _this = _super.call(this, name, id) || this;
        _this.getValue = function () { return _this._value; };
        _this.getMinValue = function () { return _this._minValue; };
        _this.getMaxValue = function () { return _this._maxValue; };
        _this.getValueVolatility = function () { return _this._valueVolatility; };
        _this.getChangeDecider = function () { return _this._valueChangeDecider; };
        _this.getWeight = function () { return _this._weight; };
        _this.getValueHistory = function () { return _this._valueHistory; };
        /**
         * Handle Resource events by checking the decision variable. If the decision is greater than the decision target,
         * then set a new value and reset the decider, else increment the decision variable.
         *
         * @param  {HandleTurnInfo}  info - Object with relevant turn information.
         */
        _this.handleTurn = function (info) {
            if (_this._valueChangeDecider + _this._valueVolatility >= constants_1.RESOURCE_VALUE_DECISION_TARGET && _this.setNewValue(_this.getNewValue(), info.turn)) {
                _this._valueChangeDecider = 0;
            }
            else {
                _this.updateValueChangeDecider();
            }
        };
        /**
         * @returns {string} String with JSON stringified property keys and values.
        */
        _this.deconstruct = function () { return JSON.stringify(_this); };
        /**
         * Set a new value for the resource.
         *
         * @param   {number}  value - Number with new value to be used.
         * @param   {number}  turn  - Number with turn count.
         *
         * @returns {boolean} True if value was set else false.
         */
        _this.setNewValue = function (value, turn) {
            if (_this._valueHistory[_this._valueHistory.length - 1].value === value) {
                return false;
            }
            _this._valueHistory.push({
                value: value,
                turn: turn
            });
            _this.log("updating value " + _this._value + "->" + value);
            _this._value = value;
            return true;
        };
        /**
         * Generates a new random value based upon the current value and the Resource value volatility.
         *
         * @returns {number} Number with new value.
         */
        _this.getNewValue = function () {
            var maxSign = util_1.randomNumber(0, 9) <= Math.round(_this._valueVolatility * 10) ? -1 : 1;
            var sign = util_1.randomNumber(0, 9) >= 5 ? -1 : 1;
            var newValue = null;
            var tmp;
            if (_this._value >= _this._maxValue) {
                tmp = _this._value + (util_1.randomNumber(1, 3) * maxSign);
                newValue = tmp >= _this._maxValue ? _this._maxValue : tmp;
            }
            else {
                tmp = _this._value + (util_1.randomNumber(2, 5) * sign);
                if (tmp >= _this._maxValue) {
                    newValue = _this._maxValue;
                }
                else if (tmp <= _this._minValue) {
                    newValue = _this._minValue;
                }
                else {
                    newValue = tmp;
                }
            }
            return newValue;
        };
        /**
         * Increment valueChangeDecider with a pseudorandom value.
         */
        _this.updateValueChangeDecider = function () {
            _this._valueChangeDecider += util_1.randomNumber(1, Math.round(_this._valueVolatility * 10)) / 10;
        };
        _this._value = value;
        _this._weight = weight;
        _this._minValue = minValue;
        _this._maxValue = maxValue;
        _this._valueVolatility = valueVolatility;
        _this._valueChangeDecider = util_1.isDefined(valueChangeDecider) ? valueChangeDecider : 0;
        _this._valueHistory = util_1.isDefined(valueHistory) ? valueHistory : [{
                value: _this._value,
                turn: 1
            }];
        _this.log = logger_1.default.log.bind(null, types_1.LogLevel.All, "resource-" + _this.name);
        return _this;
    }
    /**
     * Get Resource instance from a ResourceModel.
     *
     * @param   {ResourceModel}  model - ResourceModel to be used.
     *
     * @returns {Resource}       Resource instance created from the model.
     */
    Resource.createFromModel = function (model) {
        return new Resource(model.name, model.weight, model.value, model.minValue, model.maxValue, model.valueVolatility);
    };
    /**
     * Get Resource instance from stringified JSON.
     *
     * @param   {string}    stringifiedJSON - String with information to be used.
     *
     * @returns {Resource}  Resource instance created from the string.
     */
    Resource.createFromStringifiedJSON = function (stringifiedJSON) {
        var parsedJSON = JSON.parse(stringifiedJSON);
        return new Resource(parsedJSON.name, parsedJSON._weight, parsedJSON._value, parsedJSON._minValue, parsedJSON._maxValue, parsedJSON._valueVolatility, parsedJSON._valueChangeDecider, parsedJSON._valueHistory, parsedJSON.id);
    };
    return Resource;
}(base_component_1.default));
exports.default = Resource;
