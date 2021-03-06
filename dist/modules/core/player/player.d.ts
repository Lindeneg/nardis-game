import BaseComponent from '../../component/base-component';
import Finance from './finance';
import Upgrade from './upgrade';
import City from '../city';
import Train from '../train';
import Resource from '../resource';
import Route from '../route';
import { Nardis } from '../../nardis';
import { QueuedRouteItem, HandleTurnInfo, ITurnable, PlayerType, PlayerLevel, PartialLog } from '../../../types/types';
/**
 * @constructor
 * @param {string}            name       - String with name.
 * @param {number}            startGold  - Number with start gold.
 * @param {PlayerType}        playerType - PlayerType either human or computer.
 * @param {City}              startCity  - City describing the start location.
 *
 * @param {Finance}           finance    - (optional) Finance instance.
 * @param {PlayerLevel}       level      - (optional) PlayerLevel.
 * @param {QueuedRouteItem[]} queue      - (optional) Array of queued Routes.
 * @param {Route[]}           routes     - (optional) Array of Routes.
 * @param {Upgrade[]}         upgrades   - (optional) Array of Upgrades.
 * @param {boolean}           isActive   - (optional) Boolean with active specifier.
 * @param {string}            id         - (optional) String number describing id.
 */
export default class Player extends BaseComponent implements ITurnable {
    readonly startGold: number;
    readonly playerType: PlayerType;
    protected _startCity: City;
    protected _finance: Finance;
    protected _level: PlayerLevel;
    protected _range: number;
    protected _queue: QueuedRouteItem[];
    protected _routes: Route[];
    protected _upgrades: Upgrade[];
    protected _isActive: boolean;
    protected log: PartialLog;
    constructor(name: string, startGold: number, playerType: PlayerType, startCity: City, finance?: Finance, level?: PlayerLevel, queue?: QueuedRouteItem[], routes?: Route[], upgrades?: Upgrade[], isActive?: boolean, id?: string);
    getStartCity: () => City;
    getFinance: () => Finance;
    getLevel: () => PlayerLevel;
    getRange: () => number;
    getQueue: () => QueuedRouteItem[];
    getRoutes: () => Route[];
    getUpgrades: () => Upgrade[];
    isActive: () => boolean;
    /**
     * Handle Player events by checking if level should be increased.
     * Then handle Route queue, built Routes and Finance.
     *
     * @param {HandleTurnInfo} info - Object with relevant turn information.
     *
     * @param {Nardis}         game - (optional) Nardis game instance.
     */
    handleTurn: (info: HandleTurnInfo, game?: Nardis) => void;
    /**
     * Check if level should be increased and act accordingly.
     */
    checkLevel: () => void;
    /**
     * Merge current Route array with another,
     *
     * @param   {Route[]} routes - Array of Routes to append to active Route array.
     *
     * @returns {number}  Number with amount of Routes appended to Player.
     */
    mergeRoutes: (routes: Route[]) => number;
    /**
     * Merge current queue array with another,
     *
     * @param   {QueuedRouteItem[]} queue - Array of QueuedRouteItem to append to current queue array.
     *
     * @returns {number}            Number with amount of Routes appended to Player.
     */
    mergeQueue: (queue: QueuedRouteItem[]) => number;
    /**
     * Set Player to inactive. Also removes all Routes and Upgrades.
     */
    setInactive: () => void;
    /**
     * Add Route to queue.
     *
     * @param {Route} route    - Route instance to be added.
     * @param {Route} turnCost - Number describing turn cost.
     */
    addRouteToQueue: (route: Route, turnCost: number) => void;
    /**
     * Remove Route from queue.
     *
     * @param   {string}  id - String with id of Route to remove.
     *
     * @returns {boolean} True if the Route was removed from queue else false.
     */
    removeRouteFromQueue: (id: string) => boolean;
    /**
     * Remove Route from routes.
     *
     * @param   {string}  id - String with id of Route to remove.
     *
     * @returns {boolean} True if the Route was removed from queue else false.
     */
    removeRouteFromRoutes: (id: string) => boolean;
    /**
     * Add Upgrade.
     *
     * @param {Upgrade} upgrade - Upgrade to add.
     */
    addUpgrade: (upgrade: Upgrade) => void;
    /**
     * @returns {string} String with JSON stringified property keys and values.
    */
    deconstruct: () => string;
    /**
     * Handle all Routes in queue by checking current turn cost,
     * If non-positive, remove from queue and add to Routes,
     * else decrement current turn cost by one.
     */
    protected handleQueue: () => void;
    /**
     * Handle all Routes each turn.
     *
     * @param {HandleTurnInfo} info - Object with relevant turn information.
     */
    protected handleRoutes: (info: HandleTurnInfo) => void;
    /**
     * Handle Finance each turn.
     *
     * @param {HandleTurnInfo} info - Object with relevant turn information.
     */
    protected handleFinance: (info: HandleTurnInfo) => void;
    /**
     * @returns {boolean} True if level should be increased else false.
     */
    protected shouldLevelBeIncreased: () => boolean;
    /**
     * @returns {boolean} True if level did increase else false.
     */
    protected increaseLevel: () => boolean;
    /**
     * @returns {number} Number describing maximum Route distance given current level.
     */
    protected getRangeFromLevel: () => number;
    /**
     * Get Player instance from stringified JSON.
     *
     * @param   {string}     stringifiedJSON - String with information to be used.
     * @param   {City[]}     cities          - City instances used in the current game.
     * @param   {Train[]}    trains          - Train instances used in the current game.
     * @param   {Resource[]} resources       - Resource instances used in the current game.
     * @param   {Upgrades[]} upgrades        - Upgrade instances used in the current game.
     *
     * @returns {Player}     Player instance created from stringifiedJSON.
     */
    static createFromStringifiedJSON: (stringifiedJSON: string, cities: City[], trains: Train[], resources: Resource[], upgrades: Upgrade[]) => Player;
}
