import BaseComponent from '../../component/base-component';
import { FinanceHistory, FinanceTotal, HandleTurnInfo, ITurnable, FinanceType } from '../../../types/types';
/**
 * @constructor
 * @param {string}         name         - string with name
 * @param {number}         gold         - number with current gold
 *
 * @param {FinanceHistory} history      - (optional) FinanceHistory object
 * @param {FinanceTotal}   totalHistory - (optional) FinanceTotal object
 * @param {number}         totalProfits - (optional) Number with total profits.
 * @param {number}         netWorth     - (optional) Number with net worth.
 * @param {string}         id           - (optional) string number describing id
 */
export default class Finance extends BaseComponent implements ITurnable {
    private _gold;
    private _history;
    private _totalHistory;
    private _totalProfits;
    private _netWorth;
    constructor(name: string, gold: number, history?: FinanceHistory, totalHistory?: FinanceTotal, totalProfits?: number, netWorth?: number, id?: string);
    getGold: () => number;
    getHistory: () => FinanceHistory;
    getTotalHistory: () => FinanceTotal;
    getTotalProfits: () => number;
    getNetWorth: () => number;
    /**
     * Handle Finance events at each turn
     *
     * @param  {HandleTurnInfo}  info - object with relevant turn information
     */
    handleTurn: (info: HandleTurnInfo) => void;
    /**
     * Add entry to expense object from the turn at hand
     *
     * @param {FinanceType} type   - FinanceType of the expense
     * @param {string}      id     - string with id of the expense
     * @param {number}      amount - number with amount of the expense
     * @param {number}      value  - number with value of the expense
     */
    addToFinanceExpense: (type: FinanceType, id: string, amount: number, value: number) => void;
    /**
     * Remove entry from expense object.
     *
     * @param {FinanceType} type   - FinanceType of the expense to be removed
     * @param {string}      id     - string with id of the expense to be removed
     *
     * @returns {boolean}            true if removed else false
     */
    removeFromFinanceExpense: (type: FinanceType, id: string) => boolean;
    /**
     * @returns {number} number that describes the revenue in gold over the last three turns
     */
    getAverageRevenue: () => number;
    /**
     * @returns {number} number that describes the expense in gold over the last three turns
     */
    getAverageExpense: () => number;
    /**
     * Add to gold from a deleted Route.
     *
     * @param {number} value - Number wih gold to recoup.
     *
     */
    recoupDeletedRoute: (value: number) => void;
    /**
     * @return {string} String with JSON stringified property keys and values.
     */
    deconstruct: () => string;
    /**
     * Set nthTurn array of income and expense object to an empty array
     */
    private handleStartTurn;
    /**
     * @param {FinanceHistoryItem} historyItem history object to average
     *
     * @returns {number}           number that describes the average value of the given object
     */
    private getAverageHistory;
    /**
     * Check if a Route has arrived and handle income accordingly
     *
     * @param {Route}     route    - Route to be checked and handled
     * @param {Upgrade[]} upgrades - Upgrades to be accounted for
     */
    private handleRoute;
    /**
     * Get Train upkeep with Player upgrades taken into consideration
     *
     * @param {Train}     train    - Train to get upkeep from
     * @param {Upgrade[]} upgrades - Upgrades to be accounted for
     *
     * @return {number} - number with the correct Train upkeep
     */
    private getTrainUpkeep;
    /**
     * Add to gold count
     *
     * @param {number} value - number with gold to be added
     */
    private addGold;
    /**
     * Update net worth
     * // TODO add stocks
     */
    private updateNetWorth;
    /**
     * Remove gold from count
     *
     * @param {number} value - number with gold to be subtracted
     */
    private removeGold;
    /**
     * Add entry to FinanceTotal.
     *
     * @param {string} id    - string with id of the entry target
     * @param {number} value - number with value to add to target
     */
    private addToTotalHistory;
    /**
     * Remove entry from FinanceTotal.
     *
     * @param {string} id    - string with id of the entry target
     * @param {number} value - number with value to remove from target
     */
    private removeFromTotalHistory;
    /**
     * Add entry to any nthTurn object
     *
     * @param {FinanceGeneralType} generalType - FinanceGeneralType of the entry
     * @param {FinanceType}        type   - FinanceType of the expense
     * @param {string}             id     - string with id of the expense
     * @param {number}             amount - number with amount of the expense
     * @param {number}             value  - number with value of the expense
     */
    private addNthTurnObject;
    /**
     * Shift each entry one place forward and then reset the nthTurn array
     *
     * @param {FinanceHistoryItem} item - FinanceHistoryItem to be shifted
     */
    private updateHistoryItemsOnStartedTurn;
    /**
     * @returns {FinanceHistory} FinanceHistory default starting state
     */
    private getInitialHistoryState;
    /**
     * Get Finance instance from stringified JSON.
     *
     * @param {string}     stringifiedJSON - string with information to be used
     *
     * @return {Finance}                     Finance instance created from the model
     */
    static createFromStringifiedJSON: (stringifiedJSON: string | object) => Finance;
}
