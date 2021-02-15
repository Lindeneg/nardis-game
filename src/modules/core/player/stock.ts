import { Finance } from "../../..";
import { StockSupply, ValueHistory } from "../../../types/types";
import { MAX_VALUE_HISTORY_LENGTH, stockConstant } from "../../../util/constants";
import { isDefined } from "../../../util/util";
import BaseComponent from "../../component/base-component";


export default class Stock extends BaseComponent {

    private _owningPlayerId: string;
    private _value: number;
    private _valueHistory: ValueHistory[];
    private _supply: StockSupply;

    constructor(
        name: string,
        owningPlayerId: string,
        value?: number,
        valueHistory?: ValueHistory[],
        supply?: StockSupply,
        id?: string
    ) {
        super(name, id);

        this._owningPlayerId = owningPlayerId;

        this._value = isDefined(value) ? value : Math.floor(stockConstant.startingShares * stockConstant.multipliers.stockHolder);
        this._valueHistory = isDefined(valueHistory) ? valueHistory : [{
            value: this._value,
            turn: 1
        }];

        this._supply = isDefined(supply) ? supply : {
            [this._owningPlayerId]: stockConstant.startingShares
        };
    }

    public getBuyValue  = (): number => Math.floor(this._value * stockConstant.multipliers.stockBuy);
    public getSellValue = (): number => this._value;

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

    public sellStock = (playerId: string): boolean => {
        if (isDefined(this._supply[playerId]) && this._supply[playerId] > 0) {
            this._supply[playerId] -= 1;
            return true;
        }   
        return false;
    }

    public currentAmountOfStockHolders = (): number => (
        Object.keys(this._supply).map((key: string): number => (
            this._supply[key]
        )).reduce((a: number, b: number): number => a + b, 0)
    )

    public setValue = (value: number): void => {
        this._value = value;
    }

    public updateValue = (
        finance: Finance,
        routes: number,
        turn: number
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
     * 
     */
    public deconstruct = (): string => JSON.stringify(this);


    /**
     * 
     * @param value 
     * @param turn 
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
     * @param {string}     stringifiedJSON - string with information to be used
     * 
     * @return {Stock}                     Stock instance created from the model
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