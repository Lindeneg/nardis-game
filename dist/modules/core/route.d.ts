import BaseComponent from '../component/base-component';
import City from './city';
import Resource from './resource';
import Train from './train';
import { RoutePlanCargo, RouteState, HandleTurnInfo, ITurnable } from '../../types/types';
/**
 * @constructor
 * @param {string}     name                - string with name.
 * @param {City}       cityOne             - City specifying initial departure.
 * @param {City}       cityTwo             - City specifying initial arrival.
 * @param {Train}      train               - Train instance to be used.
 * @param {RoutePlan}  routePlan           - RoutePlan describing cargo.
 * @param {number}     distance            - number with distance in kilometers.
 * @param {number}     cost                - number with cost in gold.
 * @param {number}     purchasedOnTurn     - number with turn count.
 *
 * @param {number}     profit              - (optional) number with profit in gold.
 * @param {number}     kilometersTravelled - (optional) kilometers travelled in total for route.
 * @param {RouteState} routeState          - (optional) RouteState of the route.
 * @param {string}     id                  - (optional) string number describing id.
 */
export default class Route extends BaseComponent implements ITurnable {
    private _cityOne;
    private _cityTwo;
    private _train;
    private _routePlanCargo;
    private _distance;
    private _cost;
    private _purchasedOnTurn;
    private _routeState;
    private _profit;
    private _kilometersTravelled;
    constructor(name: string, cityOne: City, cityTwo: City, train: Train, routePlanCargo: RoutePlanCargo, distance: number, cost: number, purchasedOnTurn: number, profit?: number, kilometersTravelled?: number, routeState?: RouteState, id?: string);
    getCityOne: () => City;
    getCityTwo: () => City;
    getTrain: () => Train;
    getRoutePlan: () => RoutePlanCargo;
    getDistance: () => number;
    getCost: () => number;
    getPurchasedOnTurn: () => number;
    getRouteState: () => RouteState;
    getProfit: () => number;
    getKilometersTravelled: () => number;
    /**
     * Handle Route events by checking the current state using this logic:
     * Is the current distance greater than zero?
     *
     * Yes -> Decrement current distance by Train speed + Player speed upgrades.
     *
     * No  -> Change destination and cargo and reset current distance to route distance.
     *
     * @param  {HandleTurnInfo}  info - Object with relevant turn information.
     */
    handleTurn: (info: HandleTurnInfo) => void;
    /**
     * Add gold to Route profits.
     *
     * @param {number} - Number with value in gold to add.
     */
    addToProfit: (value: number) => void;
    /**
     * Remove gold from Route profits.
     *
     * @param {number} - Number with value in gold to remove.
     */
    subtractFromProfit: (value: number) => void;
    /**
     * Change Train or RoutePlanCargo from active route.
     */
    change: (train: Train, routePlan: RoutePlanCargo) => void;
    /**
     * @return {string} String with JSON stringified property keys and values.
    */
    deconstruct: () => string;
    /**
     * Get Train speed with Player upgrades taken into consideration.
     *
     * @return {number} - Number with the correct Train speed.
     */
    private getTrainSpeed;
    /**
     * Get appropriate array RouteCargo when between arrival and departure. Ensures that the
     * amount of each cargo respects the available amount from the City where the cargo is fetched from.
     *
     * @return {RouteCargo[]} - Array of RouteCargo objects.
     */
    private getChangedCargo;
    private resetRouteState;
    /**
     * Get Route instance from stringified JSON.
     *
     * @param {string}     stringifiedJSON - String with information to be used.
     * @param {City[]}     cities          - Array of City instances used in game.
     * @param {Train[]}    trains          - Array of Train instances used in game.
     * @param {Resource[]} resources       - Array of Resource instances used in game.
     *
     * @return {Route}                       Route instance created from the string.
     */
    static createFromStringifiedJSON: (stringifiedJSON: string | object, cities: City[], trains: Train[], resources: Resource[]) => Route;
}
