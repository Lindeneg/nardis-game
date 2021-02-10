"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genericOpponentsName = exports.lowYieldData = exports.mediumYieldData = exports.highYieldData = exports.trainData = exports.upgradeData = void 0;
var types_1 = require("../types/types");
exports.upgradeData = [
    {
        name: '20% off all new Train purchases',
        cost: 100,
        value: 0.2,
        type: types_1.UpgradeType.TrainValueCheaper,
        levelRequired: types_1.PlayerLevel.Novice
    },
    {
        name: '20% off all new Route purchases',
        cost: 100,
        value: 0.2,
        type: types_1.UpgradeType.TrackValueCheaper,
        levelRequired: types_1.PlayerLevel.Novice
    },
    {
        name: '10% speed bonus to all Trains',
        cost: 200,
        value: 0.1,
        type: types_1.UpgradeType.TrainSpeedQuicker,
        levelRequired: types_1.PlayerLevel.Intermediate
    },
    {
        name: '10% off upkeep on >= 10G/Turn Trains',
        cost: 200,
        value: 0.1,
        type: types_1.UpgradeType.TrainUpkeepCheaper,
        levelRequired: types_1.PlayerLevel.Intermediate
    },
    {
        name: 'Routes are 1 turn quicker to build',
        cost: 250,
        value: 1,
        type: types_1.UpgradeType.TurnCostCheaper,
        levelRequired: types_1.PlayerLevel.Advanced
    },
    {
        name: 'Routes are 1 turn quicker to build',
        cost: 250,
        value: 1,
        type: types_1.UpgradeType.TurnCostCheaper,
        levelRequired: types_1.PlayerLevel.Advanced
    },
    {
        name: '10% off all new Train purchases',
        cost: 300,
        value: 0.1,
        type: types_1.UpgradeType.TrainValueCheaper,
        levelRequired: types_1.PlayerLevel.Master
    },
    {
        name: '10% speed bonus to all Trains',
        cost: 300,
        value: 0.1,
        type: types_1.UpgradeType.TrainSpeedQuicker,
        levelRequired: types_1.PlayerLevel.Master
    }
];
exports.trainData = [
    {
        name: "",
        cost: [90, 110],
        upkeep: [3, 5],
        speed: [40, 50],
        cargoSpace: [4, 4],
        levelRequired: 1
    },
    {
        name: "",
        cost: [130, 150],
        upkeep: [6, 11],
        speed: [60, 80],
        cargoSpace: [4, 5],
        levelRequired: 1
    },
    {
        name: "",
        cost: [150, 160],
        upkeep: [6, 11],
        speed: [60, 80],
        cargoSpace: [5, 5],
        levelRequired: 1
    },
    {
        name: "",
        cost: [190, 210],
        upkeep: [10, 15],
        speed: [100, 120],
        cargoSpace: [5, 5],
        levelRequired: 2
    },
    {
        name: "",
        cost: [240, 260],
        upkeep: [20, 25],
        speed: [130, 140],
        cargoSpace: [5, 7],
        levelRequired: 2
    },
    {
        name: "",
        cost: [270, 300],
        upkeep: [30, 35],
        speed: [140, 160],
        cargoSpace: [6, 7],
        levelRequired: 2
    },
    {
        name: "",
        cost: [310, 330],
        upkeep: [40, 45],
        speed: [160, 180],
        cargoSpace: [8, 9],
        levelRequired: 3
    },
    {
        name: "",
        cost: [330, 350],
        upkeep: [50, 55],
        speed: [180, 200],
        cargoSpace: [8, 9],
        levelRequired: 3
    },
    {
        name: "",
        cost: [400, 450],
        upkeep: [56, 60],
        speed: [210, 250],
        cargoSpace: [10, 12],
        levelRequired: 4
    },
    {
        name: "",
        cost: [460, 500],
        upkeep: [60, 65],
        speed: [250, 280],
        cargoSpace: [10, 14],
        levelRequired: 4
    },
];
exports.highYieldData = [
    {
        name: "medicine",
        weight: 5,
        value: [80, 180],
        minValue: 80,
        maxValue: 180,
        valueVolatility: [3, 7]
    },
    {
        name: "technology",
        weight: 5,
        value: [90, 155],
        minValue: 80,
        maxValue: 180,
        valueVolatility: [1, 4]
    },
    {
        name: "arms",
        weight: 6,
        value: [140, 160],
        minValue: 100,
        maxValue: 300,
        valueVolatility: [1, 4]
    },
];
exports.mediumYieldData = [
    {
        name: "grain",
        weight: 2,
        value: [30, 45],
        minValue: 30,
        maxValue: 55,
        valueVolatility: [3, 7]
    },
    {
        name: "textiles",
        weight: 2,
        value: [25, 35],
        minValue: 20,
        maxValue: 45,
        valueVolatility: [3, 7]
    },
    {
        name: "beer",
        weight: 2,
        value: [15, 35],
        minValue: 14,
        maxValue: 45,
        valueVolatility: [5, 7]
    },
    {
        name: "ore",
        weight: 3,
        value: [25, 80],
        minValue: 25,
        maxValue: 80,
        valueVolatility: [3, 5]
    },
    {
        name: "paper",
        weight: 3,
        value: [35, 55],
        minValue: 35,
        maxValue: 80,
        valueVolatility: [4, 7]
    },
    {
        name: "coal",
        weight: 4,
        value: [45, 75],
        minValue: 45,
        maxValue: 85,
        valueVolatility: [4, 7]
    },
    {
        name: "oil",
        weight: 4,
        value: [50, 75],
        minValue: 50,
        maxValue: 85,
        valueVolatility: [4, 7]
    },
];
exports.lowYieldData = [
    {
        name: "passengers",
        weight: 1,
        value: [10, 15],
        minValue: 5,
        maxValue: 15,
        valueVolatility: [4, 7]
    },
    {
        name: "mail",
        weight: 1,
        value: [10, 15],
        minValue: 5,
        maxValue: 15,
        valueVolatility: [4, 7]
    }
];
exports.genericOpponentsName = [
    'J. Hamilton',
    'C. H. Pryce',
    'R. Hendrix',
    'P. Peterson',
    'H. Underfoot'
];
