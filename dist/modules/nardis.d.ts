import City from './core/city';
import Player from './core/player/player';
import Train from './core/train';
import { GameData, PotentialRoute, BuyableRoute, RoutePlanCargo, AdjustedTrain, Stocks } from '../types/types';
/**
 * @constructor
 * @param {GameData} data          - Object with GameData.
 * @param {Player[]} players       - Array with Players.
 *
 * @param {Player}   currentPlayer - (optional) Player instance of the current turn taker.
 * @param {number}   currentTurn   - (optional) Number describing the current turn.
 */
export declare class Nardis {
    readonly data: GameData;
    readonly players: Player[];
    readonly stocks: Stocks;
    private _currentPlayer;
    private _turn;
    constructor(gameData: GameData, players: Player[], stocks: Stocks, currentPlayer?: Player, turn?: number);
    getCurrentPlayer: () => Player;
    getCurrentTurn: () => number;
    /**
     * Runs at the end of each Player turn.
     */
    endTurn: () => void;
    /**
     * Get array of PotentialRoute objects respecting the current Players maximum range.
     *
     * @param {City}              origin - City instance of initial departure
     *
     * @return {PotentialRoute[]}          Array of PotentialRoutes
     */
    getArrayOfPossibleRoutes: (origin: City) => PotentialRoute[];
    /**
     * @return {{train: Train, cost: number}[]} Array of Trains with their cost adjusted to reflect potential Player Upgrades.
     */
    getArrayOfAdjustedTrains: () => AdjustedTrain[];
    /**
     * @return {object} Object describing the current win state.
     *
     * // TODO update winning condition when net worth and stock is implemented
     */
    hasAnyPlayerWon: () => {
        player: Player;
        hasWon: boolean;
    };
    /**
     * Add an entry to Player queue.
     *
     * @param {BuyableRoute} buyableRoute - BuyableRoute to add.
     */
    addRouteToPlayerQueue: (buyableRoute: BuyableRoute) => void;
    /**
     * Add Upgrade to Player.
     *
     * @param {string}   id - String with id of Upgrade to add.
     *
     * @return {boolean} True if Upgrade was added else false.
     */
    addUpgradeToPlayer: (id: string) => boolean;
    /**
     * Change Train and/or RoutePlanCargo of active Route.
     *
     * @param {string}         id        - String with id of Route to alter.
     * @param {Train}          train     - Train instance to be used.
     * @param {RoutePlanCargo} routePlan - RoutePlanCargo to be used.
     * @param {number}         cost      - Number with cost of the Route change.
     *
     * @return {boolean} True if Route was altered else false.
     */
    changeActivePlayerRoute: (routeId: string, train: Train, routePlan: RoutePlanCargo, cost: number) => boolean;
    /**
     * Remove an entry from Player queue.
     *
     * @param {string}   routeId - String with id of Route to remove.
     * @param {string}   trainId - String with id of Train in Route.
     *
     * @return {boolean} True if Route was removed from queue else false.
     */
    removeRouteFromPlayerQueue: (routeId: string, trainId: string) => boolean;
    /**
     * Remove an entry from Player routes.
     *
     * @param {string}   routeId - String with id of Route to remove.
     * @param {number}   value - Number wih gold to recoup
     *
     * @return {boolean} True if Route was removed from routes else false.
     */
    removeRouteFromPlayerRoutes: (routeId: string, value: number) => boolean;
    /**
     * Clear the saved game state from localStorage.
     */
    clearStorage: () => void;
    /**
     * Iterate over each Computer player and handle their turns accordingly.
     */
    private handleComputerTurn;
    /**
     * Handle Player expenses when purchasing a new Route and Train.
     *
     * @param {BuyableRoute} buyableRoute - BuyableRoute object.
     * @param {string}       id           - String with id of the Route.
     */
    private handleNewRoutePlayerFinance;
    /**
     * Remove Player expenses when reverting the purchase of Route and Train.
     *
     * @param {string}   routeId - String with id of Route to remove.
     * @param {string}   trainId - String with id of Train in Route.
     *
     * @return {boolean} True if removed from Finance else false.
     */
    private handleRemoveRouteFromPlayerFinance;
    /**
     * Get an object describing the gold and turn cost for a given Route with Upgrades taken into account.
     *
     * @param {number}   distance - String with id of Route to remove.
     *
     * @return {Object}             Object with gold and turn cost for a given distance
     */
    private getPotentialRouteCost;
    /**
     * Save the complete state of the game to localStorage.
     */
    private saveGame;
    /**
     * Get Nardis instance from saved localStorage data.
     *
     * @return {Nardis} Nardis instance recreated from localStorage.
     */
    static createFromLocalStorage: () => Nardis;
    /**
     * Create a Nardis instance from one to three parameters.
     *
     * @param {string}   name      - String with name of player.
     * @param {number}   gold      - (optional) Number specifying start gold.
     * @param {number}   opponents - (optional) Number specifying number of opponents.
     *
     * @return {Nardis}              Created Nardis instance.
     */
    static createFromPlayer: (name: string, gold?: number, opponents?: number) => Nardis;
    private static createPlayersAndStock;
}
