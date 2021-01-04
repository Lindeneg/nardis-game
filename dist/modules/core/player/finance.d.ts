import BaseComponent from '../../component/base-component';
import { FinanceHistory, HandleTurnInfo, ITurnable, FinanceType } from '../../../types/types';
/**
 * @constructor
 * @param {string}         name    - string with name
 * @param {number}         gold    - number with current gold
 *
 * @param {FinanceHistory} history - (optional) FinanceHistory object
 * @param {string}         id      - (optional) string number describing id
 */
export default class Finance extends BaseComponent implements ITurnable {
    private _gold;
    private _history;
    constructor(name: string, gold: number, history?: FinanceHistory, id?: string);
    getGold: () => number;
    getHistory: () => FinanceHistory;
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
    * Set nthTurn array of income and expense object to an empty array
    */
    private handleStartTurn;
    /**
    * Check if a Route has arrived and handle income accordingly
    *
    * @param {Route} route - Route to be checked and handled
    */
    private handleRoute;
    /**
     * Get Train upkeep with Player upgrades taken into consideration
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
    * Remove gold from count
    *
    * @param {number} value - number with gold to be subtracted
    */
    private removeGold;
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
    static createFromStringifiedJSON: (stringifiedJSON: string) => Finance;
}
