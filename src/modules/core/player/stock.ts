import BaseComponent from "../../component/base-component";
import Finance from "../../core/player/finance";
import { BuyOutValue, StockSupply, ValueHistory } from "../../../types/types";
import { stockConstant } from "../../../util/constants";
import { isDefined } from "../../../util/util";


/**
 * @constructor
 * @param {string}         name           - Name of the Stock instance.
 * @param {string}         owningPlayerId - String with Id of owning Player.
 * 
 * @param {number}         value          - (optional) Number with Stock sell value.
 * @param {ValueHistory[]} valueHistory   - (optional) Object with Stock ValueHistory.
 * @param {StockSupply}    supply         - (optional) Object with StockSupply.
 * @param {boolean}        isActive       - (optional) Boolean with active specifier.
 * @param {string}         id             - (optional) String number describing id.
 */

export default class Stock extends BaseComponent {

    readonly owningPlayerId: string;

    private _value         : number;
    private _valueHistory  : ValueHistory[];
    private _supply        : StockSupply;
    private _isActive      : boolean;

    constructor(
        name               : string,
        owningPlayerId     : string,
        value             ?: number,
        valueHistory      ?: ValueHistory[],
        supply            ?: StockSupply,
        isActive          ?: boolean,
        id                ?: string
    ) {
        super(name, id);

        this.owningPlayerId = owningPlayerId;

        this._value          = isDefined(value) ? value : Math.floor(stockConstant.startingShares * stockConstant.multipliers.stockHolder) + stockConstant.baseValue;
        this._valueHistory   = isDefined(valueHistory) ? valueHistory : [{
            value: this._value,
            turn: 1
        }];

        this._supply         = isDefined(supply) ? supply : {
            [this.owningPlayerId]: stockConstant.startingShares
        };

        this._isActive       = isDefined(isActive) ? isActive : true;
    }

    public getBuyValue  = (): number         => Math.floor(this._value * stockConstant.multipliers.stockBuy);
    public getSellValue = (): number         => this._value;
    public getSupply    = (): StockSupply    => this._supply;
    public getHistory   = (): ValueHistory[] => this._valueHistory;
    public isActive     = (): boolean        => this._isActive;

    /**
     * Set Stock as inactive.
     * 
     * @param {number} turn - Number with current turn at hand.
     */
    
    public setInactive  = (turn: number): void => {
        this._value = 0;
        this._valueHistory.push({turn, value: this._value});
        this._isActive = false;
    }

    /**
     * Get buyout value for all Stock holders, if there's no Stock supply left.
     * 
     * @returns {BuyOutValue[]} Array of BuyOutValue objects.
     */

    public getBuyOutValues = (): BuyOutValue[] => {
        const buyOutValues: BuyOutValue[] = [];
        if (this.currentAmountOfStockHolders() >= stockConstant.maxStockAmount) {
            buyOutValues.push(...Object.keys(this._supply).map((id: string): BuyOutValue => ({
                totalValue: Math.floor(this._supply[id] * this._value),
                shares: this._supply[id],
                id
            })));
        }
        return buyOutValues;
    }

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
     * @param   {number}  amount   - (optional) Number with share amount to sell.
     * 
     * @returns {boolean} True if Stock was sold else false.
     */

    public sellStock = (playerId: string, amount: number = 1): boolean => {
        if (isDefined(this._supply[playerId]) && this._supply[playerId] - amount >= 0) {
            this._supply[playerId] -= amount;
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
        if (this.isActive()) {
            const newValue: number = (
                Math.floor(routes * stockConstant.multipliers.routeLength) +
                Math.floor(finance.getAverageRevenue() / stockConstant.divisors.avgRevenue) +
                Math.floor(this.currentAmountOfStockHolders() * stockConstant.multipliers.stockHolder) 
            ) + (Math.floor(finance.getTotalProfits() / stockConstant.divisors.totalProfits) + stockConstant.baseValue);
            if (newValue !== this._value) {
                this.updateValueHistory(newValue, turn);
                this._value = newValue;
            }
        }
    }

    /**
     * Check if a Player holds any Stock.
     * 
     * @param   {string}  playerId - String with player id to check.
     * 
     * @returns {boolean} True if Player is Stock holder else false.
     * 
     */

    public isStockHolder = (playerId: string): boolean => (
        isDefined(this._supply[playerId]) && this._supply[playerId] > 0 
    )

    /**
     * @returns {string} String with JSON stringified property keys and values.
     */

    public deconstruct = (): string => JSON.stringify(this);


    /**
     * Update Stock value and ValueHistory.
     * 
     * @param {number} value - Number with new value of the Stock. 
     * @param {number} turn  - Number with current turn.
     */

    private updateValueHistory = (value: number, turn: number): void => {
        if (turn > 1 && this._valueHistory.length > 0 && this._valueHistory[this._valueHistory.length - 1].turn === turn) {
                this._valueHistory[this._valueHistory.length - 1].value = value;
        } else if (turn > 1) {
            this._valueHistory.push({
                value,
                turn
            });
        }
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
            parsedJSON.owningPlayerId,
            parsedJSON._value,
            parsedJSON._valueHistory,
            parsedJSON._supply,
            parsedJSON._isActive,
            parsedJSON.id,
        );
    }

}