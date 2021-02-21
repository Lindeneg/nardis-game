"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.possibleCityCoords = exports.CitySizeMaxConcurrentRoutes = exports.citySizes = exports.resourcePerSize = exports.resourcesPerSize = exports.rangePerLevel = exports.levelUpRequirements = exports.rangeCost = exports.stockConstant = exports.netWorthDivisors = exports.eventLogLevelName = exports.localKeys = exports.playerLevelMapping = exports.CONSONANTS = exports.VOWELS = exports.ID_CHARS = exports.ID_LENGTH = exports.START_OPPONENTS = exports.START_GOLD = exports.MAP_RADIUS_IN_KILOMETERS = exports.MAX_CITY_SIZE = exports.RESOURCE_VALUE_DECISION_TARGET = exports.CITY_GROWTH_DECISION_TARGET = exports.MAX_START_CITY_SIZE = exports.MAX_VALUE_HISTORY_LENGTH = void 0;
var types_1 = require("../types/types");
exports.MAX_VALUE_HISTORY_LENGTH = 100;
exports.MAX_START_CITY_SIZE = 2;
exports.CITY_GROWTH_DECISION_TARGET = 5;
exports.RESOURCE_VALUE_DECISION_TARGET = 1;
exports.MAX_CITY_SIZE = 6;
exports.MAP_RADIUS_IN_KILOMETERS = 6371;
exports.START_GOLD = 1000;
exports.START_OPPONENTS = 3;
exports.ID_LENGTH = 32;
exports.ID_CHARS = 'abcdef0123456789';
exports.VOWELS = 'aeiou'.split('');
exports.CONSONANTS = 'bcdfghjklmnpqrstvwxzy'.split('');
exports.playerLevelMapping = [
    types_1.PlayerLevel.None,
    types_1.PlayerLevel.Novice,
    types_1.PlayerLevel.Intermediate,
    types_1.PlayerLevel.Advanced,
    types_1.PlayerLevel.Master
];
exports.localKeys = [
    'MuZq5yMeusLEOuMhEVq2MC7QehQDZanN',
    'ks4n0sZBHpRthXKQGs0VJhUeujxOnOa0',
    '44KBCanpVD8Wqmc9A9GUQFDlGrVY6D1H',
    'pNWKr11c1EzJQUgl9JzwBme4OpBUlftw',
    'GQnsccS7Gmb9kmZoP4lakp3TIPGvwf07',
    'rDkvsVkOzCBZOyhAKF8bljAVgclTiCAC',
    'QeBo7Miy3RIPHh8mbxWdqoAXny8TsLuF',
    '0nfKAvFjzJY8H1h9tacz9zzdf0RLlcbl',
    'uyyoGf0N76Bg9Wdz3Pzfakw40iyEjFDx'
];
exports.eventLogLevelName = [
    'game',
    'debug',
    'warning',
    'error'
];
exports.netWorthDivisors = {
    gold: 1,
    stock: 1,
    tracks: 1.5,
    train: 2,
    upgrade: 2.5
};
exports.stockConstant = {
    maxStockAmount: 10,
    startingShares: 4,
    baseValue: 50,
    multipliers: {
        stockBuy: 1.25,
        routeLength: 1.8,
        stockHolder: 20
    },
    divisors: {
        avgRevenue: 35,
        totalProfits: 70
    }
};
exports.rangeCost = {
    "0,100": 1,
    "100,175": 2,
    "175,210": 3,
    "210,260": 4,
    "260,10000": 5
};
exports.levelUpRequirements = [
    {
        routes: 0,
        revenuePerTurn: 0,
        gold: 0
    },
    {
        routes: 2,
        revenuePerTurn: 50,
        gold: 0
    },
    {
        routes: 5,
        revenuePerTurn: 150,
        gold: 500
    },
    {
        routes: 10,
        revenuePerTurn: 300,
        gold: 850
    },
    {
        routes: 15,
        revenuePerTurn: 500,
        gold: 1000
    }
];
exports.rangePerLevel = [0, 125, 170, 230, 300];
// index corresponds to size - 1, value to resource amount
exports.resourcesPerSize = [2, 3, 3, 4, 5, 5];
// index corresponds to size - 1, value to resource amount range
exports.resourcePerSize = [[4, 6], [6, 8], [8, 12], [12, 16], [16, 20], [20, 25]];
// distribution of possible city sizes
exports.citySizes = [6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1];
exports.CitySizeMaxConcurrentRoutes = [
    {
        size: 0,
        maxRoutes: 0
    },
    {
        size: 1,
        maxRoutes: 2
    },
    {
        size: 2,
        maxRoutes: 4
    },
    {
        size: 3,
        maxRoutes: 7
    },
    {
        size: 4,
        maxRoutes: 11
    },
    {
        size: 5,
        maxRoutes: 15
    },
    {
        size: 6,
        maxRoutes: 20
    }
];
exports.possibleCityCoords = [
    [54.88, -2.93],
    [54.4863, 0.6133],
    [51.1337, 1.3],
    [50.7004, -3.53],
    [52.9333, -1.5],
    [52.6304, 1.3],
    [51.7704, -1.25],
    [52.2004, 0.1166],
    [55.0004, -1.6],
    [53.9704, -1.08],
    [52.9703, -1.17],
    [50.8303, -0.17],
    [50.9, -1.4],
    [50.3854, -4.16],
    [52.63, -1.1332],
    [51.45, -2.5833],
    [53.83, -1.58],
    [53.5004, -2.248],
    [53.416, -2.918],
    [52.475, -1.92],
    [51.5, -0.1167],
];
