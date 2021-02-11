import City from '../src/modules/core/city';
import Train from '../src/modules/core/train';
import Resource from '../src/modules/core/resource';
import Upgrade from '../src/modules/core/player/upgrade';
import { generateData } from '../src/data/data';


const getStandardData = () => {
    const data = generateData();
    const res = data.resources.map(e => Resource.createFromModel(e));
    return {
        resources: res,
        cities: data.cities.map(e => City.createFromModel(e, res)),
        trains: data.trains.map(e => Train.createFromModel(e)),
        upgrades: data.upgrades.map(e => Upgrade.createFromModel(e)),
        model: data
    };
}

export const getTestData = () => {
    const standardData = getStandardData();
    const handleTurnData = {
        turn: 1,
        data: standardData,
        playerData: {
            routes: [],
            upgrades: []
        }
    };
    const distance = standardData.cities[0].distanceTo(standardData.cities[1]);
    return {
        ...standardData,
        handleTurnData,
        initiated: {
            c1: standardData.cities[0],
            c2: standardData.cities[1],
            t1: standardData.trains[0],
            distance: distance,
            turnsToArrival: Math.ceil(distance / standardData.trains[0].speed) + 1,
            r1: standardData.cities[0].getSupply().filter(e => e.resource.name === 'passengers')[0],
            r2: standardData.cities[1].getSupply().filter(e => e.resource.name === 'passengers')[0]
        }
    };
}

export const getTestCityModels = () => {
    return {
        cityConfig: {
            name: 'town',
            size: 2,
            phi: 54.4863,
            lambda: 0.6133,
            supply: [
                {
                    name: "passengers",
                    amount: 2,
                    available: 1
                },
                {
                    name: "mail",
                    amount: 2,
                    available: 1
                }
            ],
            demand: [
                {
                    name: "passengers",
                    amount: -1,
                    available: -1
                },
                {
                    name: "grain",
                    amount: -1,
                    available: -1
                }
            ],
            growthRate: 0.6,
            supplyRefillRate: 2
        },
        cityConfigTwo: {
            name: '',
            size: 6,
            phi: 54.88,
            lambda: -2.93,
            supply: [
            ],
            demand: [
            ],
            growthRate: 0.7,
            supplyRefillRate: 0
        }
    };
};

export const getRouteConfig = () => {
    const testData = getTestData();
    return {
        data: testData,
        routePlanCargo: {
            cityOne: [{
                resource: testData.initiated.r1.resource,
                targetAmount: 4,
                actualAmount: 0
            }],
            cityTwo: [{
                resource: testData.initiated.r2.resource,
                targetAmount: 4,
                actualAmount: 0
            }]
        }
    };
};