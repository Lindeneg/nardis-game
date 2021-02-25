import City from './core/city';
import Player from './core/player/player';
import Train from './core/train';
import { GameData, PotentialRoute, BuyableRoute, RoutePlanCargo, AdjustedTrain, Stocks, GameStatus } from '../types/types';
/**
 * @constructor
 * @param {GameData} data          - Object with GameData.
 * @param {Player[]} players       - Array with Players.
 * @param {Stocks}   stocks        - Object with Stocks.
 *
 * @param {Player}   currentPlayer - (optional) Player instance of the current turn taker.
 * @param {number}   turn          - (optional) Number describing the current turn.
 */
export declare class Nardis {
    readonly data: GameData;
    readonly players: Player[];
    readonly stocks: Stocks;
    private _currentPlayer;
    private _turn;
    private log;
    constructor(gameData: GameData, players: Player[], stocks: Stocks, currentPlayer?: Player, turn?: number);
    getCurrentPlayer: () => Player;
    getCurrentTurn: () => number;
    /**
     * Runs at the end of each human Player turn.
     */
    endTurn: () => void;
    /**
     * Get array of PotentialRoute objects respecting the current Players maximum range.
     *
     * @param   {City}              origin - City instance of initial departure.
     *
     * @returns {PotentialRoute[]}  Array of PotentialRoutes.
     */
    getArrayOfPossibleRoutes: (origin: City) => PotentialRoute[];
    /**
     * @returns {AdjustedTrain[]} Array of Trains with their cost adjusted to reflect potential Player Upgrades.
     */
    getArrayOfAdjustedTrains: () => AdjustedTrain[];
    /**
     * Check if a single Player is left and thus is the winner of the game.
     *
     * @returns {GameStatus} GameStatus of the Nardis instance in question.
     */
    getGameStatus: () => GameStatus;
    /**
     * Add an entry to Player queue.
     *
     * @param {BuyableRoute} buyableRoute - BuyableRoute to add.
     */
    addRouteToPlayerQueue: (buyableRoute: BuyableRoute) => void;
    /**
     * Add Upgrade to Player.
     *
     * @param   {string}   id - String with id of Upgrade to add.
     *
     * @returns {boolean}  True if Upgrade was added else false.
     */
    addUpgradeToPlayer: (id: string) => boolean;
    /**
     * Change Train and/or RoutePlanCargo of active Route.
     *
     * @param   {string}         id        - String with id of Route to alter.
     * @param   {Train}          train     - Train instance to be used.
     * @param   {RoutePlanCargo} routePlan - RoutePlanCargo to be used.
     * @param   {number}         cost      - Number with cost of the Route change.
     *
     * @returns {boolean}        True if Route was altered else false.
     */
    changeActivePlayerRoute: (routeId: string, train: Train, routePlan: RoutePlanCargo, cost: number) => boolean;
    /**
     * Remove an entry from Player queue.
     *
     * @param   {string}   routeId - String with id of Route to remove.
     * @param   {string}   trainId - String with id of Train in Route.
     *
     * @returns {boolean}  True if Route was removed from queue else false.
     */
    removeRouteFromPlayerQueue: (routeId: string, trainId: string) => boolean;
    /**
     * Remove an entry from Player routes.
     *
     * @param   {string}   routeId  - String with id of Route to remove.
     * @param   {number}   value    - Number wih gold to recoup.
     *
     * @returns {boolean}  True if Route was removed from routes else false.
     */
    removeRouteFromPlayerRoutes: (routeId: string, value: number) => boolean;
    /**
     * Buyout Player(s) of a certain Stock and take over the owning Player.
     *
     * @param   {string}  playerId   - String with Id of the 'losing' Player.
     *
     * @param   {boolean} selfBuyOut - (optional) Boolean describing if the takeover is from/to the same Player.
     *
     * @returns {boolean} True if Player was bought out else False.
     */
    buyOutPlayer: (playerId: string, selfBuyOut?: boolean) => boolean;
    /**
     * Buy Stock to the Player of the current turn.
     *
     * @param   {string}  playerId - String with id of the owning player of Stock to buy.
     *
     * @returns {boolean} True if Stock was bought else false.
     */
    buyStock: (playerId: string) => boolean;
    /**
     * Sell Stock to the Player of the current turn.
     *
     * @param   {string}  playerId - String with id of the owning player of Stock to sell.
     *
     * @returns {boolean} True if Stock was sold else false.
     */
    sellStock: (playerId: string) => boolean;
    /**
     * Clear the saved game state from localStorage.
     */
    clearStorage: () => void;
    /**
     * Buy or Sell Stock to the Player of the current turn.
     *
     * @param   {string}  playerId - String with id of the owning player of Stock to buy/sell.
     * @param   {boolean} buy      - True if action should be buy, false if action should be sell.
     *
     * @returns {boolean} True if action was performed else false.
     */
    private performStockAction;
    /**
     * Check if a Player is fully owned by a foreign Player. If so, perform a Player takeover.
     *
     * @param {Player} stockOwner - Player instance to check if owned by another Player.
     */
    private checkIfPlayerIsFullyOwned;
    /**
     * Update the net worth of every Player in the game.
     */
    private updatePlayersNetWorth;
    /**
     * Update net worth of a single Player
     *
     * @param {Player} player - Player instance whose net worth to update.
     */
    private updatePlayerNetWorth;
    /**
     * Update the value of every Stock in game.
     */
    private updateStocks;
    /**
     * Update value of Stock associated with a given Player.
     *
     * @param {Player} player - Player instance whose Stock value should be updated.
     */
    private updateStock;
    /**
     * Merge loser Player with victor Player, if the latter is taking over the former.
     * Merge all Routes, Upgrades, Gold and Stock.
     *
     * @param {Player} victor - Player instance taking over.
     * @param {Player} loser  - Player instance being taken over.
     * @param {Stock}  stock  - Stock instance of the losing Player.
     */
    private playerTakeOver;
    /**
     * Merge losing Player Stock into winning Player Stock.
     *
     * @param {Player} victor - Player instance taking over.
     * @param {Player} loser  - Player instance being taken over.
     *
     * @returns {[number, number]} Tuple with two numbers describing merged amount of Stock and shares.
     */
    private mergeStock;
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
     * @param   {string}   routeId - String with id of Route to remove.
     * @param   {string}   trainId - String with id of Train in Route.
     *
     * @returns {boolean}  True if removed from Finance else false.
     */
    private handleRemoveRouteFromPlayerFinance;
    /**
     * Get an object describing the gold and turn cost for a given Route with Upgrades taken into account.
     *
     * @param   {number}  distance - String with id of Route to remove.
     *
     * @returns {Object}  Object with gold and turn cost for a given distance
     */
    private getPotentialRouteCost;
    /**
     * Save the complete state of the game to localStorage.
     */
    private saveGame;
    /**
     * Get Nardis instance from saved localStorage data.
     *
     * @returns {Nardis} Nardis instance recreated from localStorage.
     */
    static createFromLocalStorage: () => Nardis;
    /**
     * Create a Nardis instance from one to three parameters.
     *
     * @param   {string}   name      - String with name of player.
     * @param   {number}   gold      - (optional) Number specifying start gold.
     * @param   {number}   opponents - (optional) Number specifying number of opponents.
     *
     * @returns {Nardis}   Created Nardis instance.
     */
    static createFromPlayer: (name: string, gold?: number, opponents?: number) => Nardis;
    /**
     * Generate Players and Stocks.
     *
     * @param   {string}  name      - String with name of human Player.
     * @param   {number}  gold      - Number with starting gold.
     * @param   {number}  opponents - Number of Opponents to generate.
     * @param   {City[]}  cities    - Array of City instances.
     *
     * @returns {[Player[], Stocks]} Tuple with array of Players and a Stocks object.
     */
    private static createPlayersAndStock;
}
