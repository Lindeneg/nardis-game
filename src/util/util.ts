import {
    playerLevelMapping,
    rangeCost,
    ID_CHARS,
    ID_LENGTH,
    VOWELS,
    CONSONANTS
} from '../util/constants';
import {
    PlayerLevel
} from '../types/types';
import {
    ResourceModel,
    TrainModel,
    UpgradeModel
} from '../types/model';
import {
    upgradeData,
    trainData,
    highYieldData,
    mediumYieldData,
    lowYieldData
} from '../data/preparedData';


/**
 * Get an array of either vowels or consonants.
 * 
 * @return {string[]} Array string with names.
 */

const getRandomLetterArray = (): string[] => randomNumber() > 5 ? VOWELS : CONSONANTS;

/**
 * Generate a value volatility between two given whole numbers.
 * 
 * @param {number} min - Number describing minimum volatility
 * @param {number} max - Number describing maximum volatility
 * 
 * @return {number}      Number describing random volatility.
 */

const getRandomValueVolatility = (min: number, max: number): number => randomNumber(min, max) / 10;

/**
 * Generate a random name with length between two given whole numbers.
 * 
 * @param {number} min - Number describing minimum name length.
 * @param {number} max - Number describing maximum name length.
 * 
 * @return {string}      String with generated name.
 */

const generateName = (min: number, max: number): string => {
    let name: string = '';
    for (let _ = 0; _ < randomNumber(min, max); _++) {
        const arr: string[] = getRandomLetterArray();
        if (name.length < 1) {
            name += arr[randomNumber(0, arr.length - 1)].toUpperCase();
        } else {
            if (CONSONANTS.indexOf(name[name.length - 1].toLowerCase()) > -1) {
                name += VOWELS[randomNumber(0, VOWELS.length - 1)];
            } else {
                name += arr[randomNumber(0, arr.length - 1)];
            }
        }
    }
    return name;
}

/**
 * Check if a variable is defined
 * 
 * @param  {any} target - Target to check if defined.
 * 
 * @return {boolean}      True if target defined else false.
 */

export const isDefined = (target: any): boolean => typeof target !== 'undefined';

/**
 * Generate a random number between two given whole numbers.
 * 
 * @param {number} from - Number describing minimum value, default 1.
 * @param {number} to   - Number describing maximum value, default 10.
 * 
 * @return {number}       Number between from and to constrains.
 */

export const randomNumber = (from: number = 1, to: number = 10): number => Math.floor(Math.random() * (to - from + 1) + from);

/**
 * Get PlayerLevel from number.
 * 
 * @param {number}       n - Number to be matched with PlayerLevel.
 * 
 * @return {PlayerLevel}     PlayerLevel found.
 */

export const getPlayerLevelFromNumber = (n: number): PlayerLevel => {
    if (n >= 0 && n < playerLevelMapping.length) {
        return playerLevelMapping[n];
    }
    return PlayerLevel.None;
}

/**
 * Convert degrees to radians.
 * 
 * @param {number}       degrees - Number with degrees to convert.
 * 
 * @return {number}                Number with radians.
 */

export const degreesToRadians = (degrees: number): number => {
    return (degrees * Math.PI) / 180;;
}

/**
 * Get a 32bit random Id.
 * 
 * @return {string} String with generated Id.
 */

export const createId = (): string => {
    let result = '';
    for (let _ = 0; _ < ID_LENGTH; _++) {
        result += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length));
    }
    return result;
}

/**
 * Get array of random names.
 * 
 * @param {number}    arraySize     - Number with desired size of the returned array.
 * @param {number}    nameMinLength - Number with minimum name length.
 * @param {number}    nameMaxLength - Number with maximum name length.
 * @param {string[]}  exclude       - Array of strings with names to exclude.
 * 
 * @return {string[]}                 Array of strings with generated names.
 */

export const generateArrayOfRandomNames = (
    arraySize: number,
    nameMinLength: number,
    nameMaxLength: number,
    exclude: string[]
): string[] => {
    const result: string[] = [];
    for (let _ = 0; _ < arraySize; _++) {
        while (true) {
            let name = generateName(nameMinLength, nameMaxLength);
            if (exclude.indexOf(name) <= -1) {
                result.push(name);
                exclude.push();
                break;
            }
        }
    }
    return result;
}

/**
 * Generate low yield ResourceModels with random entries for
 * Resource value and Resource value volatility.
 * 
 * @return {ResourceModel[]} Array with generated low yield ResourceModels.
 */

export const getLowYieldResourceModels = (): ResourceModel[] => lowYieldData.map(e => {
    return {
        ...e,
        value: randomNumber(...e.value),
        valueVolatility: getRandomValueVolatility(...e.valueVolatility)
    };
});

/**
 * Generate medium yield ResourceModels with random entries for
 * Resource value and Resource value volatility.
 * 
 * @return {ResourceModel[]} Array with generated medium yield ResourceModels.
 */

export const getMediumYieldResourceModels = (): ResourceModel[] => mediumYieldData.map(e => {
    return {
        ...e,
        value: randomNumber(...e.value),
        valueVolatility: randomNumber(...e.valueVolatility)
    };
});

/**
 * Generate high yield ResourceModels with random entries for
 * Resource value and Resource value volatility.
 * 
 * @return {ResourceModel[]} Array with generated high yield ResourceModels.
 */

export const getHighYieldResources = (): ResourceModel[] => highYieldData.map(e => {
    return {
        ...e,
        value: randomNumber(...e.value),
        valueVolatility: getRandomValueVolatility(...e.valueVolatility)
    };
});

/**
 * Generate TrainModels with random entries for cost, upkeep and speed.
 * 
 * @return {TrainModel[]} Array with generated TrainModels.
 */

export const getTrainModels = (): TrainModel[] => trainData.map(e => {
    return {
        ...e,
        cost: randomNumber(...e.cost),
        upkeep: randomNumber(...e.upkeep),
        speed: randomNumber(...e.speed),
        cargoSpace: randomNumber(...e.cargoSpace)
    };
});


/**
 * Get fixed UpgradeModels.
 * 
 * @return {UpgradeModel[]} Array with UpgradeModels.
 */

export const getUpgradeModels = (): UpgradeModel[] => upgradeData;


/**
 * Get the turn cost for a given distance.
 * 
 * @return {number} Number describing the maximum range.
 */

export const getRangeTurnCost = (distance: number): number => {
    const turnKey: string = Object.keys(rangeCost).filter(key => {
        const [lower, upper] = key.split(',');
        return parseInt(lower) >= distance && distance < parseInt(upper);
    })[0];
    return !turnKey ? rangeCost['260,10000'] : rangeCost[turnKey];
}
