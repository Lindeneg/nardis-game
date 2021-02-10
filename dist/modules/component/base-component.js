"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("../../util/util");
/**
 * Abstract class used to guarantee some properties and methods.
 *
 * @constructor
 * @param {string} name - String describing name.
 * @param {string} id   - (optional) String number describing id.
 */
var BaseComponent = /** @class */ (function () {
    function BaseComponent(name, id) {
        var _this = this;
        /**
         * @return {boolean} True if instances has same id else false.
        */
        this.equals = function (other) {
            return _this.id === other.id;
        };
        /**
         * @return {string} String with JSON stringified property keys and values.
        */
        //public abstract deconstruct(): string;
        this.deconstruct = function () { return JSON.stringify(_this); };
        this.id = id ? id : util_1.createId();
        this.name = name;
    }
    return BaseComponent;
}());
exports.default = BaseComponent;
