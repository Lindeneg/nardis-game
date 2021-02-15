import { Finance } from "../../..";
import { StockSupply, ValueHistory } from "../../../types/types";
import BaseComponent from "../../component/base-component";
export default class Stock extends BaseComponent {
    private _owningPlayerId;
    private _value;
    private _valueHistory;
    private _supply;
    constructor(name: string, owningPlayerId: string, value?: number, valueHistory?: ValueHistory[], supply?: StockSupply, id?: string);
    getBuyValue: () => number;
    getSellValue: () => number;
    buyStock: (playerId: string) => boolean;
    sellStock: (playerId: string) => boolean;
    currentAmountOfStockHolders: () => number;
    setValue: (value: number) => void;
    updateValue: (finance: Finance, routes: number, turn: number) => void;
    /**
     *
     */
    deconstruct: () => string;
    /**
     *
     * @param value
     * @param turn
     */
    private updateValueHistory;
    /**
     * Get Stock instance from stringified JSON.
     *
     * @param {string}     stringifiedJSON - string with information to be used
     *
     * @return {Stock}                     Stock instance created from the model
     */
    static createFromStringifiedJSON: (stringifiedJSON: string | object) => Stock;
}
