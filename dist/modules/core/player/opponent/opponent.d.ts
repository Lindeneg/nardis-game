import { Nardis } from '../../../nardis';
import Player from '../player';
import Finance from '../finance';
import Upgrade from '../upgrade';
import Route from '../../route';
import City from '../../city';
import Train from '../../train';
import Resource from '../../resource';
import { HandleTurnInfo, QueuedRouteItem, PlayerLevel } from '../../../../types/types';
interface ActionSave {
    should: boolean;
    turn: number;
    diff: number;
}
export default class Opponent extends Player {
    private _save;
    constructor(name: string, startCity: City, finance?: Finance, level?: PlayerLevel, queue?: QueuedRouteItem[], routes?: Route[], upgrades?: Upgrade[], save?: ActionSave, id?: string);
    handleTurn: (info: HandleTurnInfo, game: Nardis) => void;
    setSave: (save: ActionSave) => void;
    deconstruct: () => string;
    /**
     * Main function for deducing the best action for the non-human player in question.
     */
    private deduceAction;
    /**
     * Iterate over each unique origin. Then iterate over routes from that origin.
     * Sort those routes after highest potential profitability.
     */
    private getInterestingRoutes;
    /**
     * Reduce an array of OriginRoutePotential to a sorted array of BuyableRoutes with length n.
     */
    private pickNInterestingRoutes;
    /**
     * Buy all available upgrades but respect the maxSpend constraint.
     */
    private buyAvailableUpgrades;
    /**
     * Each origin will have its own unique routes. There can be multiple origins each with multiple routes.
     * Assign a "power index" to each route associated with each origin. Higher the index, better the route.
     */
    private getRoutePowerPotential;
    /**
     * What would the expected profit be from a full revolution? That is from origin, to destination and back again.
     * How many turns will it take? The power index is the expected profit over the turns a full revolution requires.
     */
    private getPower;
    /**
     * Try and deduce the best RoutePlanCargo for a given route between two cities.
     */
    private getSuggestedRoutePlan;
    private inspectStockOptions;
    /**
     * Supply will be medium-to-high-yield Resources. Filler will be the two low-yield Resources.
     * Prioritize supply but if all are either not demand in destination or weights more than current cargoConstraint,
     * then fill up the rest of the cargo space with filler Resources.
     */
    private getSuggestedCargo;
    private getN;
    private shouldPurchaseRoutes;
    private purchaseRoutes;
    private deleteConsistentlyUnprofitableRoutes;
    /**
     * Find the valueRatio of each Train, which is cost (negative) over the sum of the speed and space (positive).
     */
    private getSuggestedTrain;
    /**
     * Get array of all cities currently connected to the Route network of the player. These cities will
     * serve as potential origins for new routes.
     */
    private getUniqueOrigins;
    /**
     * Temp for debug purposes
     */
    private log;
    /**
     * Get Player instance from stringified JSON.
     *
     * @param {string}     stringifiedJSON - String with information to be used.
     * @param {City[]}     cities          - City instances used in the current game.
     * @param {Upgrades[]} upgrades        - Upgrade instances used in the current game.
     *
     * @return {Player}                      Player instance created from stringifiedJSON.
     */
    static createFromStringifiedJSON: (stringifiedJSON: string, cities: City[], trains: Train[], resources: Resource[], upgrades: Upgrade[]) => Player;
}
export {};
