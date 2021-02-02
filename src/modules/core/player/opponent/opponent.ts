import { Nardis } from '../../../nardis';
import Player from '../player';
import Finance from '../finance';
import Upgrade from '../upgrade';
import Route from '../../route';
import City from '../../city';
import Train from '../../train';
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
    RoutePower
} from '../../../../types/types';


export default class Opponent extends Player {

    _lastLevel: number

    constructor(
        name        : string,
        startCity   : City,
        finance    ?: Finance,
        level      ?: PlayerLevel,
        queue      ?: QueuedRouteItem[],
        routes     ?: Route[],
        upgrades   ?: Upgrade[],
        id         ?: string
    ) {
        super(name, PlayerType.Computer, startCity, finance, level, queue, routes, upgrades, id);

        this._lastLevel = this._level;
    }

    public handleTurn = (info: HandleTurnInfo, game: Nardis) => {
        if (this.shouldLevelBeIncreased()) {
            this.increaseLevel();
        }
        this.handleQueue();
        this.handleRoutes(info);
        this.handleFinance(info);
        this.deduceAction(info, game);
    }

    private deduceAction = (info: HandleTurnInfo, game: Nardis): void => {
        if (this._lastLevel < this._level || this._level === PlayerLevel.Novice) {
            this.buyAvailableUpgrades(info, game, Math.floor(this._finance.getGold() / 2));
            this._level !== PlayerLevel.Novice ? this._lastLevel++ : null;
        }

        if (this.shouldPurchaseRoute()) {
            this.pickNInterestingRoutes(this.getInterestingRoutes(game), 1);
        }

        this.optimizeUnprofitableRoutes();
    }

    private getInterestingRoutes = (game: Nardis): OriginRoutePotential[] => {
        const result: OriginRoutePotential[] = [];
        const train: AdjustedTrain = this.getSuggestedTrain(game.getArrayOfAdjustedTrains());
        const routePotentials: OriginRoutePotential[] = this.getRoutePowerPotential(game, train);
        console.log(routePotentials)
        // TODO filter result for routes within budget
        return result;
    }

    private pickNInterestingRoutes = (routes: OriginRoutePotential[], n: number) => {
        // todo
    }

    private buyAvailableUpgrades = (info: HandleTurnInfo, game: Nardis, maxSpend: number = this._finance.getGold()) => {
        let spent: number = 0;
        info.data.upgrades.filter((upgrade: Upgrade): boolean => this._level >= upgrade.levelRequired)
        .forEach((upgrade: Upgrade): void => {
            if (upgrade.cost + spent <= maxSpend) {
                game.addUpgradeToPlayer(upgrade.id);
                spent += upgrade.cost;
            }
        });
    }

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
                    c1p.resource.getValue() > c1m.resource.getValue() ? c1p : c1m
                ), 
            cityTwo:
                this.getSuggestedCargo(
                    c2Supply.filter((cr: CityResource): boolean => !cr.resource.equals(c2p.resource) && !cr.resource.equals(c2m.resource)),
                    route.cityOne,
                    cargoConstraint,
                    c2p.resource.getValue() > c2m.resource.getValue() ? c2p : c2m
                )
        };
    }

    private getSuggestedCargo = (supply: CityResource[], destination: City, cargoConstraint: number, filler: CityResource): RouteCargo[] => {
        const result: RouteCargo[] = [];
        supply.sort((a: CityResource, b: CityResource): number => b.resource.getValue() - a.resource.getValue())
        .forEach((cr: CityResource): void => {
            if (destination.isDemand(cr.resource)) {
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
            result.push({
                resource: filler.resource,
                targetAmount: cargoConstraint,
                actualAmount: 0
            })
        }
        return result;
    }

    private shouldPurchaseRoute = (): boolean => {
        // todo
        return true;
    }

    private optimizeUnprofitableRoutes = (): void => {
        // todo
    }

    private getSuggestedTrain = (trains: AdjustedTrain[]): AdjustedTrain => {
        const relevantTrains: AdjustedTrain[] = trains.filter((e: AdjustedTrain): boolean => this._level >= e.train.levelRequired);
        let currentSpace: number = 0; let valueRatio: number = Infinity; let i: number = 0;
        relevantTrains.forEach((train: AdjustedTrain, index: number): void => {
            const vr: number = train.cost / train.train.cargoSpace;
            if (train.train.cargoSpace > currentSpace * 2 || (vr < valueRatio && train.train.cargoSpace > currentSpace)) {
                currentSpace = train.train.cargoSpace; valueRatio = vr; i = index;
            }
        });
        return relevantTrains[i];
    }

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
        return origins;
    }
}