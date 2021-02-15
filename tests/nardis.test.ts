import { Nardis } from '../src/modules/nardis';
import Player from '../src/modules/core/player/player';
import { 
    getRouteConfig 
} from './data';
import { 
    LocalKey,
    PlayerType,
    UpgradeType
} from '../src/types/types';
import {
    localKeys, START_GOLD
} from '../src/util/constants';
import {
    getRangeTurnCost
} from '../src/util/util';
import Stock from '../src/modules/core/player/stock';


const data = getRouteConfig();

const { cities, resources, trains, upgrades } = data.data;

const { c1, c2, t1, distance } = data.data.initiated;

const player = new Player(
    "Christian",
    START_GOLD,
    PlayerType.Human,
    cities[0]
);

const stock1 = new Stock('test', player.id);

const player2 = new Player(
    "Miles",
    START_GOLD,
    PlayerType.Computer,
    cities[2]
);

const stock2 = new Stock('test2', player2.id);

const nardis = new Nardis(
    {
        cities,
        resources,
        trains,
        upgrades,
    },
    [player, player2],
    {
        [player.id]: stock1,
        [player2.id]: stock2
    }
);

const upgradeTrack = upgrades.filter(e => e.type === UpgradeType.TrackValueCheaper)[0];
const upgradeTurn = upgrades.filter(e => e.type === UpgradeType.TurnCostCheaper)[0];
const upgradeTrain = upgrades.filter(e => e.type === UpgradeType.TrainValueCheaper)[0];

const config = {
    cityOne: c1,
    cityTwo: c2,
    distance: distance,
    goldCost: 100,
    turnCost: 1,
    purchasedOnTurn: 2,
    train: t1,
    trainCost: 100,
    routePlanCargo: data.routePlanCargo
};

test('can initialize', () => {
    expect(nardis.players[0].equals(player)).toBe(true);
    expect(nardis.players[1].equals(player2)).toBe(true);
    expect(nardis.data.cities.length).toEqual(cities.length);
    expect(nardis.data.upgrades.length).toEqual(upgrades.length);
    expect(nardis.data.trains.length).toEqual(trains.length);
    expect(nardis.data.resources.length).toEqual(resources.length);
    expect(nardis.getCurrentTurn()).toEqual(1);
});

test('can get array of possible routes without upgrades', () => {
    const result = nardis.getArrayOfPossibleRoutes(player.getStartCity()).filter(
        route => route.distance > player.getRange()
    ).length <= 0;
    expect(result).toBe(true);
});

test('can add upgrade to player', () => {
    const playerUpgrades = nardis.getCurrentPlayer().getUpgrades();
    nardis.addUpgradeToPlayer(upgradeTrack.id);

    expect(playerUpgrades.length).toEqual(1);
    expect(playerUpgrades[0].equals(upgradeTrack)).toBe(true);
});

test('can get array of possible routes with route cost upgrade', () => {
    const possibleRoutes = nardis.getArrayOfPossibleRoutes(player.getStartCity());
    const result = possibleRoutes.filter(
        route => {
            const cost = route.distance * 2;
            const predictedCost = cost - Math.floor(cost * upgradeTrack.value);
            return predictedCost === route.goldCost;
        }
    ).length === possibleRoutes.length;
    expect(result).toBe(true);
});

test('can get array of possible routes with turn upgrade', () => {
    player.addUpgrade(upgradeTurn);
    const possibleRoutes = nardis.getArrayOfPossibleRoutes(player.getStartCity());
    const result = possibleRoutes.filter(
        route => route.turnCost === getRangeTurnCost(route.distance) - upgradeTurn.value
    ).length === possibleRoutes.length;
    expect(result).toBe(true);
});

test('can get array of adjusted trains with upgrade', () => {
    player.addUpgrade(upgradeTrain);
    const adjustedTrains = nardis.getArrayOfAdjustedTrains();
    const result = adjustedTrains.filter(train => {
        const cost = train.train.cost;
        const predictedCost = cost - Math.floor(cost * upgradeTrain.value);
        return (predictedCost ? predictedCost : 1) === train.cost;
    }).length === adjustedTrains.length;
    
    expect(result).toBe(true);
});

test('can add to player queue', () => {
    const queue = nardis.getCurrentPlayer().getQueue();
    nardis.addRouteToPlayerQueue(config);

    expect(queue.length).toEqual(1);
    expect(queue[0].route.getCityOne().equals(c1)).toBe(true);
    expect(queue[0].route.getCityTwo().equals(c2)).toBe(true);
    expect(queue[0].route.getTrain().equals(t1)).toBe(true);
});

test('can handle turn cycle', () => {
    for (let i = 0; i < 2; i++) {
        nardis.endTurn();
    }

    const queue = nardis.getCurrentPlayer().getQueue();
    const routes = nardis.getCurrentPlayer().getRoutes();

    expect(nardis.getCurrentTurn()).toEqual(3);
    expect(queue.length).toEqual(0);
    expect(routes.length).toEqual(1);

    expect(routes[0].getCityOne().equals(c1)).toBe(true);
    expect(routes[0].getCityTwo().equals(c2)).toBe(true);
    expect(routes[0].getTrain().equals(t1)).toBe(true);
});

test('can remove from player queue', () => {
    nardis.addRouteToPlayerQueue(config);
    const queue = nardis.getCurrentPlayer().getQueue();
    const [routeId, trainId] = [queue[0].route.id, queue[0].route.getTrain().id];

    expect(queue.length).toEqual(1);

    nardis.removeRouteFromPlayerQueue(routeId, trainId);

    expect(queue.length).toEqual(0);
});

test('has saved game', () => {
    const hasSavedGame = localKeys.filter(key => {
        const item = window.localStorage.getItem(key);
        return typeof item !== 'undefined' && item.length > 0;
    }).length === localKeys.length;

    expect(hasSavedGame).toBe(true);
});

test('can extract turn from local storage', () => {
    const turn = parseInt(atob(window.localStorage.getItem(localKeys[LocalKey.Turn])));
    expect(turn).toEqual(nardis.getCurrentTurn());
});

test('can clear local storage', () => {
    nardis.clearStorage();
    const hasClearedStorage = localKeys.filter(key => {
        const item = window.localStorage.getItem(key);
        return !!item;
    }).length === 0;

    expect(hasClearedStorage).toBe(true);
});