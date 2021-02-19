import { Nardis } from '../../../nardis';
import Player from '../player';
import Finance from '../finance';
import Upgrade from '../upgrade';
import Route from '../../route';
import City from '../../city';
import Train from '../../train';
import Resource from '../../resource';
import { isDefined } from '../../../../util/util';
import {
    HandleTurnInfo,
    QueuedRouteItem,
    PlayerType,
    PlayerLevel,
    PotentialRoute,
    RoutePowerPotential,
    OriginRoutePotential,
    AdjustedTrain,
    RoutePlanCargo,
    CityResource,
    RouteCargo,
    RoutePower,
    IRoute,
    BuyableRoute,
    StockHolding,
    Stocks,
    ActionSave
} from '../../../../types/types';
import { levelUpRequirements } from '../../../../util/constants';


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

    private _save: ActionSave

    constructor(
        name     : string,
        startGold: number,
        startCity: City,
        finance ?: Finance,
        level   ?: PlayerLevel,
        queue   ?: QueuedRouteItem[],
        routes  ?: Route[],
        upgrades?: Upgrade[],
        save    ?: ActionSave,
        id      ?: string
    ) {
        super(name, startGold, PlayerType.Computer, startCity, finance, level, queue, routes, upgrades, id);

        this._save = isDefined(save) ? save : {
            should: false,
            turn: 1,
            diff: 0
        };
    }

    /**
     * Handle Opponent events and actions.
     * 
     * @param {HandleTurnInfo} info - Object with relevant turn information.
     * @param {Nardis}         game - Nardis game instance.
     */

    public handleTurn = (info: HandleTurnInfo, game: Nardis): void => {
        if (this.shouldLevelBeIncreased()) {
            this.increaseLevel();
            this._save = {
                should: false,
                turn: info.turn,
                diff: 0
            };
        }
        this.handleQueue();
        this.handleRoutes(info);
        this.handleFinance(info);
        this.deduceAction(info, game);
    }

    // only for unit testing purposes
    public setSave = (save: ActionSave): void => {
        this._save = save;
    }

    /**
     * @returns {string} String with JSON stringified property keys and values.
     */

    public deconstruct = (): string => JSON.stringify({
        name: this.name,
        startGold: this.startGold,
        playerType: this.playerType,
        level: this._level,
        id: this.id,
        startCityId: this._startCity.id,
        finance: this._finance.deconstruct(),
        save: this._save,
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

    private deduceAction = (info: HandleTurnInfo, game: Nardis): void => {
        this.log(`turn=${info.turn} | name=${this.name}`);
        this.buyAvailableUpgrades(info, game);
        this.inspectStockOptions(game.stocks, this._finance.getStocks());
        if (this.shouldPurchaseRoutes(info.turn)) {
            const train: AdjustedTrain = this.getSuggestedTrain(game.getArrayOfAdjustedTrains());
            const originRoutes: OriginRoutePotential[] = this.getInterestingRoutes(game, train);
            this.purchaseRoutes(game, this.pickNInterestingRoutes(originRoutes, this.getN(originRoutes), train));
        }

        this.deleteConsistentlyUnprofitableRoutes();
        this.log('\n\n');
    }

     /**
      * Iterate over each unique origin. Then iterate over routes from that origin.
      * Filter for affordable Routes and sort for highest potential profitability.
      *  
      * @param   {Nardis}                 game  - Nardis game instance.
      * @param   {AdjustedTrain}          train - AdjustedTrain object.
      * 
      * @returns {OriginRoutePotential[]} Array of origins and their respective routes.
      */

    private getInterestingRoutes = (game: Nardis, train: AdjustedTrain): OriginRoutePotential[] => (
        this.getRoutePowerPotential(game, train).map((origin: OriginRoutePotential): OriginRoutePotential => {
            this.log(`routes from ${origin.origin.name}`, [origin.aRoutes, origin.pRoutes]);
            return {
                ...origin,
                aRoutes: origin.aRoutes.filter((aRoute: RoutePowerPotential): boolean => (
                    origin.pRoutes[aRoute.index].goldCost + train.cost <= this._finance.getGold()
                ))
                    .sort((a: RoutePowerPotential, b: RoutePowerPotential): number => b.power.powerIndex - a.power.powerIndex)
            }
        })
    )

     /**
      * Reduce an array of OriginRoutePotential to a sorted array of BuyableRoutes with length n.
      * 
      * @param   {OriginRoutePotential[]} routes - Array of origins and their respective routes.
      * @param   {number}                 n      - Number with length of returned array.
      * @param   {AdjustedTrain}          train  - AdjustedTrain object.
      * 
      * @returns {BuyableRoute[]}         Array of BuyableRoute objects ready to be purchased.
      */

    private pickNInterestingRoutes = (routes: OriginRoutePotential[], n: number, train: AdjustedTrain): BuyableRoute[] => (
        routes.map((route: OriginRoutePotential, originIndex: number): IRoute[] => (
            route.aRoutes.map((aRoute: RoutePowerPotential, aRouteIndex: number): IRoute => ({
                originIndex,
                aRouteIndex,
                powerIndex: aRoute.power.powerIndex
            }))
        ))
            .reduce((a: IRoute[], b: IRoute[]): IRoute[] => a.concat(b), [])
            .sort((a: IRoute, b: IRoute): number => b.powerIndex - a.powerIndex)
            .splice(0, n)
            .map((chosenRoute: IRoute): BuyableRoute => {
                const origin: OriginRoutePotential = routes[chosenRoute.originIndex];
                const aRoute: RoutePowerPotential = origin.aRoutes[chosenRoute.aRouteIndex];
                const pRoute: PotentialRoute = origin.pRoutes[aRoute.index];
                return {
                    ...pRoute,
                    train: train.train,
                    trainCost: train.cost,
                    routePlanCargo: aRoute.suggestedRoutePlan
                }
            })
    )

    /**
     * Buy all available upgrades.
     * 
     * @param {HandleTurnInfo} info - Object with relevant turn information.
     * @param {Nardis}         game - Nardis game instance.
     */

    private buyAvailableUpgrades = (info: HandleTurnInfo, game: Nardis): void => {
        if (this._save.should) { return; }
        info.data.upgrades.filter((upgrade: Upgrade): boolean => (
            this._level >= upgrade.levelRequired &&
            this._upgrades.filter((boughtUpgrade: Upgrade): boolean => boughtUpgrade.equals(upgrade)).length <= 0)
        ).forEach((upgrade: Upgrade): void => {
            if (this._finance.getGold() - upgrade.cost >= 0) {
                this.log(`purchasing upgrade ${upgrade.name} for ${upgrade.cost}g`);
                game.addUpgradeToPlayer(upgrade.id);
            }
        });
    }

     /**
      * Each origin will have its own unique routes. There can be multiple origins each with multiple routes.
      * Assign a "power index" to each route associated with each origin. Higher the index, better the route.
      * 
      * @param   {Nardis}                 game           - Nardis game instance.
      * @param   {AdjustedTrain}          suggestedTrain - AdjustedTrain object.
      * 
      * @returns {OriginRoutePotential[]} Array of OriginRoutePotentials from each unique origin.
      */
    
    private getRoutePowerPotential = (game: Nardis, suggestedTrain: AdjustedTrain): OriginRoutePotential[] => (
        this.getUniqueOrigins().map((origin: City): OriginRoutePotential => {
            const pRoutes: PotentialRoute[] = game.getArrayOfPossibleRoutes(origin);
            return {
                origin,
                pRoutes,
                aRoutes: pRoutes.map((route: PotentialRoute, index: number): RoutePowerPotential => {
                    const suggestedRoutePlan: RoutePlanCargo = this.getSuggestedRoutePlan(
                        route,
                        suggestedTrain.train.cargoSpace
                    );
                    return {
                        index,
                        suggestedRoutePlan,
                        tradeableResources: suggestedRoutePlan.cityOne.length + suggestedRoutePlan.cityTwo.length,
                        power: { ...this.getPower(route.cityOne.distanceTo(route.cityTwo), suggestedTrain.train, suggestedRoutePlan) }
                    }
                })
            }
        })
    );

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

    private getPower = (distance: number, train: Train, routePlan: RoutePlanCargo): RoutePower => {
        const fullRevolutionInTurns: number = Math.ceil(distance / train.speed) * 2;
        // plus four is to account for loading/unloading in both cities
        const upkeep: number = (fullRevolutionInTurns + 4) * train.upkeep;
        let expectedProfitValue: number = [routePlan.cityOne, routePlan.cityTwo].map((plan: RouteCargo[]): number => (
            plan.map((cargo: RouteCargo): number => (
                cargo.targetAmount * cargo.resource.getValue()
            )).reduce((a: number, b: number): number => a + b, 0)
        )).reduce((a: number, b: number): number => a + b, (upkeep * -1));
        return {
            expectedProfitValue,
            fullRevolutionInTurns,
            powerIndex: expectedProfitValue / fullRevolutionInTurns
        }
    }

    /**
     * Get suggested RoutePlanCargo for a given route between two cities.
     * 
     * @param   {PotentialRoute} route           - PotentialRoute object.
     * @param   {number}         cargoConstraint - Number of available cargo spaces.
     * 
     * @returns {RoutePlanCargo} RoutePlanCargo suggested for the route.
     */

    private getSuggestedRoutePlan = (route: PotentialRoute, cargoConstraint: number): RoutePlanCargo => {
        const c1Supply: CityResource[] = route.cityOne.getSupply(); const c2Supply: CityResource[] = route.cityTwo.getSupply();
        // first two entries are always low-yield, anything else are medium-to-high yield
        const c1p: CityResource = c1Supply[0]; const c1m: CityResource = c1Supply[1];
        const c2p: CityResource = c2Supply[0]; const c2m: CityResource = c2Supply[1];
        const pgt: boolean = c1p.resource.getValue() > c1m.resource.getValue();
        return {
            cityOne:
                this.getSuggestedCargo(
                    c1Supply.filter((cr: CityResource): boolean => !cr.resource.equals(c1p.resource) && !cr.resource.equals(c1m.resource)),
                    route.cityTwo,
                    cargoConstraint,
                    pgt ? [c1p, c1m] : [c1m, c1p]
                ),
            cityTwo:
                this.getSuggestedCargo(
                    c2Supply.filter((cr: CityResource): boolean => !cr.resource.equals(c2p.resource) && !cr.resource.equals(c2m.resource)),
                    route.cityOne,
                    cargoConstraint,
                    pgt ? [c2p, c2m] : [c2m, c2p]
                )
        };
    }

    
    /**
     * // TODO
     */ 

    private inspectStockOptions = (gameStocks: Stocks, ownedStocks: StockHolding): void => {
        const profit: number = this._finance.getAverageRevenue() - this._finance.getAverageExpense();
        if (this._finance.getGold() <= 0 && profit <= 0)  {
            // sell stock, first foreign stock if any, else own stock
        } else if (this._finance.getGold() > Math.floor(this.startGold / 2) && profit > 0) {
            // buy stock
        }
    }

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

    private getSuggestedCargo = (
        supply         : CityResource[], 
        destination    : City, 
        cargoConstraint: number, 
        fillers        : [CityResource, CityResource]
    ): RouteCargo[] => {
        const result: RouteCargo[] = [];
        supply.sort((a: CityResource, b: CityResource): number => b.resource.getValue() - a.resource.getValue())
            .forEach((cr: CityResource): void => {
                if (destination.isDemand(cr.resource) && cr.available > 0) {
                    const weight: number = cr.resource.getWeight();
                    const weightRatio: number = Math.floor(cargoConstraint / weight);
                    if (weightRatio > 0) {
                        const amount: number = cargoConstraint - weightRatio >= 0 ? weightRatio : (
                            cargoConstraint - weight >= 0 ? 1 : 0
                        );
                        if (amount > 0) {
                            cargoConstraint -= amount * weight;
                            result.push({
                                resource: cr.resource,
                                targetAmount: amount,
                                actualAmount: 0
                            });
                        }
                    }
                }
            });
        if (cargoConstraint > 0) {
            result.push(...this.getFillerCargo(cargoConstraint, fillers));
        }
        return result;
    }

    /**
     * Get an array of filler CityResources within the given constraint.
     * 
     * @param   {number}                       cargoConstraint - Number of available cargo spaces.
     * @param   {[CityResource, CityResource]} fillers         - Tuple of two low-yield CityResources.
     * 
     * @returns {RouteCargo[]}                 Array of filler CityResources.
     */

    private getFillerCargo = (cargoConstraint: number, fillers: [CityResource, CityResource]): RouteCargo[] => {
        const result: RouteCargo[] = [];
        const initialAmount: number = fillers[0].available >= cargoConstraint ? cargoConstraint : fillers[0].available;
        const diff: number = cargoConstraint - initialAmount;

        result.push({
            resource: fillers[0].resource,
            targetAmount: initialAmount,
            actualAmount: 0
        });

        if (diff > 0) {
            result.push({
                resource: fillers[1].resource,
                targetAmount: diff,
                actualAmount: 0
            });
        }

        return result;
    }

    /**
     * Get number with limit of purchasing Routes. Not a great logic thus far. Needs to be re-looked at.
     * 
     * @param   {OriginRoutePotential[]} originRoutes - Array of OriginRoutePotentials.
     * 
     * @returns {number}                 Number with suggested limit of Route purchase.
     */

    private getN = (originRoutes: OriginRoutePotential[]): number => {
        const amount: number = originRoutes
            .map((origin: OriginRoutePotential): number => origin.aRoutes.length)
            .reduce((a: number, b: number): number => a + b, 0);
        return this._finance.getAverageRevenue() >= 0 && this._finance.getGold() > 0 ? (
            this._queue.length === 0 ? amount : Math.floor(amount / 2)
        ) : 0
    }

    /**
     * The default state is basically to buy Routes unless cash is needed for level up or stock purchase.
     * 
     * @param   {number}  turn - Number with current turn. 
     * 
     * @returns {boolean} True if should purchase Route else false.
     */

    private shouldPurchaseRoutes = (turn: number): boolean => {
        let shouldPurchase: boolean;
        if (this._save.should && turn < this._save.turn + this._save.diff) {
            shouldPurchase = false;
        } else {
            const levelUpReq = levelUpRequirements[this._level + 1];
            if (isDefined(levelUpReq)) {
                if (this._routes.length < levelUpReq.routes) {
                    shouldPurchase = true;
                } else {
                    if (this._finance.getAverageRevenue() >= levelUpReq.revenuePerTurn && this._finance.getGold() < levelUpReq.gold) {
                        this._save = {
                            should: true,
                            turn: turn,
                            diff: 5
                        };
                        shouldPurchase = false;
                    } else {
                        shouldPurchase = true;
                    }
                }
            } else {
                shouldPurchase = true;
            }
        }
        this.log(`should purchase: ${shouldPurchase}`);
        return shouldPurchase;
    }

    /**
     * Purchase the given Routes until respecting some generic constraints for gold and queue length.
     * 
     * @param {Nardis}         game   - Nardis game instance.
     * @param {BuyableRoute[]} routes - BuyableRoutes to purchase.
     */

    private purchaseRoutes = (game: Nardis, routes: BuyableRoute[]): void => {
        this.log(`attempting to purchase ${routes.length} routes`, routes);
        const min: number = Math.floor(this._finance.getGold() * (this._level / 10));
        for (let i = 0; i < routes.length; i++) {
            if (this._finance.getGold() - (routes[i].goldCost + routes[i].trainCost) <= min || this._queue.length > 5) {
                this.log('cannot purchase anymore routes');
                break;
            }
            this.log('purchasing route', routes[i]);
            game.addRouteToPlayerQueue(routes[i]);
        }
    }

    /**
     * // TODO
     */ 

    private deleteConsistentlyUnprofitableRoutes = (): void => {
        this.log('active routes', this._routes);
        this._routes.forEach((e, i) => {
            let p = e.getProfit();
            this.log(`${p > 0 ? 'profitable' : 'unprofitable'} ${i}`);
        });
    }

     /**
      * Get optimal Train by finding the valueRatio of each Train, 
      * which is the sum of cost and upkeep over the sum of the speed and space.
      * 
      * @param   {AdjustedTrain[]} trains - Array of AdjustedTrains to be used.
      * 
      * @returns {AdjustedTrain}   AdjustedTrain object.
      */
    
    private getSuggestedTrain = (trains: AdjustedTrain[]): AdjustedTrain => {
        const relevantTrains: AdjustedTrain[] = trains.filter((e: AdjustedTrain): boolean => this._level >= e.train.levelRequired);
        let currentSpace: number = 0; let valueRatio: number = Infinity; let i: number = 0;
        relevantTrains.forEach((train: AdjustedTrain, index: number): void => {
            const vr: number = (train.cost + train.train.upkeep) / (train.train.speed + train.train.cargoSpace);

            this.log(`possible train: nme=${train.train.name};vr=${vr.toFixed(3)};cst=${train.cost};vel=${train.train.speed};spa=${train.train.cargoSpace}`);

            if ((vr < valueRatio && train.train.cargoSpace >= currentSpace) || (Math.abs(vr - valueRatio) < Number.EPSILON && train.train.cargoSpace > currentSpace)) {
                currentSpace = train.train.cargoSpace; valueRatio = vr; i = index;
            }
        });

        this.log(`suggested train: ${relevantTrains[i].train.name}`);

        return relevantTrains[i];
    }

     /**
      * Get array of all cities currently connected to the Route network of the player. These cities will
      * serve as potential origins for new routes.
      * 
      * @returns {City[]} Array of unique City origins.
      */

    private getUniqueOrigins = (): City[] => {
        const origins: City[] = [];
        !this._startCity.isFull() ? origins.push(this._startCity) : null;
        for (let i = 0; i < this._routes.length; i++) {
            const [c1, c2]: [City, City] = [this._routes[i].getCityOne(), this._routes[i].getCityTwo()];
            if (origins.filter(e => e.equals(c1)).length <= 0 && !c1.isFull()) {
                origins.push(c1);
            }
            if (origins.filter(e => e.equals(c2)).length <= 0 && !c2.isFull()) {
                origins.push(c2);
            }
        }

        this.log(`found ${origins.length} unique origins`);

        return origins;
    }

     /**
      * For debugging purposes.
      * 
      * @param {string} msg - String with message to log.
      *  
      * @param {any}    obj - (optional) object to log.
      */
    
    private log = (msg: string, obj?: Object): void => {
        if (!!parseInt(window['nardisNonHumanDebug'])) {
            console.log(msg);
            obj ? console.log(obj) : null;
        }
    }

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

    public static createFromStringifiedJSON = (stringifiedJSON: string, cities: City[], trains: Train[], resources: Resource[], upgrades: Upgrade[]): Player => {
        const parsedJSON: any = JSON.parse(stringifiedJSON);
        return new Opponent(
            parsedJSON.name,
            parsedJSON.startGold,
            cities.filter(e => e.id === parsedJSON.startCityId)[0],
            Finance.createFromStringifiedJSON(parsedJSON.finance),
            parsedJSON.level,
            parsedJSON.queue.map(e => ({
                route: Route.createFromStringifiedJSON(e.route, cities, trains, resources),
                turnCost: e.turnCost
            })),
            parsedJSON.routes.map(e => Route.createFromStringifiedJSON(e, cities, trains, resources)),
            parsedJSON.upgrades.map(e => upgrades.filter(j => j.id === e.id)[0]),
            parsedJSON.save,
            parsedJSON.id
        )
    }
}