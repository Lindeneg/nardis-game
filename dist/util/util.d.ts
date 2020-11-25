import { PlayerLevel } from '../types/types';
import { ResourceModel, TrainModel, UpgradeModel } from '../types/model';
/**
 * Generate a random number between two given whole numbers.
 *
 * @param {number} from - Number describing minimum value, default 1.
 * @param {number} to   - Number describing maximum value, default 10.
 *
 * @return {number}       Number between from and to constrains.
 */
export declare const randomNumber: (from?: number, to?: number) => number;
/**
 * Get PlayerLevel from number.
 *
 * @param {number}       n - Number to be matched with PlayerLevel.
 *
 * @return {PlayerLevel}     PlayerLevel found.
 */
export declare const getPlayerLevelFromNumber: (n: number) => PlayerLevel;
/**
 * Convert degrees to radians.
 *
 * @param {number}       degrees - Number with degrees to convert.
 *
 * @return {number}                Number with radians.
 */
export declare const degreesToRadians: (degrees: number) => number;
/**
 * Get a 32bit random Id.
 *
 * @return {string} String with generated Id.
 */
export declare const createId: () => string;
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
export declare const generateArrayOfRandomNames: (arraySize: number, nameMinLength: number, nameMaxLength: number, exclude: string[]) => string[];
/**
 * Generate low yield ResourceModels with random entries for
 * Resource value and Resource value volatility.
 *
 * @return {ResourceModel[]} Array with generated low yield ResourceModels.
 */
export declare const getLowYieldResourceModels: () => ResourceModel[];
/**
 * Generate medium yield ResourceModels with random entries for
 * Resource value and Resource value volatility.
 *
 * @return {ResourceModel[]} Array with generated medium yield ResourceModels.
 */
export declare const getMediumYieldResourceModels: () => ResourceModel[];
/**
 * Generate high yield ResourceModels with random entries for
 * Resource value and Resource value volatility.
 *
 * @return {ResourceModel[]} Array with generated high yield ResourceModels.
 */
export declare const getHighYieldResources: () => ResourceModel[];
/**
 * Generate TrainModels with random entries for cost, upkeep and speed.
 *
 * @return {TrainModel[]} Array with generated TrainModels.
 */
export declare const getTrainModels: () => TrainModel[];
/**
 * Get fixed UpgradeModels.
 *
 * @return {UpgradeModel[]} Array with UpgradeModels.
 */
export declare const getUpgradeModels: () => UpgradeModel[];
/**
 * Get the turn cost for a given distance.
 *
 * @return {number} Number describing the maximum range.
 */
export declare const getRangeTurnCost: (distance: number) => number;
