import BaseComponent from '../component/base-component';
import Resource from './resource';
import { 
    CityModel,
    CityResourceModel 
} from '../../types/model';
import { 
    CityResource,
    CityCoordinate,
    HandleTurnInfo,
    ITurnable
} from '../../types/types';
import { 
    MAX_CITY_SIZE,
    MAX_START_CITY_SIZE,
    MAP_RADIUS_IN_KILOMETERS,
    CITY_GROWTH_DECISION_TARGET,
    CitySizeMaxConcurrentRoutes,
    resourcesPerSize,
    resourcePerSize
} from '../../util/constants';
import { 
    randomNumber, 
    degreesToRadians, 
    isDefined
} from '../../util/util';


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

    readonly isStartCity        : boolean;

    private _size               : number;
    private _coords             : CityCoordinate;
    private _supply             : CityResource[];
    private _demand             : CityResource[];
    private _growthRate         : number;
    private _supplyRefillRate   : number;
    private _growthChangeDecider: number;
    private _supplyRefillDecider: number;
    private _maxConcurrentRoutes: number;
    private _currentRouteCount  : number;

    constructor(
            name                : string,
            size                : number,
            coords              : CityCoordinate,
            supply              : CityResource[],
            demand              : CityResource[],
            growthRate          : number,
            supplyRefillRate    : number,
            growthChangeDecider?: number,
            supplyRefillDecider?: number,
            currentRouteCount  ?: number,
            id                 ?: string
    ) {
        super(name, id);
        
        this.isStartCity = size  <= MAX_START_CITY_SIZE;

        this._size                = size;
        this._coords              = coords;
        this._supply              = supply;
        this._demand              = demand;
        this._growthRate          = growthRate;
        this._supplyRefillRate    = supplyRefillRate;
        this._growthChangeDecider = isDefined(growthChangeDecider) ? growthChangeDecider : 0;
        this._supplyRefillDecider = isDefined(supplyRefillDecider) ? supplyRefillDecider : 0;
        this._currentRouteCount   = isDefined(currentRouteCount)   ? currentRouteCount   : 0;
        this._maxConcurrentRoutes = this.getMaxConcurrentRoutes();
    }

    public getSize                = ()                  : number         => this._size;
    public getCoords              = ()                  : CityCoordinate => this._coords;
    public getSupply              = ()                  : CityResource[] => this._supply;
    public getDemand              = ()                  : CityResource[] => this._demand;
    public getGrowthRate          = ()                  : number         => this._growthRate;
    public getGrowthDecider       = ()                  : number         => this._growthChangeDecider;
    public getSupplyRefillRate    = ()                  : number         => this._supplyRefillRate;
    public getSupplyDecider       = ()                  : number         => this._supplyRefillDecider;
    public getCurrentRouteCount   = ()                  : number         => this._currentRouteCount;
    public getMaxRouteCount       = ()                  : number         => this._maxConcurrentRoutes;
    public isFull                 = ()                  : boolean        => this._currentRouteCount >= this._maxConcurrentRoutes;
    public isSupply               = (resource: Resource): boolean        => this._supply.filter((e: CityResource): boolean => e.resource.equals(resource)).length > 0;
    public isDemand               = (resource: Resource): boolean        => this._demand.filter((e: CityResource): boolean => e.resource.equals(resource)).length > 0;

    /**
     * Handle City events which pertains to growth and refill of supplies. A city grow if the decision variable
     * is equal or greater than a certain value. If so, grow the city and set new resources else increment decision.
     * 
     * Supplies will be refilled every nth turn, where n is the number specified in supplyRefillRate. 
     * 
     * @param {HandleTurnInfo} info - Object with relevant turn information.
     */

    public handleTurn = (info: HandleTurnInfo): void => {
        if (this._growthChangeDecider >= CITY_GROWTH_DECISION_TARGET && this.grow(info.data.resources)) {
            this._growthChangeDecider = 0;
        } else {
            this._growthChangeDecider += this._growthRate;
        }

        if (this._supplyRefillDecider >= this._supplyRefillRate) {
            this.refill();
            this._supplyRefillDecider = 0;
        } else {
            this._supplyRefillDecider++;
        }
    }

    /**
     * Increment currentRouteCount if City is not at peak capacity.
     * 
     * @returns {boolean} True if count was incremented else false.
     */

    public incrementRouteCount = (): boolean => {
        if (!(this.isFull())) {
            this._currentRouteCount++;
            return true;
        }
        return false;
    }

    /**
     * Decrement currentRouteCount if the count is above or equal one.
     * 
     * @returns {boolean} True if count was decremented else false.
     */

    public decrementRouteCount = (): boolean => {
        if (this._currentRouteCount >= 1) {
            this._currentRouteCount--;
            return true;
        }
        return false;
    }

    /**
     * Get distance between two City instances in kilometers using haversine formula.
     * 
     * @param   {City}    city - City instance to calculate distance to.
     * 
     * @returns {number}  Number with distance in kilometers.
     */

    public distanceTo = (city: City): number => {
        if (!(this.equals(city))) {
            const [loc1, loc2]: [CityCoordinate, CityCoordinate] = [this.getCoords(), city.getCoords()];
            const [p1, l1]: [number, number] = [degreesToRadians(loc1.phi), degreesToRadians(loc1.lambda)];
            const [p2, l2]: [number, number] = [degreesToRadians(loc2.phi), degreesToRadians(loc2.lambda)];
            const [dp, dl]: [number, number] = [Math.abs(p2 - p1), Math.abs(l2 - l1)];
            const a: number = Math.pow(Math.sin(dp / 2), 2) + ((Math.cos(p1) * Math.cos(p2)) * (Math.pow(Math.sin(dl / 2), 2)));
            return Math.round(MAP_RADIUS_IN_KILOMETERS * (2 * Math.atan2(Math.sqrt(Math.abs(a)), Math.sqrt(Math.abs(1 - a)))));
        }
        return -1;
    }

    /**
     * Subtract available amount from a CityResource.
     * 
     * @param   {Resource} supply   - Resource in supply to subtract from.
     * @param   {number}   subtract - Number to subtract.
     * 
     * @returns {number}   True if subtracted else false.
     */

    public subtractSupply = (supply: Resource, subtract: number): boolean => {
        for (let i: number = 0; i < this._supply.length; i++) {
            // only subtract if the operation resolves in a non-negative number
            if (this._supply[i].resource.equals(supply) && this._supply[i].available >= subtract) {
                this._supply[i].available -= subtract;
                return true;
            }
        }
        return false;
    }

    /**
     * Get CityResource from Resource instance.
     * 
     * @param   {Resource}     resource - Resource to match.
     * 
     * @returns {CityResource} CityResource if found else null.
     */

    public getCityResourceFromResource = (resource: Resource): CityResource => {
        const result: CityResource[] = this._supply.filter((e: CityResource): boolean => e.resource.equals(resource));
        return result.length > 0 ? result[0] : null;
    }

    /** 
     * @returns {string} String with JSON stringified property keys and values.
    */
   
    public deconstruct = (): string => JSON.stringify({
        name                : this.name,
        id                  : this.id,
        _size               : this._size,
        _coords             : this._coords,
        _growthRate         : this._growthRate,
        _supplyRefillRate   : this._supplyRefillRate,
        _growthChangeDecider: this._growthChangeDecider,
        _supplyRefillDecider: this._supplyRefillDecider,
        _currentRouteCount  : this._currentRouteCount,
        _supply             : this._supply.map(s => ({
            resource: {
                id: s.resource.id
            },
            amount: s.amount,
            available: s.available
        })),
        _demand             : this._demand.map(d => ({
            resource: {
                id: d.resource.id
            },
            amount: d.amount,
            available: d.available
        }))
    })

    /**
     * @param   {Resource} resource - Resource to match.
     * 
     * @returns {boolean}  True if Resource is found in supply or demand else false.
     */

    private isSupplyOrDemand = (resource: Resource): boolean => this.isSupply(resource) || this.isDemand(resource);

    /**
     * Grow the size of City with 50% roll chance, if City size is not max.
     * 
     * @param   {Resource[]} resources - Resource instances used in the current game.
     * 
     * @returns {boolean}    True if City did grow else false.
     */

    private grow = (resources: Resource[]): boolean => {
        if (this._size >= MAX_CITY_SIZE || randomNumber() > 5) {
            return false;
        }
        this._size++;
        this.updateCityAfterGrowth(resources);
        return true;
    }

    /**
     * Set all City supplies available amount to their default amount.
     */

    private refill = (): void => {
        this._supply.forEach((supply: CityResource): void => {
            supply.available = supply.amount;
        });
    }

    /**
     * Update maxConcurrentRoutes to reflect City growth and set new supplies and demands if applicable.
     * 
     * @param {Resource[]} resources - Resource instances used in the current game.
     */

    private updateCityAfterGrowth = (resources: Resource[]): void => {
        const resourceLimit: number = resourcesPerSize[this._size - 1];
        const resourceDiff: number = resourceLimit - this._supply.length;
        this._maxConcurrentRoutes = this.getMaxConcurrentRoutes();
        if (resourceDiff > 0) {
            const newSupplies: CityResource[] = [...this._supply];
            const newDemands: CityResource[] = [...this._demand];
            for (let _: number = 0; _ < resourceDiff; _++) {
                newSupplies.push(this.rollNewResource(resources));
                newDemands.push(this.rollNewResource(resources));
            }
            this._supply = newSupplies;
            this._demand = newDemands;
        }
    }

    /**
     * Get new CityResource which Resource is ensured to be unique among the City supply and demand.
     * 
     * Throws an Error if no unique Resource could be found.
     * 
     * @param   {Resource[]}   resources - Resource instances used in the current game.
     * 
     * @returns {CityResource} CityResource not found in City supply or demand.
     */

    private rollNewResource = (resources: Resource[]): CityResource => {
        const relevantResources: Resource[] = resources.filter((e: Resource): boolean => {
            return !this.isSupplyOrDemand(e);
        });
        if (relevantResources.length <= 0) {
            throw Error('cannot add anymore resources');
        }
        const amount: number = randomNumber(...resourcePerSize[this._size - 1]);
        return {
            resource: relevantResources[randomNumber(0, relevantResources.length - 1)],
            amount: amount,
            available: amount
        };
    }

    /**
     * @returns {number} maxConcurrentRoutes from the current City size.
     */

    private getMaxConcurrentRoutes = (): number => {
        const result = CitySizeMaxConcurrentRoutes.filter(e => {
            return e.size === this._size;
        })[0];
        return result ? result.maxRoutes : 0;
    }

    /**
     * Get City instance from a CityModel.
     * 
     * @param   {CityModel}  model     - CityModel to be used.
     * @param   {Resource[]} resources - Resource instances used in the current game.
     * 
     * @returns {City}       City instance created from the model.
     */

    public static createFromModel = (model: CityModel, resources: Resource[]): City => {
        return new City(
            model.name,
            model.size,
            {phi: model.phi, lambda: model.lambda},
            City.getCityResources(model.supply, resources),
            City.getCityResources(model.demand, resources),
            model.growthRate,
            model.supplyRefillRate
        );
    }

    /**
     * Get City instance from stringified JSON.
     * 
     * @param   {string}     stringifiedJSON - string with information to be used.
     * @param   {Resource[]} resources       - Resource instances used in the current game.
     * 
     * @returns {City}       City instance created from the string.
     */

    public static createFromStringifiedJSON = (stringifiedJSON: string, resources: Resource[]): City => {
        // it is not pretty but it does the job
        const parsedJSON: any = JSON.parse(stringifiedJSON);
        const resource = ((supply, demand) => {
            const s = supply.map(su => {
                return {
                    resource: resources.filter(e => e.id === su.resource.id)[0],
                    amount: su.amount,
                    available: su.available
                };
            });
            const d = demand.map(su => {
                return {
                    resource: resources.filter(e => e.id === su.resource.id)[0],
                    amount: su.amount,
                    available: su.available
                };
            });
            return {s, d};
        })(parsedJSON._supply, parsedJSON._demand);
        return new City(
            parsedJSON.name,
            parsedJSON._size,
            parsedJSON._coords,
            resource.s,
            resource.d,
            parsedJSON._growthRate,
            parsedJSON._supplyRefillRate,
            parsedJSON._growthChangeDecider,
            parsedJSON._supplyRefillDecider,
            parsedJSON._currentRouteCount,
            parsedJSON.id
        );
    }

    /**
     * Get array of CityResources from CityResourceModels.
     * 
     * @param   {CityResourceModel[]} cityResourceModels - CityModel to be used.
     * @param   {Resource[]}          resources          - Resource instances used in the current game.
     * 
     * @returns {CityResource[]}      Array of CityResources.
     */

    private static getCityResources = (cityResourceModels: CityResourceModel[], resources: Resource[]): CityResource[] => 
        cityResourceModels.map((e: CityResourceModel): CityResource => ({
            resource: resources.filter((r: Resource): boolean => r.name === e.name)[0],
            amount: e.amount,
            available: e.available
        })
    );
}