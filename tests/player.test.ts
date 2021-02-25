import Player from '../src/modules/core/player/player';
import Stock from '../src/modules/core/player/stock';
import Route from '../src/modules/core/route';
import { 
    PlayerType, 
    PlayerLevel 
} from '../src/types/types';
import {
    rangePerLevel, START_GOLD
} from '../src/util/constants';
import {
    randomNumber
} from '../src/util/util';
import { 
    getRouteConfig 
} from './data';

// TODO test stock and reset

const generateRoute = () => {
    const city1 = data.data.cities[randomNumber(0, data.data.cities.length - 1)];
    let city2 = city1;
    while (city1.equals(city2)) {
        city2 = data.data.cities[randomNumber(0, data.data.cities.length - 1)];
    }
    return new Route(
        'testRoute',
        city1,
        city2,
        t1,
        routePlanCargo,
        distance,
        0,
        randomNumber(1, 100)
    );
}

const data = getRouteConfig();
const { c1, t1, distance } = data.data.initiated;
const routePlanCargo = data.routePlanCargo;

const routes = [];
for (let i = 0; i < 50; i++) {
    routes.push(generateRoute());
}

const route = generateRoute();

const config = {
    name: "christian",
    playerType: PlayerType.Human,
    startCity: c1
};

const player = new Player(
    config.name,
    START_GOLD,
    config.playerType,
    config.startCity
);

const stock = new Stock('test', player.id, 0);

const handleTurnData = {
    ...data.data.handleTurnData,
    playerData: {
        ...data.data.handleTurnData.playerData,
        gameStock: {
            [player.id]: stock
        }
    }
};

const upgrade = data.data.upgrades[0];

test('can initialize correctly', () => {
    expect(player.name).toEqual(config.name);
    expect(player.playerType).toEqual(config.playerType);
    expect(player.getLevel()).toEqual(PlayerLevel.Novice)
    expect(player.getStartCity().equals(config.startCity)).toBe(true);
});

test('can get correct range from player level', () => {
    expect(player.getRange()).toEqual(rangePerLevel[PlayerLevel.Novice]);
});

test('can add to queue', () => {
    player.addRouteToQueue(route, 1);

    expect(player.getQueue().length).toEqual(1);
    expect(player.getQueue()[0].route.equals(route)).toBe(true);
});

test('can remove from queue', () => {
    player.removeRouteFromQueue(route.id);

    expect(player.getQueue().length).toEqual(0);
});

test('can add upgrade', () => {
    player.addUpgrade(upgrade);

    expect(player.getUpgrades().length).toEqual(1);
    expect(player.getUpgrades()[0].equals(upgrade)).toBe(true);
});

test('can handle queue item', () => {
    player.addRouteToQueue(route, 1);
    player.handleTurn(handleTurnData);
    player.handleTurn(handleTurnData);

    expect(player.getQueue().length).toEqual(0);
    expect(player.getRoutes().length).toEqual(1);
    expect(player.getRoutes()[0].equals(route)).toBe(true);
});

test('can reconstruct player base properties', () => {
    const str = player.deconstruct();
    const rec = Player.createFromStringifiedJSON(str, data.data.cities, data.data.trains, data.data.resources, data.data.upgrades);

    expect(rec.equals(player)).toBe(true);
    expect(rec.name).toEqual(player.name);
    expect(rec.getLevel()).toEqual(player.getLevel());
    expect(rec.playerType).toEqual(player.playerType);
    expect(rec.getRange()).toEqual(player.getRange());
    expect(rec.getStartCity().equals(player.getStartCity())).toBe(true);
});

test('can reconstruct player finance properties', () => {
    const str = player.deconstruct();
    const rec = Player.createFromStringifiedJSON(str, data.data.cities, data.data.trains, data.data.resources, data.data.upgrades);
    const [f1, f2] = [rec.getFinance(), player.getFinance()];
    const [h1, h2] = [f1.getHistory(), f2.getHistory()];

    expect(f1.equals(f2)).toBe(true);
    expect(f1.getGold()).toEqual(f2.getGold());
    expect(f1.getAverageRevenue()).toEqual(f2.getAverageRevenue());

    expect(h1.income.nthTurn.length).toEqual(h2.income.nthTurn.length);
    expect(h1.income.nthTurnMinusOne.length).toEqual(h2.income.nthTurnMinusOne.length);
    expect(h1.income.nthTurnMinusTwo.length).toEqual(h2.income.nthTurnMinusTwo.length);

    expect(h1.expense.nthTurn.length).toEqual(h2.expense.nthTurn.length);
    expect(h1.expense.nthTurnMinusOne.length).toEqual(h2.expense.nthTurnMinusOne.length);
    expect(h1.expense.nthTurnMinusTwo.length).toEqual(h2.expense.nthTurnMinusTwo.length);
});

test('can reconstruct player routes', () => {
    const str = player.deconstruct();
    const rec = Player.createFromStringifiedJSON(str, data.data.cities, data.data.trains, data.data.resources, data.data.upgrades);
    const [r1, r2] = [rec.getRoutes(), player.getRoutes()];

    let i = 0; 

    r1.forEach(r => {
        if (r2.filter(e => e.equals(r)).length > 0) {
            i++;
        }
    });

    expect(rec.getQueue().length).toEqual(player.getQueue().length);
    expect(r1.length).toEqual(r2.length);
    expect(i).toEqual(r1.length);
});

test('can reconstruct player upgrades', () => {
    const str = player.deconstruct();
    const rec = Player.createFromStringifiedJSON(str, data.data.cities, data.data.trains, data.data.resources, data.data.upgrades);
    const [u1, u2] = [rec.getUpgrades(), player.getUpgrades()];

    expect(u1.length).toEqual(u2.length);
    expect(u1[0].equals(u2[0])).toBe(true);
});