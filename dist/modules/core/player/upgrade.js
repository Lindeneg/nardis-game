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
var base_component_1 = require("../../component/base-component");
/**
 * Base Upgrade class. Does nothing thus far besides having readonly values.
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
var Upgrade = /** @class */ (function (_super) {
    __extends(Upgrade, _super);
    function Upgrade(name, cost, value, type, levelRequired, id) {
        var _this = _super.call(this, name, id) || this;
        _this.type = type;
        _this.value = value;
        _this.levelRequired = levelRequired;
        _this.cost = cost;
        return _this;
    }
    /**
     * Get Upgrade instance from a UpgradeModel.
     *
     * @param {UpgradeModel}  model - UpgradeModel to be used.
     *
     * @return {Upgrade}              Upgrade instance created from the model.
     */
    Upgrade.createFromModel = function (model) {
        return new Upgrade(model.name, model.cost, model.value, model.type, model.levelRequired);
    };
    /**
     * Get Upgrade instance from stringified JSON.
     *
     * @param {string}  stringifiedJSON - String with information to be used.
     *
     * @return {Upgrade}                  Upgrade instance created from the string.
     */
    Upgrade.createFromStringifiedJSON = function (stringifiedJSON) {
        var parsedJSON = JSON.parse(stringifiedJSON);
        return new Upgrade(parsedJSON.name, parsedJSON.cost, parsedJSON.value, parsedJSON.type, parsedJSON.levelRequired, parsedJSON.id);
    };
    return Upgrade;
}(base_component_1.default));
exports.default = Upgrade;
