import BaseComponent from '../component/base-component';
import { 
    ResourceModel 
} from '../../types/model';
import { 
    HandleTurnInfo, 
    ResourceValueHistory, 
    ITurnable 
} from '../../types/types';
import { 
    randomNumber 
} from '../../util/util';
import { 
    RESOURCE_VALUE_DECISION_TARGET 
} from '../../util/constants';


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

    private _value             : number;
    private _weight            : number;
    private _minValue          : number;
    private _maxValue          : number;
    private _valueVolatility   : number;
    private _valueChangeDecider: number;
    private _valueHistory      : ResourceValueHistory[];

    constructor(
            name               : string,
            weight             : number,
            value              : number,
            minValue           : number,
            maxValue           : number,
            valueVolatility    : number,
            valueChangeDecider?: number,
            valueHistory      ?: ResourceValueHistory[],
            id                ?: string
    ) {
        super(name, id);

        this._value              = value;
        this._weight             = weight;
        this._minValue           = minValue;
        this._maxValue           = maxValue;
        this._valueVolatility    = valueVolatility;
        this._valueChangeDecider = valueChangeDecider ? valueChangeDecider : 0;
        this._valueHistory       = valueHistory       ? valueHistory       : [{
            value: this._value,
            turn: 1
        }];
    }

    public getValue           = (): number                 => this._value;
    public getMinValue        = (): number                 => this._minValue;
    public getMaxValue        = (): number                 => this._maxValue;
    public getValueVolatility = (): number                 => this._valueVolatility;
    public getChangeDecider   = (): number                 => this._valueChangeDecider;
    public getWeight          = (): number                 => this._weight;
    public getValueHistory    = (): ResourceValueHistory[] => this._valueHistory;

    /**
     * Handle Resource events by checking the decision variable. If the decision is greater than the decision target,
     * then set a new value and reset the decider, else increment the decision variable.
     * 
     * @param  {HandleTurnInfo}  info - Object with relevant turn information.
     */

    public handleTurn = (info: HandleTurnInfo) => {
        if (this._valueChangeDecider + this._valueVolatility >= RESOURCE_VALUE_DECISION_TARGET && this.setNewValue(this.getNewValue(), info.turn)) {
            this._valueChangeDecider = 0;
        } else {
            this.updateValueChangeDecider();
        }
    }

    /** 
     * @return {string} String with JSON stringified property keys and values.
    */
   
   public deconstruct = (): string => JSON.stringify(this)

    /**
     * Set a new value for the resource.
     * 
     * @param {number}    value - Number with new value to be used.
     * @param {number}    turn  - Number with turn count.
     * 
     * @return {boolean}          True if value was set else false. 
     */

    private setNewValue = (value: number, turn: number): boolean => {
        /* if the value last entry in the history object is equal
           to the value trying to be set, do not do anything */
        if (this._valueHistory[this._valueHistory.length - 1].value === value) {
            return false;
        }
        this._valueHistory.push({
            value: value,
            turn: turn
        });
        this._value = value;
        return true;
    }

    /**
     * Generates a new random value based upon the current value and the Resource value volatility.
     * 
     * @return {number} Number with new value.
     */

    private getNewValue = (): number => {
        const maxSign: number = randomNumber(0, 9) <= Math.round(this._valueVolatility * 10) ? -1 : 1; 
        const sign: number = randomNumber(0, 9) >= 5 ? -1 : 1;
        let newValue: number = null;
        if (this._value >= this._maxValue) {
            let tmp = this._value + (randomNumber(1, 3) * maxSign);
            newValue = tmp >= this._maxValue ? this._maxValue : tmp;
        } else {
            let tmp = this._value + (randomNumber(2, 5) * sign);
            if (tmp >= this._maxValue) {
                newValue = this._maxValue;
            } else if (tmp <= this._minValue) {
                newValue = this._minValue;
            } else {
                newValue = tmp;
            }
        }
        return newValue;
    }

    /**
     * Increment valueChangeDecider with a pseudorandom value.
     */

    private updateValueChangeDecider = (): void => {
        this._valueChangeDecider += randomNumber(1, Math.round(this._valueVolatility * 10)) / 10;
    }

    /**
     * Get Resource instance from a ResourceModel.
     * 
     * @param {ResourceModel}  model - ResourceModel to be used.
     * 
     * @return {Resource}              Resource instance created from the model.
     */

    public static createFromModel = (model: ResourceModel): Resource => {
        return new Resource(
            model.name,
            model.weight,
            model.value,
            model.minValue,
            model.maxValue,
            model.valueVolatility
        );
    }

    /**
     * Get Resource instance from stringified JSON.
     * 
     * @param {string}    stringifiedJSON - String with information to be used.
     * 
     * @return {Resource}                   Resource instance created from the string.
     */

    public static createFromStringifiedJSON = (stringifiedJSON: string): Resource => {
        const parsedJSON: any = JSON.parse(stringifiedJSON);
        return new Resource(
            parsedJSON.name,
            parsedJSON._weight,
            parsedJSON._value,
            parsedJSON._minValue,
            parsedJSON._maxValue,
            parsedJSON._valueVolatility,
            parsedJSON._valueChangeDecider,
            parsedJSON._valueHistory,
            parsedJSON.id
        );
    }
}