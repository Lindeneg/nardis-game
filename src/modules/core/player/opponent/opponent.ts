import { Nardis } from '../../../nardis';
import Player from '../player';
import Finance from '../finance';
import Upgrade from '../upgrade';
import Route from '../../route';
import City from '../../city';
import Train from '../../train';
import Resource from '../../resource';
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
    BuyableRoute
} from '../../../../types/types';
import { levelUpRequirements } from '../../../../util/constants';


interface ActionSave {
    should: boolean,
    turn: number,
    diff: number
};


export default class Opponent extends Player {

    private _save: ActionSave

    constructor(
        name        : string,
        startCity   : City,
        finance    ?: Finance,
        level      ?: PlayerLevel,
        queue      ?: QueuedRouteItem[],
        routes     ?: Route[],
        upgrades   ?: Upgrade[],
        save       ?: ActionSave,
        id         ?: string
    ) {
        super(name, PlayerType.Computer, startCity, finance, level, queue, routes, upgrades, id);

        this._save = save ? save : {
            should: false,
            turn: 1,
            diff: 0
        };
    }

    // TODO
    public handleTurn = (info: HandleTurnInfo, game: Nardis) => {
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

    // TODO
    public setSave = (save: ActionSave): void => {
        this._save = save;
    }

    // TODO
   public deconstruct = (): string => JSON.stringify({
        name: this.name,
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
     * Main function for deducing the best action for the non-human player in question.
     */
    private deduceAction = (info: HandleTurnInfo, game: Nardis): void => {
        this.log(`turn=${info.turn};comp=${this.name};avgr=${this._finance.getAverageRevenue()}g;curg=${this._finance.getGold()};rout=${this._routes.length};queu=${this._queue.length};leve=${this._level};`);
        this.buyAvailableUpgrades(info, game);
        const stockOptions = this.inspectStockOptions();
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
     * Sort those routes after highest potential profitability.
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
     * Buy all available upgrades but respect the maxSpend constraint.
     */
    private buyAvailableUpgrades = (info: HandleTurnInfo, game: Nardis): void => {
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
                        power: {...this.getPower(route.cityOne.distanceTo(route.cityTwo), suggestedTrain.train, suggestedRoutePlan)}
                    }
                })
        }})
    );

    /**
     * What would the expected profit be from a full revolution? That is from origin, to destination and back again.
     * How many turns will it take? The power index is the expected profit over the turns a full revolution requires.
     */
    private getPower = (distance: number, train: Train, routePlan: RoutePlanCargo): RoutePower => {
        const fullRevolutionInTurns: number = Math.ceil(distance / train.speed) * 2;
        // plus four is to account for loading/unloading in both cities
        const upkeep: number = (fullRevolutionInTurns + 4) * train.upkeep;
        let expectedProfitValue: number = [routePlan.cityOne, routePlan.cityTwo].map((plan: RouteCargo[]): number => (
            plan.map((cargo: RouteCargo): number => (
                cargo.targetAmount * cargo.resource.getValue()
            )).reduce((a: number, b: number): number => a + b, 0)
        )).reduce((a: number, b: number): number => a + b, 0) - upkeep;
        return {
            expectedProfitValue,
            fullRevolutionInTurns,
            powerIndex: expectedProfitValue / fullRevolutionInTurns
        }
    }

    /**
     * Try and deduce the best RoutePlanCargo for a given route between two cities.
     */
    private getSuggestedRoutePlan = (route: PotentialRoute, cargoConstraint: number): RoutePlanCargo => {
        const c1Supply: CityResource[] = route.cityOne.getSupply(); const c2Supply: CityResource[] = route.cityTwo.getSupply();
        const c1p: CityResource = c1Supply[0]; const c1m: CityResource = c1Supply[1];
        const c2p: CityResource = c2Supply[0]; const c2m: CityResource = c2Supply[1];
        return {
            cityOne: 
                this.getSuggestedCargo(
                    c1Supply.filter((cr: CityResource): boolean => !cr.resource.equals(c1p.resource) && !cr.resource.equals(c1m.resource)),
                    route.cityTwo,
                    cargoConstraint,
                    [c1p, c1m]
                ), 
            cityTwo:
                this.getSuggestedCargo(
                    c2Supply.filter((cr: CityResource): boolean => !cr.resource.equals(c2p.resource) && !cr.resource.equals(c2m.resource)),
                    route.cityOne,
                    cargoConstraint,
                    [c2p, c2m]
                )
        };
    }

    // TODO 
    private inspectStockOptions = () => {

    }

    /**
     * Supply will be medium-to-high-yield Resources. Filler will be the two low-yield Resources.
     * Prioritize supply but if all are either not demand in destination or weights more than current cargoConstraint,
     * then fill up the rest of the cargo space with filler Resources.
     */
    private getSuggestedCargo = (supply: CityResource[], destination: City, cargoConstraint: number, filler: [CityResource, CityResource]): RouteCargo[] => {
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
            const ini: number = Math.ceil(cargoConstraint / 2); const diff: number = cargoConstraint - ini;
            result.push(...[
                {
                    resource: filler[0].resource,
                    targetAmount: ini,
                    actualAmount: 0
                },
                {
                    resource: filler[1].resource,
                    targetAmount: diff > 0 ? diff : 0,
                    actualAmount: 0
                }
            ]);
        }
        return result;
    }

    // TODO
    private getN = (originRoutes: OriginRoutePotential[]): number => {
        const amount: number = originRoutes
        .map((origin: OriginRoutePotential): number => origin.aRoutes.length)
        .reduce((a: number, b: number): number => a + b, 0);
        return this._finance.getAverageRevenue() >= 0 && this._finance.getGold() > 0 ? (
            this._queue.length === 0 ? amount : Math.floor(amount / 2)
        ) : 0
    }

    // TODO
    private shouldPurchaseRoutes = (turn: number): boolean => {
        let shouldPurchase: boolean;
        if (this._save.should && turn < this._save.turn + this._save.diff) {
            shouldPurchase = false;
        } else {
            const levelUpReq = levelUpRequirements[this._level + 1];
            if (typeof levelUpReq !== 'undefined') {
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

    // TODO
    private purchaseRoutes = (game: Nardis, routes: BuyableRoute[]): void => {
        this.log(`attempting to purchase ${routes.length} routes`, routes);
        const min: number = Math.floor(this._finance.getGold() * 0.1);
        for (let i = 0; i < routes.length; i++) {
            if (this._finance.getGold() - (routes[i].goldCost + routes[i].trainCost) <= min || this._queue.length > 5) {
                this.log('cannot purchase anymore routes');
                break;
            }
            this.log('purchasing route', routes[i]);
            game.addRouteToPlayerQueue(routes[i]);
        }
    }

    // TODO
    private deleteConsistentlyUnprofitableRoutes = (): void => {
        this.log('active routes', this._routes);
        this._routes.forEach((e, i) => {
            let p = e.getProfit();
            this.log(`${p > 0 ? 'profitable' : 'unprofitable'} ${i}`);
        });
    }

    /**
     * Find the valueRatio of each Train, which is cost (negative) over the sum of the speed and space (positive).
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
     * Temp for debug purposes
     */
    private log = (msg: string, obj?: Object): void => {
        if (!!parseInt(window['nardisNonHumanDebug'])) {
            console.log(msg);
            obj ? console.log(obj) : null;
        }
    }

    /**
     * Get Player instance from stringified JSON.
     * 
     * @param {string}     stringifiedJSON - String with information to be used.
     * @param {City[]}     cities          - City instances used in the current game.
     * @param {Upgrades[]} upgrades        - Upgrade instances used in the current game.
     * 
     * @return {Player}                      Player instance created from stringifiedJSON.
     */

    public static createFromStringifiedJSON = (stringifiedJSON: string, cities: City[], trains: Train[], resources: Resource[], upgrades: Upgrade[]): Player => {
        const parsedJSON: any = JSON.parse(stringifiedJSON);
        return new Opponent(
            parsedJSON.name,
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