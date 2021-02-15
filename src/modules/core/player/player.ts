import BaseComponent from '../../component/base-component';
import Finance from './finance';
import Upgrade from './upgrade';
import City from '../city';
import Train from '../train';
import Resource from '../resource';
import Route from '../route';
import {
    QueuedRouteItem,
    HandleTurnInfo,
    ITurnable,
    PlayerType,
    PlayerLevel,
} from '../../../types/types';
import {
    getPlayerLevelFromNumber
} from '../../../util/util';
import {
    rangePerLevel,
    levelUpRequirements
} from '../../../util/constants';
import { Nardis } from '../../..';


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
 * @param {string}            id         - (optional) String number describing id.
 */


export default class Player extends BaseComponent implements ITurnable {

    readonly startGold  : number;
    readonly playerType : PlayerType;

    protected _startCity: City;
    protected _finance  : Finance;
    protected _level    : PlayerLevel;
    protected _range    : number;
    protected _queue    : QueuedRouteItem[];
    protected _routes   : Route[];
    protected _upgrades : Upgrade[];

    constructor(
            name        : string,
            startGold   : number,
            playerType  : PlayerType,
            startCity   : City,
            finance    ?: Finance,
            level      ?: PlayerLevel,
            queue      ?: QueuedRouteItem[],
            routes     ?: Route[],
            upgrades   ?: Upgrade[],
            id         ?: string
    ) {
        super(name, id);

        this.startGold  = startGold;
        this.playerType = playerType;
        
        this._startCity = startCity;
        this._finance   = finance  ? finance  : new Finance(this.name, this.id, this.startGold);
        this._level     = level    ? level    : PlayerLevel.Novice;
        this._queue     = queue    ? queue    : [];
        this._routes    = routes   ? routes   : [];
        this._upgrades  = upgrades ? upgrades : [];
        this._range     = this.getRangeFromLevel();

    }

    public getStartCity = (): City              => this._startCity;
    public getFinance   = (): Finance           => this._finance;
    public getLevel     = (): PlayerLevel       => this._level;
    public getRange     = (): number            => this._range;
    public getQueue     = (): QueuedRouteItem[] => this._queue;
    public getRoutes    = (): Route[]           => this._routes;
    public getUpgrades  = (): Upgrade[]         => this._upgrades;

    /**
     * Handle Player events by checking if level should be increased.
     * Then handle Route queue, built Routes and Finance.
     * 
     * @param {HandleTurnInfo} info - Object with relevant turn information.
     */

    public handleTurn = (info: HandleTurnInfo, game?: Nardis): void => {
        this.checkLevel();
        this.handleQueue();
        this.handleRoutes(info);
        this.handleFinance(info);
    }

    /**
     * Checks if level should be increased and acts accordingly. 
     */

    public checkLevel = (): void => {
        if (this.shouldLevelBeIncreased()) {
            this.increaseLevel();
        }
    }

    /**
     * Add Route to queue.
     * 
     * @param {Route} route    - Route instance to be added.
     * @param {Route} turnCost - Number describing turn cost.
     */

    public addRouteToQueue = (route: Route, turnCost: number): void => {
        route.getCityOne().incrementRouteCount();
        route.getCityTwo().incrementRouteCount();
        this._queue.push({
            route,
            turnCost
        });
    }

    /**
     * Remove Route from queue.
     * 
     * @param {string}    id - String with id of Route to remove.
     * 
     * @returns {boolean}      True if the Route was removed from queue else false.
     */

