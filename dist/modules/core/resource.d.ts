import BaseComponent from '../component/base-component';
import { ResourceModel } from '../../types/model';
import { HandleTurnInfo, ResourceValueHistory, ITurnable } from '../../types/types';
/**
 * @constructor
 * @param {string}                 name               - String with name.
 * @param {number}                 weight             - Number with weight in units.
 * @param {number}                 value              - Number with value in gold.
 * @param {number}                 minValue           - Number with minimum value in gold.
 * @param {number}                 maxValue           - Number with maximum value in gold.
 * @param {number}                 valueVolatility    - Number with value volatility.
 *
 * @param {number}                 valueChangeDecider - (optional) Number with value decider.
 * @param {ResourceValueHistory[]} valueHistory       - (optional) Object with history.
 * @param {string}                 id                 - (optional) String number describing id.
 */
export default class Resource extends BaseComponent implements ITurnable {
    private _value;
    private _weight;
    private _minValue;
    private _maxValue;
    private _valueVolatility;
    private _valueChangeDecider;
    private _valueHistory;
    constructor(name: string, weight: number, value: number, minValue: number, maxValue: number, valueVolatility: number, valueChangeDecider?: number, valueHistory?: ResourceValueHistory[], id?: string);
    getValue: () => number;
    getMinValue: () => number;
    getMaxValue: () => number;
    getValueVolatility: () => number;
    getChangeDecider: () => number;
    getWeight: () => number;
    getValueHistory: () => ResourceValueHistory[];
    /**
     * Handle Resource events by checking the decision variable. If the decision is greater than the decision target,
     * then set a new value and reset the decider, else increment the decision variable.
     *
     * @param  {HandleTurnInfo}  info - Object with relevant turn information.
     */
    handleTurn: (info: HandleTurnInfo) => void;
    /**
     * @return {string} String with JSON stringified property keys and values.
    */
    deconstruct: () => string;
    /**
     * Set a new value for the resource.
     *
     * @param {number}    value - Number with new value to be used.
     * @param {number}    turn  - Number with turn count.
     *
     * @return {boolean}          True if value was set else false.
     */
    private setNewValue;
    /**
     * Generates a new random value based upon the current value and the Resource value volatility.
     *
     * @return {number} Number with new value.
     */
    private getNewValue;
    /**
     * Increment valueChangeDecider with a pseudorandom value.
     */
    private updateValueChangeDecider;
    /**
     * Get Resource instance from a ResourceModel.
     *
     * @param {ResourceModel}  model - ResourceModel to be used.
     *
     * @return {Resource}              Resource instance created from the model.
     */
    static createFromModel: (model: ResourceModel) => Resource;
    /**
     * Get Resource instance from stringified JSON.
     *
     * @param {string}    stringifiedJSON - String with information to be used.
     *
     * @return {Resource}                   Resource instance created from the string.
     */
    static createFromStringifiedJSON: (stringifiedJSON: string) => Resource;
}
