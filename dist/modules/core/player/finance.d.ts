import BaseComponent from '../../component/base-component';
import { FinanceHistory, FinanceTotal, HandleTurnInfo, ITurnable, FinanceType, PlayerData, StockHolding } from '../../../types/types';
/**
 * @constructor
 * @param {string}         name         - String with name.
 * @param {string}         playerId     - String with owning playerId.
 * @param {number}         gold         - Number with current gold.
 *
 * @param {FinanceHistory} history      - (optional) FinanceHistory object.
 * @param {FinanceTotal}   totalHistory - (optional) FinanceTotal object.
 * @param {number}         totalProfits - (optional) Number with total profits.
 * @param {number}         netWorth     - (optional) Number with net worth.
 * @param {StockHolding}   stock        - (optional) StockHolding object.
 * @param {string}         id           - (optional) String number describing id.
 */
export default class Finance extends BaseComponent implements ITurnable {
    private _playerId;
    private _gold;
    private _history;
    private _totalHistory;
    private _totalProfits;
    private _netWorth;
    private _stocks;
    constructor(name: string, playerId: string, gold: number, history?: FinanceHistory, totalHistory?: FinanceTotal, totalProfits?: number, netWorth?: number, stocks?: StockHolding, id?: string);
    getGold: () => number;
    getHistory: () => FinanceHistory;
    getTotalHistory: () => FinanceTotal;
    getTotalProfits: () => number;
    getNetWorth: () => number;
    getStocks: () => StockHolding;
    /**
     * Handle Finance events at each turn.
     *
     * @param  {HandleTurnInfo}  info - Object with relevant turn information.
     */
    handleTurn: (info: HandleTurnInfo) => void;
    /**
     * Add entry to expense object from the turn at hand.
     *
     * @param {FinanceType} type   - FinanceType of the expense.
     * @param {string}      id     - String with id of the expense.
     * @param {number}      amount - Number with amount of the expense.
     * @param {number}      value  - Number with value of the expense.
     */
    addToFinanceExpense: (type: FinanceType, id: string, amount: number, value: number) => void;
    /**
     * Remove entry from expense object.
     *
     * @param   {FinanceType} type   - FinanceType of the expense to be removed.
     * @param   {string}      id     - string with id of the expense to be removed.
     *
     * @returns {boolean}     True if removed else false.
     */
    removeFromFinanceExpense: (type: FinanceType, id: string) => boolean;
    /**
     * @returns {number} Number that describes the revenue in gold over the last three turns.
     */
    getAverageRevenue: () => number;
    /**
     * @returns {number} Number that describes the expense in gold over the last three turns.
     */
    getAverageExpense: () => number;
    /**
     * Add to gold from a deleted Route.
     *
     * @param {number} value - Number wih gold to recoup.
     */
    recoupDeletedRoute: (value: number) => void;
    /**
     * Update the net worth of the owning Player.
     *
     * @param {PlayerData} data - Object with PlayerData.
     */
    updateNetWorth: (data: PlayerData) => void;
    /**
     * Add Stock to StockHolding and handle expense.
     *
     * @param {string} playerId - String with id of the owning player of Stock to add.
     * @param {number} value    - BuyValue of the Stock.
     */
    buyStock: (playerId: string, value: number) => void;
    /**
     * Remove Stock from StockHolding and handle income.
     *
     * @param {string} playerId - String with id of the owning player of Stock to remove.
     * @param {number} value    - SellValue of the Stock.
     */
    sellStock: (playerId: string, value: number) => void;
    /**
     * @returns {string} String with JSON stringified property keys and values.
     */
    deconstruct: () => string;
    /**
     * Set nthTurn array of income and expense object to an empty array.
     */
    private handleStartTurn;
    /**
     * @param   {FinanceHistoryItem} historyItem - History object to average.
     *
     * @returns {number}             Number with average value of the history item.
     */
    private getAverageHistory;
    /**
     * Check if a Route has arrived and handle income accordingly.
     *
     * @param {Route}     route    - Route to be checked and handled.
     * @param {Upgrade[]} upgrades - Upgrades to be accounted for.
     */
    private handleRoute;
    /**
     * Get Train upkeep with Player upgrades taken into consideration.
     *
     * @param   {Train}     train    - Train to get upkeep from.
     * @param   {Upgrade[]} upgrades - Upgrades to be accounted for.
     *
     * @returns {number}    Number with the correct Train upkeep.
     */
    private getTrainUpkeep;
    /**
     * Add to gold count.
     *
     * @param {number} value - Number with gold to be added.
     */
    private addGold;
    /**
     * Remove gold from count.
     *
     * @param {number} value - number with gold to be subtracted.
     */
    private removeGold;
    /**
     * Get total value of the owning Player's current stock holdings.
     *
     * @param   {Stocks} stocks - Stocks object with all game Stock objects.
     *
     * @returns {number} Number with value of Stocks.
     */
    private getValueOfOwnedStock;
    /**
     * Add entry to FinanceTotal.
     *
     * @param {string} id    - String with id of the entry target.
     * @param {number} value - Number with value to add to target.
     */
    private addToTotalHistory;
    /**
     * Remove entry from FinanceTotal.
     *
     * @param {string} id    - String with id of the entry target.
     * @param {number} value - Number with value to remove from target.
     */
    private removeFromTotalHistory;
    /**
     * Add entry to any nthTurn object.
     *
     * @param {FinanceGeneralType} generalType - FinanceGeneralType of the entry.
     * @param {FinanceType}        type        - FinanceType of the expense.
     * @param {string}             id          - string with id of the expense.
     * @param {number}             amount      - number with amount of the expense.
     * @param {number}             value       - number with value of the expense.
     */
    private addNthTurnObject;
    /**
     * Shift each entry one place forward and then reset the nthTurn array.
     *
     * @param {FinanceHistoryItem} item - FinanceHistoryItem to be shifted.
     */
    private updateHistoryItemsOnStartedTurn;
    /**
     * @returns {FinanceHistory} FinanceHistory default starting state.
     */
    private getInitialHistoryState;
    /**
     * Get Finance instance from stringified JSON.
     *
     * @param   {string}     stringifiedJSON - String with information to be used.
     *
     * @returns {Finance}    Finance instance created from the model.
     */
    static createFromStringifiedJSON: (stringifiedJSON: string | object) => Finance;
}
