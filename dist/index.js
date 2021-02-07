"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nardis = exports.Finance = exports.Upgrade = exports.Player = exports.Resource = exports.Train = exports.Route = exports.City = exports.generateData = exports.genericOpponentsName = void 0;
var data_1 = require("./data/data");
Object.defineProperty(exports, "generateData", { enumerable: true, get: function () { return data_1.generateData; } });
var nardis_1 = require("./modules/nardis");
Object.defineProperty(exports, "Nardis", { enumerable: true, get: function () { return nardis_1.Nardis; } });
var city_1 = require("./modules/core/city");
exports.City = city_1.default;
var route_1 = require("./modules/core/route");
exports.Route = route_1.default;
var train_1 = require("./modules/core/train");
exports.Train = train_1.default;
var resource_1 = require("./modules/core/resource");
exports.Resource = resource_1.default;
var player_1 = require("./modules/core/player/player");
exports.Player = player_1.default;
var finance_1 = require("./modules/core/player/finance");
exports.Finance = finance_1.default;
var upgrade_1 = require("./modules/core/player/upgrade");
exports.Upgrade = upgrade_1.default;
__exportStar(require("./types/types"), exports);
__exportStar(require("./util/util"), exports);
__exportStar(require("./util/constants"), exports);
var preparedData_1 = require("./data/preparedData");
Object.defineProperty(exports, "genericOpponentsName", { enumerable: true, get: function () { return preparedData_1.genericOpponentsName; } });
