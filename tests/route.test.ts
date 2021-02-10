import Upgrade from '../src/modules/core/player/upgrade';
import Route from '../src/modules/core/route';
import { getRouteConfig } from './data';

const data = getRouteConfig();
const { c1, c2, t1, distance, turnsToArrival } = data.data.initiated;
const routePlanCargo = data.routePlanCargo;
const { cities, trains, resources } = data.data;
const handleTurnData = data.data.handleTurnData;

const speedUpgrade = new Upgrade(
    data.data.upgrades[2].name,
    data.data.upgrades[2].cost,
    data.data.upgrades[2].value,
    data.data.upgrades[2].type,
    data.data.upgrades[2].levelRequired
);

const route = new Route(
    'testRoute',
    c1,
    c2,
    t1,
    routePlanCargo,
    distance,
    0,
    0
);


test('can set initial state', () => {
    const state = route.getRouteState();
    const cargo = state.cargo[0];

    expect(state.hasArrived).toBe(false);
    expect(state.destination.equals(c2)).toBe(true);
    expect(state.distance).toEqual(distance);
    expect(cargo.resource.equals(routePlanCargo.cityOne[0].resource)).toBe(true);
    expect(cargo.targetAmount).toEqual(routePlanCargo.cityOne[0].targetAmount);
    expect(cargo.actualAmount).toEqual(routePlanCargo.cityOne[0].actualAmount);
});

test('can arrive', () => {
    for (let i = 0; i < turnsToArrival; i++) {
        route.handleTurn({...handleTurnData, turn: i});
    }
    expect(route.getRouteState().hasArrived).toBe(true);
    expect(route.getKilometersTravelled() >= distance).toBe(true);
});

test('can depart and update state', () => {
    route.handleTurn({...handleTurnData, turn: 0});
    const state = route.getRouteState();
    const cargo = state.cargo[0];

    expect(state.hasArrived).toBe(false);
    expect(state.destination.equals(c1)).toBe(true);
    expect(state.distance <= distance).toBe(true);
    expect(cargo.resource.equals(routePlanCargo.cityTwo[0].resource)).toBe(true);
    expect(cargo.targetAmount).toEqual(routePlanCargo.cityTwo[0].targetAmount);
    expect(cargo.actualAmount).toEqual(routePlanCargo.cityTwo[0].actualAmount);
});

test('can add to profits', () => {
    route.addToProfit(50);
    expect(route.getProfit()).toEqual(50);
});

test('can subtract from profits', () => {
    route.subtractFromProfit(30);
    expect(route.getProfit()).toEqual(20);
});

test('can reconstruct route base properties', () => {
    const stringifiedJSON = route.deconstruct();
    const reconstructedRoute = Route.createFromStringifiedJSON(stringifiedJSON, cities, trains, resources);

    expect(reconstructedRoute.equals(route)).toBe(true);
    expect(reconstructedRoute.name).toEqual(route.name);
    expect(reconstructedRoute.getDistance()).toEqual(route.getDistance());
    expect(reconstructedRoute.getCost()).toEqual(route.getCost());
    expect(reconstructedRoute.getPurchasedOnTurn()).toEqual(route.getPurchasedOnTurn());
    expect(reconstructedRoute.getProfit()).toEqual(route.getProfit());
    expect(reconstructedRoute.getKilometersTravelled()).toEqual(route.getKilometersTravelled());
});

test('can reconstruct route city properties', () => {
    const stringifiedJSON = route.deconstruct();
    const reconstructedRoute = Route.createFromStringifiedJSON(stringifiedJSON, cities, trains, resources);

    expect(reconstructedRoute.getCityOne().equals(route.getCityOne())).toBe(true);
    expect(reconstructedRoute.getCityTwo().equals(route.getCityTwo())).toBe(true);
});

test('can reconstruct route state properties', () => {
    const stringifiedJSON = route.deconstruct();
    const reconstructedRoute = Route.createFromStringifiedJSON(stringifiedJSON, cities, trains, resources);
    const [s1, s2] = [reconstructedRoute.getRouteState(), route.getRouteState()];

    expect(s1.cargo.length).toEqual(s2.cargo.length);
    expect(s1.cargo[0].resource.equals(s2.cargo[0].resource)).toBe(true);
    expect(s1.destination.equals(s2.destination)).toBe(true);
    expect(s1.distance).toEqual(s2.distance);
    expect(s1.hasArrived).toBe(s2.hasArrived);
});

test('can reconstruct route plan properties', () => {
    const stringifiedJSON = route.deconstruct();
    const reconstructedRoute = Route.createFromStringifiedJSON(stringifiedJSON, cities, trains, resources);
    const [p1, p2] = [reconstructedRoute.getRoutePlan(), route.getRoutePlan()];

    expect(p1.cityOne.length).toEqual(p2.cityOne.length);
    expect(p1.cityTwo.length).toEqual(p2.cityTwo.length);
    [[p1.cityOne, p2.cityOne], [p1.cityTwo, p2.cityTwo]].forEach(e => {
        for (let i = 0; i < e[0].length; i++) {
            expect(e[0][i].resource.equals(e[1][i].resource));
            expect(e[0][i].actualAmount).toEqual(e[1][i].actualAmount);
            expect(e[0][i].targetAmount).toEqual(e[1][i].targetAmount);
        }
    })
});

test('can handle player upgrades', () => {
    const speed = route.getTrain().speed
    const predictedDistance = route.getRouteState().distance - (speed + Math.floor(speed  * speedUpgrade.value));

    route.handleTurn({
        ...handleTurnData,
        playerData: {
            routes: [],
            upgrades: [speedUpgrade]
        }
    });

    expect(route.getRouteState().distance).toEqual(predictedDistance);
});

test('can change route train', () => {
    const newTrain = trains.filter(e => !e.equals(route.getTrain()))[0];
    route.change(newTrain, route.getRoutePlan());
    expect(route.getTrain().equals(newTrain)).toBe(true);
});