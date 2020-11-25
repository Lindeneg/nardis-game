import { UpgradeType, PlayerLevel } from "./types";
export interface DataTrainModel {
    name: string;
    cost: [number, number];
    upkeep: [number, number];
    speed: [number, number];
    cargoSpace: [number, number];
    levelRequired: number;
}
export interface DataResourceModel {
    name: string;
    weight: number;
    value: [number, number];
    minValue: number;
    maxValue: number;
    valueVolatility: [number, number];
}
export interface TrainModel {
    name: string;
    cost: number;
    upkeep: number;
    speed: number;
    cargoSpace: number;
    levelRequired: number;
}
export interface ResourceModel {
    name: string;
    weight: number;
    value: number;
    minValue: number;
    maxValue: number;
    valueVolatility: number;
}
export interface CityResourceModel {
    name: string;
    amount: number;
    available: number;
}
export interface CityModel {
    name: string;
    size: number;
    phi: number;
    lambda: number;
    supply: CityResourceModel[];
    demand: CityResourceModel[];
    growthRate: number;
    supplyRefillRate: number;
}
export interface UpgradeModel {
    name: string;
    type: UpgradeType;
    levelRequired: PlayerLevel;
    value: number;
    cost: number;
}
export interface RawDataModel {
    cities: CityModel[];
    trains: TrainModel[];
    resources: ResourceModel[];
    upgrades: UpgradeModel[];
}
