import Resource from '../modules/core/resource';
import City from '../modules/core/city';
import Route from '../modules/core/route';
import Train from '../modules/core/train';
import Upgrade from '../modules/core/player/upgrade';
import Stock from '../modules/core/player/stock';
export declare type PartialLog = (msg: string, ...rest: any[]) => void;
export declare enum LogLevel {
    None = 0,
    Opponent = 1,
    All = 2
}
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
export declare enum FinanceType {
    Resource = 0,
    Track = 1,
    Upkeep = 2,
    Upgrade = 3,
    Train = 4,
    Recoup = 5,
    StockBuy = 6,
    StockSell = 7
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
    Stocks = 7,
    HasActiveGame = 8
}
export interface Indexable<T> {
    [key: string]: T;
}
export interface ActionSave {
    should: boolean;
    turn: number;
    diff: number;
    callback: () => boolean;
}
export interface ISaveable {
    deconstruct: () => string;
}
export interface ITurnable {
    handleTurn: (info: HandleTurnInfo) => void;
}
export interface OpponentInformation {
    type: PlayerType;
    color: string;
    avatar: number;
}
export interface GameStatus {
    id: string;
    gameOver: boolean;
}
export interface BuyOutValue {
    id: string;
    totalValue: number;
    shares: number;
}
export interface ValueHistory {
    value: number;
    turn: number;
}
export interface LevelUpRequirement {
    routes: number;
    revenuePerTurn: number;
    gold: number;
}
export interface Stocks extends Indexable<Stock> {
}
export interface StockSupply extends Indexable<number> {
}
export interface StockHolding extends Indexable<number> {
}
export interface StockConstant {
    maxStockAmount: number;
    startingShares: number;
    baseValue: number;
    multipliers: {
        stockBuy: number;
        routeLength: number;
        stockHolder: number;
    };
    divisors: {
        avgRevenue: number;
        totalProfits: number;
    };
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
    queue: QueuedRouteItem[];
    gameStocks?: Stocks;
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
export interface FinanceHistoryItem extends Indexable<FinanceTurnItem[]> {
    nthTurn: FinanceTurnItem[];
    nthTurnMinusOne: FinanceTurnItem[];
    nthTurnMinusTwo: FinanceTurnItem[];
}
export interface FinanceHistory {
    income: FinanceHistoryItem;
    expense: FinanceHistoryItem;
}
export interface FinanceTotal extends Indexable<number> {
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
