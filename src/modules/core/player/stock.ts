import BaseComponent from "../../component/base-component";
import Finance from "../../core/player/finance";
import { StockSupply, ValueHistory } from "../../../types/types";
import { MAX_VALUE_HISTORY_LENGTH, stockConstant } from "../../../util/constants";
import { isDefined } from "../../../util/util";


/**
 * @constructor
 * @param {string}         name           - Name of the Stock instance.
 * @param {string}         owningPlayerId - String with Id of owning Player.
 * 
 * @param {number}         value          - (optional) Number with Stock sell value.
 * @param {ValueHistory[]} valueHistory   - (optional) Object with Stock ValueHistory.
 * @param {StockSupply}    supply         - (optional) Object with StockSupply.
 * @param {string}         id             - (optional) String number describing id.
 */

export default class Stock extends BaseComponent {

    private _owningPlayerId: string;
    private _value         : number;
    private _valueHistory  : ValueHistory[];
    private _supply        : StockSupply;

    constructor(
        name               : string,
        owningPlayerId     : string,
        value             ?: number,
        valueHistory      ?: ValueHistory[],
        supply            ?: StockSupply,
        id                ?: string
    ) {
        super(name, id);

        this._owningPlayerId = owningPlayerId;

        this._value          = isDefined(value) ? value : Math.floor(stockConstant.startingShares * stockConstant.multipliers.stockHolder);
        this._valueHistory   = isDefined(valueHistory) ? valueHistory : [{
            value: this._value,
            turn: 1
        }];

        this._supply         = isDefined(supply) ? supply : {
            [this._owningPlayerId]: stockConstant.startingShares
        };
    }

    public getBuyValue  = (): number => Math.floor(this._value * stockConstant.multipliers.stockBuy);
    public getSellValue = (): number => this._value;

    /**
     * Buy Stock to the specified playerId.
     * 
     * @param   {string}  playerId - String with playerId to buy Stock to. 
     * 
     * @returns {boolean} True if Stock was bought else false.
     */

    public buyStock = (playerId: string): boolean => {
        if (this.currentAmountOfStockHolders() + 1 <= stockConstant.maxStockAmount) {
            if (!isDefined(this._supply[playerId])) {
                this._supply[playerId] = 1;
            } else {
                this._supply[playerId] += 1;
            }
            return true;
        }
        return false;
    }

    /**
     * Sell Stock from the specified playerId.
     * 
     * @param   {string}  playerId - String with playerId to sell Stock from. 
     * 
     * @returns {boolean} True if Stock was sold else false.
     */

    public sellStock = (playerId: string): boolean => {
        if (isDefined(this._supply[playerId]) && this._supply[playerId] > 0) {
            this._supply[playerId] -= 1;
            return true;
        }   
        return false;
    }

    /**
     * Get total amount of current Stock holders and their respective quantities.
     * 
     * @returns {number} Number with total amount of owned Stock.
     */

    public currentAmountOfStockHolders = (): number => (
        Object.keys(this._supply).map((key: string): number => (
            this._supply[key]
        )).reduce((a: number, b: number): number => a + b, 0)
    )

    /**
     * Update base value of Stock.
     * 
     * @param {Finance} finance - Finance instance of the owning Player. 
     * @param {number}  routes  - Number with sum of Route and Queue length.
     * @param {number}  turn    - Number with current turn.
     */

    public updateValue = (
        finance: Finance,
        routes : number,
        turn   : number
    ): void => {
        const newValue: number = (
            Math.floor(routes * stockConstant.multipliers.routeLength) +
            Math.floor(finance.getAverageRevenue() / stockConstant.divisors.avgRevenue) +
            Math.floor(this.currentAmountOfStockHolders() * stockConstant.multipliers.stockHolder) 
        ) + Math.floor(finance.getTotalProfits() / stockConstant.divisors.totalProfits);
        if (newValue !== this._value) {
            this.updateValueHistory(newValue, turn);
            this._value = newValue;
        }
    }

    /**
     * @returns {string} String with JSON stringified property keys and values.
     */

    public deconstruct = (): string => JSON.stringify(this);


    /**
     * Update ValueHistory. If ValueHistory is equal or greater than the default max length,
     * remove the first entry and then push the new value as the last entry.
     * 
     * @param {number} value - Number with new value of the Stock. 
     * @param {number} turn  - Number with current turn.
     */

    private updateValueHistory = (value: number, turn: number): void => {
        if (this._valueHistory.length >= MAX_VALUE_HISTORY_LENGTH) {
            this._valueHistory.shift();
        }
        this._valueHistory.push({
            value,
            turn
        });
    }

    /**
     * Get Stock instance from stringified JSON.
     * 
     * @param   {string} stringifiedJSON - string with information to be used
     * 
     * @returns {Stock}  Stock instance created from the model
     */

    public static createFromStringifiedJSON = (stringifiedJSON: string | object): Stock => {
        const parsedJSON = typeof stringifiedJSON === 'string' ? JSON.parse(stringifiedJSON) : stringifiedJSON;
        return new Stock(
            parsedJSON.name,
            parsedJSON._owningPlayerId,
            parsedJSON._value,
            parsedJSON._valueHistory,
            parsedJSON._supply,
            parsedJSON.id,
        );
    }

}