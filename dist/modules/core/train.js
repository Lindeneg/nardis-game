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
/**
 * Base Train class. Does nothing thus far besides having readonly values.
 *
 * @constructor
 * @param {string} name          - String with name.
 * @param {number} cost          - Number with cost in gold.
 * @param {number} upkeep        - Number with upkeep per turn in gold.
 * @param {number} speed         - Number with speed in kilometers per turn.
 * @param {number} cargoSpace    - Number with max cargo space.
 * @param {number} levelRequired - Number with min level required.
 *
 * @param {string} id            - (optional) String number describing id.
 */
var Train = /** @class */ (function (_super) {
    __extends(Train, _super);
    function Train(name, cost, upkeep, speed, cargoSpace, levelRequired, id) {
        var _this = _super.call(this, name, id) || this;
        _this.cost = cost;
        _this.upkeep = upkeep;
        _this.speed = speed;
        _this.cargoSpace = cargoSpace;
        _this.levelRequired = levelRequired;
        return _this;
    }
    /**
     * Get Train instance from a ResourceModel.
     *
     * @param {TrainModel}  model - TrainModel to be used.
     *
     * @return {Train}              Train instance created from the model.
     */
    Train.createFromModel = function (model) {
        return new Train(model.name, model.cost, model.upkeep, model.speed, model.cargoSpace, model.levelRequired);
    };
    /**
     * Get Train instance from stringified JSON.
     *
     * @param {string}  stringifiedJSON - String with information to be used.
     *
     * @return {Train}                    Train instance created from the string.
     */
    Train.createFromStringifiedJSON = function (stringifiedJSON) {
        var parsedJSON = JSON.parse(stringifiedJSON);
        return new Train(parsedJSON.name, parsedJSON.cost, parsedJSON.upkeep, parsedJSON.speed, parsedJSON.cargoSpace, parsedJSON.levelRequired, parsedJSON.id);
    };
    return Train;
}(base_component_1.default));
exports.default = Train;
