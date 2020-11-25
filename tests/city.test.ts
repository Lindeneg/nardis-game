import City from '../src/modules/core/city';
import { getTestData, getTestCityModels } from './data';

const data = getTestData();
const { resources } = data;
const handleTurnData = data.handleTurnData;
const { cityConfig, cityConfigTwo } = getTestCityModels();

const usedResources = resources.filter(e => {
    return (
        e.name === 'passengers' ||
        e.name === 'mail' ||
        e.name === 'grain'
    );
});

const notUsedResource = resources.filter(e => {
    return e.name === 'oil';
})[0];

const city = City.createFromModel(cityConfig, resources);
const cityTwo = City.createFromModel(cityConfigTwo, resources);


test('can instantiate City', () => {
    const {phi, lambda} = city.getCoords();
    expect(city.name).toEqual(cityConfig.name);
    expect(city.getSize()).toEqual(cityConfig.size);
    expect(phi).toEqual(cityConfig.phi);
    expect(lambda).toEqual(cityConfig.lambda);
    expect(city.getSupply().length).toEqual(2);
    expect(city.getDemand().length).toEqual(2);
});

test('can calculate distance between two cities', () => {
    expect(city.distanceTo(cityTwo)).toEqual(232);
});

test('can get isFull specifier when room is available', () => {
    expect(city.isFull()).toBe(false);
});

test('can increment route count', () => {
    [null, null, null, null].forEach(_ => city.incrementRouteCount());
    expect(city.getCurrentRouteCount()).toEqual(4);
});

test('can get isFull specifier when room is not available', () => {
    expect(city.isFull()).toBe(true);
});

test('can decrement route count', () => {
    [null, null, null, null].forEach(_ => city.decrementRouteCount());
    expect(city.getCurrentRouteCount()).toEqual(0);
});

test('can check if Resource is supply', () => {
    expect(city.isSupply(usedResources[0])).toBe(true);
    expect(city.isSupply(usedResources[1])).toBe(true);
});

test('can check if Resource is not supply', () => {
    expect(city.isSupply(notUsedResource)).toBe(false);
});

test('can check if Resource is demand', () => {
    expect(city.isDemand(usedResources[0])).toBe(true);
    expect(city.isDemand(usedResources[2])).toBe(true);
});

test('can check if Resource is not demand', () => {
    expect(city.isDemand(notUsedResource)).toBe(false);
});

test('can get CityResource from Resource', () => {
    const cityResource = city.getCityResourceFromResource(usedResources[0]);
    expect(cityResource.resource.equals(usedResources[0])).toBe(true);
    expect(cityResource.amount).toEqual(cityConfig.supply[0].amount);
    expect(cityResource.available).toEqual(cityConfig.supply[0].available);
});

test('can grow City and add new resources', () => {
    let didGrow: boolean = false;
    let didUpdateResources: boolean = false;
    for (let i = 0; i < 50; i++) {
        city.handleTurn(handleTurnData);
        if (!didGrow && city.getSize() > cityConfig.size) {
            didGrow = true;
        }
        if (
            !didUpdateResources && 
            city.getSupply().length > cityConfig.supply.length &&
            city.getDemand().length > cityConfig.demand.length
        ) {
            didUpdateResources = true;
        }
        if (didGrow && didUpdateResources) { break; }
    }
    expect(didGrow).toBe(true);
    expect(didUpdateResources).toBe(true);
});

test('cannot grow City when max size is reached', () => {
    let didGrow: boolean = false;
    for (let i = 0; i < 50; i++) {
        // cityTwo is already size 6 (max size)
        cityTwo.handleTurn(handleTurnData);
        if (!didGrow && cityTwo.getSize() > cityConfigTwo.size) {
            didGrow = true;
            break;
        }
    }
    expect(didGrow).toBe(false);
});

test('can subtract from valid city supply', () => {
    const didSubtract = city.subtractSupply(usedResources[0], 1);
    const didActuallySubtract = city.getCityResourceFromResource(usedResources[0]).available === cityConfig.supply[0].amount - 1;
    expect(didSubtract).toBe(true);
    expect(didActuallySubtract).toBe(true);
});

test('cannot subtract from invalid city supply', () => {
    expect(!city.isSupply(notUsedResource) && city.subtractSupply(notUsedResource, 1)).toBe(false);
});

test('can refill city supply', () => {
    city.subtractSupply(usedResources[0], 1);
    for (let i = 0; i < cityConfig.supplyRefillRate + 1; i++) {
        city.handleTurn(handleTurnData);
    }
    expect(city.getCityResourceFromResource(usedResources[0]).available).toEqual(cityConfig.supply[0].amount);
});

test('can reconstruct city base properties', () => {
    const stringifiedJSON = city.deconstruct();
    const reconstructedCity = City.createFromStringifiedJSON(stringifiedJSON, resources);

    expect(reconstructedCity.equals(city)).toBe(true);
    expect(reconstructedCity.name).toEqual(city.name);
    expect(reconstructedCity.getSize() === city.getSize()).toBe(true);
    expect(reconstructedCity.getGrowthRate()).toEqual(city.getGrowthRate());
    expect(reconstructedCity.getGrowthDecider()).toEqual(city.getGrowthDecider());
    expect(reconstructedCity.getSupplyRefillRate()).toEqual(city.getSupplyRefillRate());
    expect(reconstructedCity.getSupplyDecider()).toEqual(city.getSupplyDecider());
    expect(reconstructedCity.getCurrentRouteCount()).toEqual(city.getCurrentRouteCount());
});

test('can reconstruct city coordinates', () => {
    const stringifiedJSON = city.deconstruct();
    const reconstructedCity = City.createFromStringifiedJSON(stringifiedJSON, resources);
    const [cr1, cr2] = [reconstructedCity.getCoords(), city.getCoords()];
    expect(cr1.phi).toEqual(cr2.phi);
    expect(cr1.lambda).toEqual(cr2.lambda);
});

test('can reconstruct city resources', () => {
    const stringifiedJSON = city.deconstruct();
    const reconstructedCity = City.createFromStringifiedJSON(stringifiedJSON, resources);
    const [sup1, sup2] = [reconstructedCity.getSupply(), city.getSupply()];
    const [dem1, dem2] = [reconstructedCity.getDemand(), city.getDemand()];
    const expectedSupplyMatches = sup1.length;
    const expectedDemandMatches = dem1.length;

    let actualSupplyMatches = sup1.map(s1 => {
        return sup2.filter(s2 => (
            s1.resource.equals(s2.resource) &&
            s1.amount === s2.amount &&
            s1.available === s2.available 
        ));
    }).length;
    let actualDemandMatches = dem1.map(d1 => {
        return dem2.filter(d2 => (
            d1.resource.equals(d2.resource) &&
            d1.amount === d2.amount &&
            d1.available === d2.available
        ));
    }).length;

    expect(sup1.length).toEqual(sup2.length);
    expect(dem1.length).toEqual(dem2.length);
    expect(actualSupplyMatches).toEqual(expectedSupplyMatches);
    expect(actualDemandMatches).toEqual(expectedDemandMatches);
});