import { Nardis } from '../../../nardis';
import Player from '../player';
import Finance from '../finance';
import Upgrade from '../upgrade';
import Route from '../../route';
import City from '../../city';
import Train from '../../train';
import Resource from '../../resource';
import { HandleTurnInfo, QueuedRouteItem, PlayerLevel, ActionSave } from '../../../../types/types';
/**
 * @constructor
 * @param {string}            name       - String with name.
 * @param {number}            startGold  - Number with start gold.
 * @param {City}              startCity  - City describing the start location.
 *
 * @param {Finance}           finance    - (optional) Finance instance.
 * @param {PlayerLevel}       level      - (optional) PlayerLevel.
 * @param {QueuedRouteItem[]} queue      - (optional) Array of queued Routes.
 * @param {Route[]}           routes     - (optional) Array of Routes.
 * @param {Upgrade[]}         upgrades   - (optional) Array of Upgrades.
 * @param {ActionSave}        save       - (optional) Object with save information.
 * @param {string}            id         - (optional) String number describing id.
 */
export default class Opponent extends Player {
    private _save;
    constructor(name: string, startGold: number, startCity: City, finance?: Finance, level?: PlayerLevel, queue?: QueuedRouteItem[], routes?: Route[], upgrades?: Upgrade[], save?: ActionSave, id?: string);
    /**
     * Handle Opponent events and actions.
     *
     * @param {HandleTurnInfo} info - Object with relevant turn information.
     * @param {Nardis}         game - Nardis game instance.
     */
    handleTurn: (info: HandleTurnInfo, game: Nardis) => void;
    setSave: (save: ActionSave) => void;
    /**
     * @returns {string} String with JSON stringified property keys and values.
     */
    deconstruct: () => string;
    /**
     * There are basically five actions:
     * - Buy Route
     * - Buy Upgrade
     * - Buy Stock
     * - Delete Route
     * - Sell Stock
     *
     * Upgrades should be prioritized, then Stock options and then purchase of Routes.
     * Lastly, delete and recoup the cost of consistently unprofitable Routes.
     *
     * It is also possible to alter an unprofitable Route to potentially make it profitable,
     * if, say, new Trains or Resources becomes available. However, that, for now, is not utilized by Opponent.
     *
     * @param {HandleTurnInfo} info - Object with relevant turn information.
     * @param {Nardis}         game - Nardis game instance.
     */
    private deduceAction;
    /**
     * Iterate over each unique origin. Then iterate over routes from that origin.
     * Filter for affordable Routes and sort for highest potential profitability.
     *
     * @param   {Nardis}                 game  - Nardis game instance.
     * @param   {AdjustedTrain}          train - AdjustedTrain object.
     *
     * @returns {OriginRoutePotential[]} Array of origins and their respective routes.
     */
    private getInterestingRoutes;
    /**
     * Reduce an array of OriginRoutePotential to a sorted array of BuyableRoutes with length n.
     *
     * @param   {OriginRoutePotential[]} routes - Array of origins and their respective routes.
     * @param   {number}                 n      - Number with length of returned array.
     * @param   {AdjustedTrain}          train  - AdjustedTrain object.
     *
     * @returns {BuyableRoute[]}         Array of BuyableRoute objects ready to be purchased.
     */
    private pickNInterestingRoutes;
    /**
     * Buy all available upgrades.
     *
     * @param {HandleTurnInfo} info - Object with relevant turn information.
     * @param {Nardis}         game - Nardis game instance.
     */
    private buyAvailableUpgrades;
    /**
     * Each origin will have its own unique routes. There can be multiple origins each with multiple routes.
     * Assign a "power index" to each route associated with each origin. Higher the index, better the route.
     *
     * @param   {Nardis}                 game           - Nardis game instance.
     * @param   {AdjustedTrain}          suggestedTrain - AdjustedTrain object.
     *
     * @returns {OriginRoutePotential[]} Array of OriginRoutePotentials from each unique origin.
     */
    private getRoutePowerPotential;
    /**
     * Get RoutePower of a potential route by asking a few questions.
     *
     * What would the expected profit be from a full revolution? That is from origin, to destination and back again.
     * How many turns will it take? The power index is the expected profit over the turns a full revolution requires.
     *
     * @param   {number}         distance  - Number with distance in kilometers.
     * @param   {Train}          train     - Train instance to be used.
     * @param   {RoutePlanCargo} routePlan - RoutePlanCargo object with suggested cargo.
     *
     * @returns {RoutePower}     RoutePower object for the given parameters.
     */
    private getPower;
    /**
     * Get suggested RoutePlanCargo for a given route between two cities.
     *
     * @param   {PotentialRoute} route           - PotentialRoute object.
     * @param   {number}         cargoConstraint - Number of available cargo spaces.
     *
     * @returns {RoutePlanCargo} RoutePlanCargo suggested for the route.
     */
    private getSuggestedRoutePlan;
    /**
     * // TODO
     */
    private inspectStockOptions;
    /**
     * Get array of suggested RouteCargo for a given route.
     *
     * Supply will be medium-to-high-yield Resources. Filler will be the two low-yield Resources.
     * Prioritize supply but if all are either not demand in destination or weights more than current cargoConstraint,
     * then fill up the rest of the cargo space with filler Resources.
     *
     * @param   {CityResource[]}               supply          - Array of CityResources to be used.
     * @param   {City}                         destination     - City instance to check demand from.
     * @param   {number}                       cargoConstraint - Number of available cargo spaces.
     * @param   {[CityResource, CityResource]} fillers         - Tuple of two low-yield CityResources.
     *
     * @returns {RouteCargo[]}                 Array of suggested RouteCargo.
     */
    private getSuggestedCargo;
    /**
     * Get an array of filler CityResources within the given constraint.
     *
     * @param   {number}                       cargoConstraint - Number of available cargo spaces.
     * @param   {[CityResource, CityResource]} fillers         - Tuple of two low-yield CityResources.
     *
     * @returns {RouteCargo[]}                 Array of filler CityResources.
     */
    private getFillerCargo;
    /**
     * Get number with limit of purchasing Routes. Not a great logic thus far. Needs to be re-looked at.
     *
     * @param   {OriginRoutePotential[]} originRoutes - Array of OriginRoutePotentials.
     *
     * @returns {number}                 Number with suggested limit of Route purchase.
     */
    private getN;
    /**
     * The default state is basically to buy Routes unless cash is needed for level up or stock purchase.
     *
     * @param   {number}  turn - Number with current turn.
     *
     * @returns {boolean} True if should purchase Route else false.
     */
    private shouldPurchaseRoutes;
    /**
     * Purchase the given Routes until respecting some generic constraints for gold and queue length.
     *
     * @param {Nardis}         game   - Nardis game instance.
     * @param {BuyableRoute[]} routes - BuyableRoutes to purchase.
     */
    private purchaseRoutes;
    /**
     * // TODO
     */
    private deleteConsistentlyUnprofitableRoutes;
    /**
     * Get optimal Train by finding the valueRatio of each Train,
     * which is the sum of cost and upkeep over the sum of the speed and space.
     *
     * @param   {AdjustedTrain[]} trains - Array of AdjustedTrains to be used.
     *
     * @returns {AdjustedTrain}   AdjustedTrain object.
     */
    private getSuggestedTrain;
    /**
     * Get array of all cities currently connected to the Route network of the player. These cities will
     * serve as potential origins for new routes.
     *
     * @returns {City[]} Array of unique City origins.
     */
    private getUniqueOrigins;
    /**
     * For debugging purposes.
     *
     * @param {string} msg - String with message to log.
     *
     * @param {any}    obj - (optional) object to log.
     */
    private log;
    /**
     * Get Opponent instance from stringified JSON.
     *
     * @param  {string}     stringifiedJSON - String with information to be used.
     * @param  {City[]}     cities          - City instances used in the current game.
     * @param  {Train[]}    trains          - Train instances used in the current game.
     * @param  {Resource[]} resources       - Resource instances used in the current game.
     * @param  {Upgrades[]} upgrades        - Upgrade instances used in the current game.
     *
     * @return {Opponent}   Opponent instance created from stringifiedJSON.
     */
    static createFromStringifiedJSON: (stringifiedJSON: string, cities: City[], trains: Train[], resources: Resource[], upgrades: Upgrade[]) => Player;
}
