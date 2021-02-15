import { PlayerLevel } from '../types/types';
export declare const MAX_VALUE_HISTORY_LENGTH: number;
export declare const MAX_START_CITY_SIZE: number;
export declare const CITY_GROWTH_DECISION_TARGET: number;
export declare const RESOURCE_VALUE_DECISION_TARGET: number;
export declare const MAX_CITY_SIZE: number;
export declare const MAP_RADIUS_IN_KILOMETERS: number;
export declare const START_GOLD: number;
export declare const START_OPPONENTS: number;
export declare const ID_LENGTH: number;
export declare const ID_CHARS: string;
export declare const VOWELS: string[];
export declare const CONSONANTS: string[];
export declare const playerLevelMapping: PlayerLevel[];
export declare const localKeys: string[];
export declare const eventLogLevelName: string[];
export declare const netWorthDivisors: {
    gold: number;
    stock: number;
    tracks: number;
    train: number;
    upgrade: number;
};
export declare const stockConstant: {
    maxStockAmount: number;
    startingShares: number;
    multipliers: {
        stockBuy: number;
        routeLength: number;
        stockHolder: number;
    };
    divisors: {
        avgRevenue: number;
        totalProfits: number;
    };
};
export declare const rangeCost: {
    "0,100": number;
    "100,175": number;
    "175,210": number;
    "210,260": number;
    "260,10000": number;
};
export declare const levelUpRequirements: {
    routes: number;
    revenuePerTurn: number;
    gold: number;
}[];
export declare const rangePerLevel: number[];
export declare const resourcesPerSize: number[];
export declare const resourcePerSize: [number, number][];
export declare const citySizes: number[];
export declare const CitySizeMaxConcurrentRoutes: {
    size: number;
    maxRoutes: number;
}[];
export declare const possibleCityCoords: [number, number][];
