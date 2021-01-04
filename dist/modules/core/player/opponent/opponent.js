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
var player_1 = require("../player");
var types_1 = require("../../../../types/types");
var Opponent = /** @class */ (function (_super) {
    __extends(Opponent, _super);
    function Opponent(name, startCity, finance, level, queue, routes, upgrades) {
        var _this = _super.call(this, name, types_1.PlayerType.Computer, startCity, finance, level, queue, routes, upgrades) || this;
        _this.handleTurn = function (info) {
            if (_this.shouldLevelBeIncreased()) {
                _this.increaseLevel();
            }
            _this.handleQueue();
            _this.handleRoutes(info);
            _this.handleFinance(info);
            _this.deduceAction();
        };
        _this.deduceAction = function () {
        };
        return _this;
    }
    return Opponent;
}(player_1.default));
exports.default = Opponent;