    public removeRouteFromQueue = (id: string): boolean => {
        for (let i: number = 0; i < this._queue.length; i++) {
            const route: Route = this._queue[i].route;
            if (route.id === id) {
                route.getCityOne().decrementRouteCount();
                route.getCityTwo().decrementRouteCount();
                this._queue.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Remove Route from routes.
     * 
     * @param {string}    id - String with id of Route to remove.
     * 
     * @returns {boolean}      True if the Route was removed from queue else false.
     */

    public removeRouteFromRoutes = (id: string): boolean => {
        for (let i: number = 0; i < this._routes.length; i++) {
            const route: Route = this._routes[i];
            if (route.id === id) {
                route.getCityOne().decrementRouteCount();
                route.getCityTwo().decrementRouteCount();
                this._routes.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Add Upgrade.
     * 
     * @param {Upgrade} upgrade - Upgrade to add.
     */

    public addUpgrade = (upgrade: Upgrade): void => {
        this._upgrades.push(upgrade);
    }

    /** 
     * @return {string} String with JSON stringified property keys and values.
    */
   
    public deconstruct = (): string => JSON.stringify({
        name: this.name,
        playerType: this.playerType,
        level: this._level,
        id: this.id,
        startCityId: this._startCity.id,
        finance: this._finance.deconstruct(),
        queue: this._queue.map(e => ({
            route: e.route.deconstruct(),
            turnCost: e.turnCost
        })),
        routes: this._routes.map(e => e.deconstruct()),
        upgrades: this._upgrades.map(e => ({
            id: e.id
        }))
    });

    /**
     * Handle all Routes in queue by checking current turn cost,
     * If non-positive, remove from queue and add to Routes,
     * else decrement current turn cost by one.
     */

    protected handleQueue = (): void => {
        const completed: string[] = [];
        for (let i: number = 0; i < this._queue.length; i++) {
            if (this._queue[i].turnCost <= 0) {
                this._routes.push(this._queue[i].route);
                completed.push(this._queue[i].route.id);
            } else {
                this._queue[i].turnCost--;
            }
        }
        this._queue = this._queue.filter((item: QueuedRouteItem): boolean => !(completed.indexOf(item.route.id) > -1));
    }

    /**
     * Handle all Routes each turn.
     * 
     * @param {HandleTurnInfo} info - Object with relevant turn information.
     */

    protected handleRoutes = (info: HandleTurnInfo): void => {
        this._routes.forEach((route: Route): void => {
            route.handleTurn(info);
        });
    }

    /**
     * Handle Finance each turn.
     * 
     * @param {HandleTurnInfo} info - Object with relevant turn information.
     */

    protected handleFinance = (info: HandleTurnInfo): void => {
        this._finance.handleTurn(info);
    }

    /**
     * @returns {boolean} True if level should be increased else false.
     */

    protected shouldLevelBeIncreased = (): boolean => {
        if (this._level < PlayerLevel.Master) {
            const requirements = levelUpRequirements[this._level + 1];
            return (
                this._routes.length >= requirements.routes &&
                this._finance.getAverageRevenue() >= requirements.revenuePerTurn &&
                this._finance.getGold() >= requirements.gold
            );
        }
        return false;
    }

    /**
     * @returns {boolean} True if level did increase else false.
     */

    protected increaseLevel = (): boolean => {
        const newLevel: PlayerLevel = getPlayerLevelFromNumber(this._level + 1);
        if (newLevel !== PlayerLevel.None) {
            this._level = newLevel;
            this._range = this.getRangeFromLevel();
            return true;
        }
        return false;
    }

    /**
     * @returns {number} Number describing maximum Route distance given current level.
     */

    protected getRangeFromLevel = (): number => {
        return rangePerLevel[this._level] || this._range;
    }

    /**
     * Get Player instance from stringified JSON.
     * 
     * @param {string}     stringifiedJSON - String with information to be used.
     * @param {City[]}     cities          - City instances used in the current game.
     * @param {Train[]}    trains          - Train instances used in the current game.
     * @param {Upgrades[]} upgrades        - Upgrade instances used in the current game.
     * 
     * @return {Player}                      Player instance created from stringifiedJSON.
     */

    public static createFromStringifiedJSON = (stringifiedJSON: string, cities: City[], trains: Train[], resources: Resource[], upgrades: Upgrade[]): Player => {
        const parsedJSON: any = JSON.parse(stringifiedJSON);
        return new Player(
            parsedJSON.name,
            parsedJSON.startGold,
            parsedJSON.playerType,
            cities.filter(e => e.id === parsedJSON.startCityId)[0],
            Finance.createFromStringifiedJSON(parsedJSON.finance),
            parsedJSON.level,
            parsedJSON.queue.map(e => ({
                route: Route.createFromStringifiedJSON(e.route, cities, trains, resources),
                turnCost: e.turnCost
            })),
            parsedJSON.routes.map(e => Route.createFromStringifiedJSON(e, cities, trains, resources)),
            parsedJSON.upgrades.map(e => upgrades.filter(j => j.id === e.id)[0]),
            parsedJSON.id
        )
    }
}