import BaseComponent from '../component/base-component';
import City from './city';
import Resource from './resource';
import Train from './train';
import Upgrade from './player/upgrade';
import { 
    RouteCargo,
    RoutePlanCargo, 
    RouteState,
    CityResource,
    HandleTurnInfo,
    ITurnable,
    UpgradeType
} from '../../types/types';


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

    private _cityOne            : City;
    private _cityTwo            : City;
    private _train              : Train;
    private _routePlanCargo     : RoutePlanCargo;
    private _distance           : number;
    private _cost               : number;
    private _purchasedOnTurn    : number;
    private _routeState         : RouteState;
    private _profit             : number;
    private _kilometersTravelled: number;

    constructor(
            name                : string,
            cityOne             : City,
            cityTwo             : City,
            train               : Train,
            routePlanCargo      : RoutePlanCargo,
            distance            : number,
            cost                : number,
            purchasedOnTurn     : number,
            profit             ?: number,
            kilometersTravelled?: number,
            routeState         ?: RouteState,
            id                 ?: string
    ) {
        super(name, id);

        this._cityOne             = cityOne;
        this._cityTwo             = cityTwo;
        this._train               = train;
        this._routePlanCargo      = routePlanCargo;
        this._distance            = distance;
        this._cost                = cost;
        this._purchasedOnTurn     = purchasedOnTurn;
        this._profit              = profit ? profit : 0;
        this._kilometersTravelled = kilometersTravelled ? kilometersTravelled : 0;

        if (routeState) {
            this._routeState = routeState;
        } else {
            this.resetRouteState();
        }
    }

    public getCityOne             = (): City            => this._cityOne;
    public getCityTwo             = (): City            => this._cityTwo;
    public getTrain               = (): Train           => this._train;
    public getRoutePlan           = (): RoutePlanCargo  => this._routePlanCargo;
    public getDistance            = (): number          => this._distance;
    public getCost                = (): number          => this._cost;
    public getPurchasedOnTurn     = (): number          => this._purchasedOnTurn;
    public getRouteState          = (): RouteState      => this._routeState;
    public getProfit              = (): number          => this._profit;
    public getKilometersTravelled = (): number          => this._kilometersTravelled;

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

    public handleTurn = (info: HandleTurnInfo) => {
        if (this._routeState.hasArrived) {
            this._routeState.destination = this._routeState.destination.equals(this._cityOne) ? this._cityTwo : this._cityOne;
            this._routeState.distance    = this._distance;
            this._routeState.cargo       = this.getChangedCargo();
            this._routeState.hasArrived  = false; 
        } else {
            if (this._routeState.distance <= 0) {
                this._routeState.hasArrived = true;
            } else {
                const trainSpeed: number = this.getTrainSpeed(info.playerData.upgrades);
                this._kilometersTravelled += trainSpeed;
                this._routeState.distance -= trainSpeed;
            }
        }
    }

    /**
     * Add gold to Route profits.
     * 
     * @param {number} - Number with value in gold to add.
     */

    public addToProfit = (value: number): void => {
        this._profit += value;
    }

    /**
     * Remove gold from Route profits.
     * 
     * @param {number} - Number with value in gold to remove.
     */

    public subtractFromProfit = (value: number): void => {
        this._profit -= value;
    }

    /**
     * Change Train or RoutePlanCargo from active route.
     */

    public change = (train: Train, routePlan: RoutePlanCargo): void => {
        if (!this._train.equals(train)) {
            this._profit = 0; this._kilometersTravelled = 0;
        }
        this._train = train; this._routePlanCargo = routePlan;
        this.resetRouteState();
    }

    /**
     * Get Train speed with Player upgrades taken into consideration.
     * 
     * @return {number} - Number with the correct Train speed.
     */

    private getTrainSpeed = (upgrades: Upgrade[]): number => {
        const relevantUpgrades: Upgrade[] = upgrades.filter(e => e.type === UpgradeType.TrainSpeedQuicker);
        let speed: number = this._train.speed;
        if (relevantUpgrades.length > 0) {
            relevantUpgrades.forEach(e => {
                speed += Math.floor(speed * e.value);
            });
        }
        return speed;
    }

    /**
     * Get appropriate array RouteCargo when between arrival and departure. Ensures that the 
     * amount of each cargo respects the available amount from the City where the cargo is fetched from.
     * 
     * @return {RouteCargo[]} - Array of RouteCargo objects.
     */

    private getChangedCargo = (): RouteCargo[] => {
        const isDestinationCityOne: boolean     = this._routeState.destination.equals(this._cityOne);
        const inCity: City = isDestinationCityOne ? this._cityTwo : this._cityOne;
        const cargo: RouteCargo[]    = isDestinationCityOne ? this._routePlanCargo.cityTwo : this._routePlanCargo.cityOne;
        cargo.forEach(routeCargo => {
            const citySupply: CityResource = inCity.getCityResourceFromResource(routeCargo.resource);
            const diff: number = citySupply ? citySupply.available - routeCargo.targetAmount : null;
            const available: number = citySupply.available;
            if (typeof diff === 'number' && !Number.isNaN(diff)) {
                if (diff <= 0 && inCity.subtractSupply(routeCargo.resource, available)) {
                    // target amount is greater than available, so set actual amount to available 
                    routeCargo.actualAmount = available;
                } else if (diff > 0 && inCity.subtractSupply(routeCargo.resource, routeCargo.targetAmount)) {
                    // target amount is satisfied and we can have the desired amount of cargo
                    routeCargo.actualAmount = routeCargo.targetAmount;
                } else {
                    // resource could not be fetched from city
                    routeCargo.actualAmount = 0;
                }
            } else {
                throw Error('cargo does not exist in city trying to be used');
            }
        });
        return cargo;
    }

    private resetRouteState = () => {
        this._routeState = {
            hasArrived: false,
            destination: this._cityTwo,
            distance: this._distance,
            cargo: null
        };
        this._routeState.cargo = this.getChangedCargo();
    }

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

    public static createFromStringifiedJSON = (stringifiedJSON: string, cities: City[], trains: Train[], resources: Resource[]): Route => {
        const parsedJSON: any = JSON.parse(stringifiedJSON);
        const routeState: any = parsedJSON._routeState;
        const cargo: any = !!routeState.cargo ? routeState.cargo.map(e => ({
            ...e,
            resource: resources.filter(j => j.id === e.resource.id)[0]
        })) : routeState.cargo;
        return new Route(
            parsedJSON.name,
            cities.filter(e => e.id === parsedJSON._cityOne.id)[0],
            cities.filter(e => e.id === parsedJSON._cityTwo.id)[0],
            trains.filter(e => e.id === parsedJSON._train.id)[0],
            {
                cityOne: parsedJSON._routePlanCargo.cityOne.map(e => {
                    return {
                        ...e,
                        resource: resources.filter(j => j.id === e.resource.id)[0],
                    };
                }),
                cityTwo: parsedJSON._routePlanCargo.cityTwo.map(e => {
                    return {
                        ...e,
                        resource: resources.filter(j => j.id === e.resource.id)[0],
                    };
                })
            },
            parsedJSON._distance,
            parsedJSON._cost,
            parsedJSON._purchasedOnTurn,
            parsedJSON._profit,
            parsedJSON._kilometersTravelled,
            {
                ...parsedJSON._routeState,
                destination: cities.filter(e => e.id === parsedJSON._routeState.destination.id)[0],
                cargo
            },
            parsedJSON.id
        );
    }
}