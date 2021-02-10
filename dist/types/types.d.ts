import Resource from '../modules/core/resource';
import City from '../modules/core/city';
import Route from '../modules/core/route';
import Train from '../modules/core/train';
import Upgrade from '../modules/core/player/upgrade';
export declare enum PlayerLevel {
    None = 0,
    Novice = 1,
    Intermediate = 2,
    Advanced = 3,
    Master = 4
}
export declare enum PlayerType {
    Human = 0,
    Computer = 1
}
export declare enum EventLogLevel {
    GAME = 0,
    DEBUG = 1,
    WARNING = 2,
    ERROR = 3
}
export declare enum FinanceType {
    Resource = 0,
    Track = 1,
    Upkeep = 2,
    Upgrade = 3,
    Train = 4,
    Recoup = 5
}
export declare enum FinanceGeneralType {
    Income = 0,
    Expense = 1
}
export declare enum UpgradeType {
    TrainValueCheaper = 0,
    TrainUpkeepCheaper = 1,
    TrainSpeedQuicker = 2,
    TrackValueCheaper = 3,
    TurnCostCheaper = 4
}
export declare enum LocalKey {
    Trains = 0,
    Upgrades = 1,
    Resources = 2,
    Cities = 3,
    Players = 4,
    CurrentPlayer = 5,
    Turn = 6,
    HasActiveGame = 7
}
export interface ISaveable {
    deconstruct: () => string;
}
export interface ITurnable {
    handleTurn: (info: HandleTurnInfo) => void;
}
export interface GameEvent {
    level: EventLogLevel;
    origin: string;
    message: string;
}
export interface ResourceValueHistory {
    value: number;
    turn: number;
}
export interface GameData {
    cities: City[];
    resources: Resource[];
    trains: Train[];
    upgrades: Upgrade[];
}
export interface PlayerData {
    routes: Route[];
    upgrades: Upgrade[];
}
export interface HandleTurnInfo {
    turn: number;
    data: GameData;
    playerData: PlayerData;
}
export interface QueuedRouteItem {
    route: Route;
    turnCost: number;
}
export interface CityCoordinate {
    phi: number;
    lambda: number;
}
export interface CityResource {
    resource: Resource;
    amount: number;
    available: number;
}
export interface RouteCargo {
    resource: Resource;
    targetAmount: number;
    actualAmount: number;
}
export interface RoutePlanCargo {
    cityOne: RouteCargo[];
    cityTwo: RouteCargo[];
}
export interface RouteState {
    hasArrived: boolean;
    destination: City;
    distance: number;
    cargo: RouteCargo[];
}
export interface FinanceTurnItem {
    type: FinanceType;
    id: string;
    amount: number;
    value: number;
}
export interface FinanceHistoryItem {
    [key: string]: FinanceTurnItem[];
    nthTurn: FinanceTurnItem[];
    nthTurnMinusOne: FinanceTurnItem[];
    nthTurnMinusTwo: FinanceTurnItem[];
}
export interface FinanceHistory {
    income: FinanceHistoryItem;
    expense: FinanceHistoryItem;
}
export interface FinanceTotal {
    [key: string]: number;
}
export interface PotentialRoute {
    cityOne: City;
    cityTwo: City;
    distance: number;
    goldCost: number;
    turnCost: number;
    purchasedOnTurn: number;
}
export interface BuyableRoute extends PotentialRoute {
    train: Train;
    trainCost: number;
    routePlanCargo: RoutePlanCargo;
}
export interface AdjustedTrain {
    train: Train;
    cost: number;
}
export interface RoutePower {
    expectedProfitValue: number;
    fullRevolutionInTurns: number;
    powerIndex: number;
}
export interface RoutePowerPotential {
    index: number;
    tradeableResources: number;
    suggestedRoutePlan: RoutePlanCargo;
    power: RoutePower;
}
export interface OriginRoutePotential {
    origin: City;
    aRoutes: RoutePowerPotential[];
    pRoutes: PotentialRoute[];
}
export interface IRoute {
    originIndex: number;
    aRouteIndex: number;
    powerIndex: number;
}
