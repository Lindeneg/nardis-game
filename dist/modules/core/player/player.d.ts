import BaseComponent from '../../component/base-component';
import Finance from './finance';
import Upgrade from './upgrade';
import City from '../city';
import Train from '../train';
import Resource from '../resource';
import Route from '../route';
import { QueuedRouteItem, HandleTurnInfo, ITurnable, PlayerType, PlayerLevel } from '../../../types/types';
import { Nardis } from '../../..';
/**
 * @constructor
 * @param {string}            name       - String with name.
 * @param {PlayerType}        playerType - PlayerType either human or computer.
 * @param {City}              startCity  - City describing the start location.
 *
 * @param {Finance}           finance    - (optional) Finance instance.
 * @param {PlayerLevel}       level      - (optional) PlayerLevel.
 * @param {QueuedRouteItem[]} queue      - (optional) Array of queued Routes.
 * @param {Route[]}           routes     - (optional) Array of Routes.
 * @param {Upgrade[]}         upgrades   - (optional) Array of Upgrades.
 * @param {string}            id         - (optional) String number describing id.
 */
export default class Player extends BaseComponent implements ITurnable {
    readonly gold: number;
    readonly playerType: PlayerType;
    protected _startCity: City;
    protected _finance: Finance;
    protected _level: PlayerLevel;
    protected _range: number;
    protected _queue: QueuedRouteItem[];
    protected _routes: Route[];
    protected _upgrades: Upgrade[];
    constructor(name: string, playerType: PlayerType, startCity: City, finance?: Finance, level?: PlayerLevel, queue?: QueuedRouteItem[], routes?: Route[], upgrades?: Upgrade[], id?: string);
    getStartCity: () => City;
    getFinance: () => Finance;
    getLevel: () => PlayerLevel;
    getRange: () => number;
    getQueue: () => QueuedRouteItem[];
    getRoutes: () => Route[];
    getUpgrades: () => Upgrade[];
    /**
     * Handle Player events by checking if level should be increased.
     * Then handle Route queue, built Routes and Finance.
     *
     * @param {HandleTurnInfo} info - Object with relevant turn information.
     */
    handleTurn: (info: HandleTurnInfo, game?: Nardis) => void;
    checkLevel: () => void;
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
     * @param {string}    id - String with id of Route to remove.
     *
     * @returns {boolean}      True if the Route was removed from queue else false.
     */
    removeRouteFromQueue: (id: string) => boolean;
    /**
     * Remove Route from routes.
     *
     * @param {string}    id - String with id of Route to remove.
     *
     * @returns {boolean}      True if the Route was removed from queue else false.
     */
    removeRouteFromRoutes: (id: string) => boolean;
    /**
     * Add Upgrade.
     *
     * @param {Upgrade} upgrade - Upgrade to add.
     */
    addUpgrade: (upgrade: Upgrade) => void;
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
     * @param {string}     stringifiedJSON - String with information to be used.
     * @param {City[]}     cities          - City instances used in the current game.
     * @param {Upgrades[]} upgrades        - Upgrade instances used in the current game.
     *
     * @return {Player}                      Player instance created from stringifiedJSON.
     */
    static createFromStringifiedJSON: (stringifiedJSON: string, cities: City[], trains: Train[], resources: Resource[]) => Player;
}
