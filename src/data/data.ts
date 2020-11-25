import { 
    ResourceModel,
    TrainModel,
    CityModel,
    CityResourceModel,
    RawDataModel
 } from '../types/model';
 import { 
    randomNumber, 
    generateArrayOfRandomNames,
    getLowYieldResourceModels,
    getMediumYieldResourceModels,
    getHighYieldResources,
    getTrainModels,
    getUpgradeModels
} from '../util/util';
 import {
    possibleCityCoords,
    resourcePerSize,
    resourcesPerSize,
    citySizes
} from '../util/constants';


// array for randomly generated names to avoid duplicates
const excluded: string[] = [];


const trainModels: TrainModel[] = getTrainModels();
const lowResources: ResourceModel[] = getLowYieldResourceModels();
const mediumResources: ResourceModel[] = getMediumYieldResourceModels();
const highResources: ResourceModel[] = getHighYieldResources();

// convert a ResourceModel to a CityResourceModel
const getCityResourceModel = (resource: ResourceModel, citySize: number): CityResourceModel => {
    const amount: number = randomNumber(...resourcePerSize[citySize - 1]);
    return {
        name: resource.name,
        amount: amount,
        available: amount
    };
}

// Generate a ResourceModel based upon the City size
const rollResource = (resources: CityResourceModel[], citySize: number, currentResources: CityResourceModel[]): ResourceModel => {
    const highResource: boolean = citySize >= 5 && randomNumber() <= citySize;
    let resource: ResourceModel = null;
    if (highResource) {
        resource = highResources[randomNumber(0, highResources.length - 1)];
    } else {
        resource = mediumResources[randomNumber(0, mediumResources.length - 1)];
    }
    if (resources.filter(e => e.name === resource.name).length > 0 || currentResources.filter(e => e.name === resource.name).length > 0) {
        return rollResource(resources, citySize, currentResources);
    }
    return resource;
}

// Return a resource and an amount of stock, amount is -1 if type is demand
const getCityResources = (citySize: number, isDemand: boolean, currentResources: CityResourceModel[] = []): CityResourceModel[] => {
    const limit: number = resourcesPerSize[citySize - 1];
    const resources: CityResourceModel[] = [...lowResources.map(e => {
        return isDemand ? {name: e.name, amount: -1, available: -1} : getCityResourceModel(e, citySize);
    })];
    const diff: number = limit - resources.length;
    if (diff > 0) {
        for (let _ = 0; _ < diff; _++) {
            const resource: ResourceModel = rollResource(resources, citySize, currentResources);
            const cityResourceModel: CityResourceModel = isDemand ? {name: resource.name, amount: -1, available: -1} : getCityResourceModel(resource, citySize);
            resources.push(cityResourceModel);
        }
    }
    return resources;
}

const generateResources = (): ResourceModel[] => [...lowResources, ...mediumResources, ...highResources];

const generateCities = (): CityModel[] => {
    const names: string[] = generateArrayOfRandomNames(possibleCityCoords.length, 4, 7, excluded);
    return names.map(name => {
        const [phi, lambda]: [number, number] = possibleCityCoords.splice(randomNumber(0, possibleCityCoords.length - 1), 1)[0];
        const size: number = citySizes.splice(randomNumber(0, citySizes.length - 1), 1)[0];
        const supply = getCityResources(size, false);
        const demand = getCityResources(size, true, supply);
        return {
            name: name,
            size: size,
            phi: phi,
            lambda: lambda,
            supply: supply,
            demand: demand,
            growthRate: randomNumber(1, 6) / 10,
            supplyRefillRate: randomNumber(2, 4)
        };
    });
}

const generateTrains = (): TrainModel[] => {
    const names: string[] = generateArrayOfRandomNames(trainModels.length, 3, 5, excluded);
    return trainModels.map(e => {
        return {
            ...e,
            name: names.splice(randomNumber(0, names.length - 1), 1)[0]
        };
    });
}

export const generateData = (): RawDataModel => {
    return {
        cities: generateCities(),
        trains: generateTrains(),
        resources: generateResources(),
        upgrades: getUpgradeModels()
    };
}