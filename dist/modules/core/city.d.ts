import BaseComponent from '../component/base-component';
import Resource from './resource';
import { CityModel } from '../../types/model';
import { CityResource, CityCoordinate, HandleTurnInfo, ITurnable } from '../../types/types';
/**
 * @constructor
 * @param {string}         name                - String with name.
 * @param {number}         size                - Number with size.
 * @param {CityCoordinate} coords              - Object with location coordinates.
 * @param {CityResource[]} supply              - Object with info for City supplies.
 * @param {CityResource[]} demand              - Object with info for City demands.
 * @param {number}         growthRate          - Number describing growth rate.
 * @param {number}         supplyRefillRate    - Number describing refill rate.
 *
 * @param {number}         growthChangeDecider - (optional) Number describing growth change decider.
 * @param {number}         supplyRefillDecider - (optional) Number describing supply refill decider.
 * @param {number}         currentRouteCount   - (optional) Number describing current number of routes.
 * @param {string}         id                  - (optional) String number describing id.
 */
export default class City extends BaseComponent implements ITurnable {
    readonly isStartCity: boolean;
    private _size;
    private _coords;
    private _supply;
    private _demand;
    private _growthRate;
    private _supplyRefillRate;
    private _growthChangeDecider;
    private _supplyRefillDecider;
    private _maxConcurrentRoutes;
    private _currentRouteCount;
    private log;
    constructor(name: string, size: number, coords: CityCoordinate, supply: CityResource[], demand: CityResource[], growthRate: number, supplyRefillRate: number, growthChangeDecider?: number, supplyRefillDecider?: number, currentRouteCount?: number, id?: string);
    getSize: () => number;
    getCoords: () => CityCoordinate;
    getSupply: () => CityResource[];
    getDemand: () => CityResource[];
    getGrowthRate: () => number;
    getGrowthDecider: () => number;
    getSupplyRefillRate: () => number;
    getSupplyDecider: () => number;
    getCurrentRouteCount: () => number;
    getMaxRouteCount: () => number;
    isFull: () => boolean;
    /**
     * Check is a Resource is found in City supplies.
     *
     * @param   {Resource} resource - Resource instance to check for in supplies.
     *
     * @returns {boolean}  True if found else false.
     */
    isSupply: (resource: Resource) => boolean;
    /**
     * Check is a Resource is found in City demands.
     *
     * @param   {Resource} resource - Resource instance to check for in demands.
     *
     * @returns {boolean}  True if found else false.
     */
    isDemand: (resource: Resource) => boolean;
    /**
     * Handle City events which pertains to growth and refill of supplies. A city grow if the decision variable
     * is equal or greater than a certain value. If so, grow the city and set new resources else increment decision.
     *
     * Supplies will be refilled every nth turn, where n is the number specified in supplyRefillRate.
     *
     * @param {HandleTurnInfo} info - Object with relevant turn information.
     */
    handleTurn: (info: HandleTurnInfo) => void;
    /**
     * Increment currentRouteCount if City is not at peak capacity.
     *
     * @returns {boolean} True if count was incremented else false.
     */
    incrementRouteCount: () => boolean;
    /**
     * Decrement currentRouteCount if the count is above or equal one.
     *
     * @returns {boolean} True if count was decremented else false.
     */
    decrementRouteCount: () => boolean;
    /**
     * Get distance between two City instances in kilometers using haversine formula.
     *
     * @param   {City}    city - City instance to calculate distance to.
     *
     * @returns {number}  Number with distance in kilometers.
     */
    distanceTo: (city: City) => number;
    /**
     * Subtract available amount from a CityResource.
     *
     * @param   {Resource} supply   - Resource in supply to subtract from.
     * @param   {number}   subtract - Number to subtract.
     *
     * @returns {number}   True if subtracted else false.
     */
    subtractSupply: (supply: Resource, subtract: number) => boolean;
    /**
     * Get CityResource from Resource instance.
     *
     * @param   {Resource}     resource - Resource to match.
     *
     * @returns {CityResource} CityResource if found else null.
     */
    getCityResourceFromResource: (resource: Resource) => CityResource;
    /**
     * @returns {string} String with JSON stringified property keys and values.
    */
    deconstruct: () => string;
    /**
     * @param   {Resource} resource - Resource to match.
     *
     * @returns {boolean}  True if Resource is found in supply or demand else false.
     */
    private isSupplyOrDemand;
    /**
     * Grow the size of City with 50% roll chance, if City size is not max.
     *
     * @param   {Resource[]} resources - Resource instances used in the current game.
     *
     * @returns {boolean}    True if City did grow else false.
     */
    private grow;
    /**
     * Set all City supplies available amount to their default amount.
     */
    private refill;
    /**
     * Update maxConcurrentRoutes to reflect City growth and set new supplies and demands if applicable.
     *
     * @param {Resource[]} resources - Resource instances used in the current game.
     */
    private updateCityAfterGrowth;
    /**
     * Get new CityResource which Resource is ensured to be unique among the City supply and demand.
     *
     * Throws an Error if no unique Resource could be found.
     *
     * @param   {Resource[]}   resources - Resource instances used in the current game.
     *
     * @returns {CityResource} CityResource not found in City supply or demand.
     */
    private rollNewResource;
    /**
     * @returns {number} maxConcurrentRoutes from the current City size.
     */
    private getMaxConcurrentRoutes;
    /**
     * Get City instance from a CityModel.
     *
     * @param   {CityModel}  model     - CityModel to be used.
     * @param   {Resource[]} resources - Resource instances used in the current game.
     *
     * @returns {City}       City instance created from the model.
     */
    static createFromModel: (model: CityModel, resources: Resource[]) => City;
    /**
     * Get City instance from stringified JSON.
     *
     * @param   {string}     stringifiedJSON - string with information to be used.
     * @param   {Resource[]} resources       - Resource instances used in the current game.
     *
     * @returns {City}       City instance created from the string.
     */
    static createFromStringifiedJSON: (stringifiedJSON: string, resources: Resource[]) => City;
    /**
     * Get array of CityResources from CityResourceModels.
     *
     * @param   {CityResourceModel[]} cityResourceModels - CityModel to be used.
     * @param   {Resource[]}          resources          - Resource instances used in the current game.
     *
     * @returns {CityResource[]}      Array of CityResources.
     */
    private static getCityResources;
}
