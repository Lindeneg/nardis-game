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
var base_component_1 = require("./base-component");
/**
 * Abstract class used to guarantee handleTurn method
 *
 * @constructor
 * @param {string} name - name of the component
 */
var TurnComponent = /** @class */ (function (_super) {
    __extends(TurnComponent, _super);
    function TurnComponent(name) {
        return _super.call(this, name) || this;
    }
    return TurnComponent;
}(base_component_1.default));
exports.default = TurnComponent;
