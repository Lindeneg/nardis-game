import BaseComponent from "../../component/base-component";
import Finance from "../../core/player/finance";
import { StockSupply, ValueHistory } from "../../../types/types";
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
    private _owningPlayerId;
    private _value;
    private _valueHistory;
    private _supply;
    constructor(name: string, owningPlayerId: string, value?: number, valueHistory?: ValueHistory[], supply?: StockSupply, id?: string);
    getBuyValue: () => number;
    getSellValue: () => number;
    getSupply: () => StockSupply;
    getHistory: () => ValueHistory[];
    /**
     * Buy Stock to the specified playerId.
     *
     * @param   {string}  playerId - String with playerId to buy Stock to.
     *
     * @returns {boolean} True if Stock was bought else false.
     */
    buyStock: (playerId: string) => boolean;
    /**
     * Sell Stock from the specified playerId.
     *
     * @param   {string}  playerId - String with playerId to sell Stock from.
     *
     * @returns {boolean} True if Stock was sold else false.
     */
    sellStock: (playerId: string) => boolean;
    /**
     * Get total amount of current Stock holders and their respective quantities.
     *
     * @returns {number} Number with total amount of owned Stock.
     */
    currentAmountOfStockHolders: () => number;
    /**
     * Update base value of Stock.
     *
     * @param {Finance} finance - Finance instance of the owning Player.
     * @param {number}  routes  - Number with sum of Route and Queue length.
     * @param {number}  turn    - Number with current turn.
     */
    updateValue: (finance: Finance, routes: number, turn: number) => void;
    /**
     * Check if a Player holds any Stock.
     *
     * @param   {string}  playerId - String with player id to check.
     *
     * @returns {boolean} True if Player is Stock holder else false.
     *
     */
    isStockHolder: (playerId: string) => boolean;
    /**
     * @returns {string} String with JSON stringified property keys and values.
     */
    deconstruct: () => string;
    /**
     * Update Stock value and ValueHistory.
     *
     * @param {number} value - Number with new value of the Stock.
     * @param {number} turn  - Number with current turn.
     */
    private updateValueHistory;
    /**
     * Get Stock instance from stringified JSON.
     *
     * @param   {string} stringifiedJSON - string with information to be used
     *
     * @returns {Stock}  Stock instance created from the model
     */
    static createFromStringifiedJSON: (stringifiedJSON: string | object) => Stock;
}
