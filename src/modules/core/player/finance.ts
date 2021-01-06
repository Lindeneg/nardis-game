import BaseComponent from '../../component/base-component';
import Upgrade from './upgrade';
import Route from '../route';
import Train from '../train';
import { localKeys } from '../../../util/constants';
import {
    FinanceHistory,
    FinanceHistoryItem,
    FinanceTurnItem,
    FinanceTotal,
    RouteState,
    HandleTurnInfo,
    ITurnable,
    FinanceType,
    FinanceGeneralType,
    UpgradeType
} from '../../../types/types';


/**
 * @constructor
 * @param {string}         name         - string with name
 * @param {number}         gold         - number with current gold
 * 
 * @param {FinanceHistory} history      - (optional) FinanceHistory object
 * @param {FinanceTotal}   totalHistory - (optional) FinanceTotal object
 * @param {number}         totalProfits - (optional) Number with total profits.
 * @param {string}         id           - (optional) string number describing id
 */

export default class Finance extends BaseComponent implements ITurnable {

    private _gold        : number;
    private _history     : FinanceHistory;
    private _totalHistory: FinanceTotal;
    private _totalProfits: number;

    constructor(
            name         : string,
            gold         : number,
            history     ?: FinanceHistory,
            totalHistory?: FinanceTotal,
            totalProfits?: number,
            id          ?: string
    ) {
        super(name, id);

        this._gold            = gold;
        this._history         = history ? history : this.getInitialHistoryState();
        this._totalProfits    = totalProfits ? totalProfits : 0;
        this._totalHistory    = totalHistory ? totalHistory : {
            [localKeys[FinanceType.Train]]  : 0,
            [localKeys[FinanceType.Track]]  : 0,
            [localKeys[FinanceType.Upkeep]] : 0,
            [localKeys[FinanceType.Upgrade]]: 0
        };
    }

    public getGold         = (): number         => this._gold;
    public getHistory      = (): FinanceHistory => this._history;
    public getTotalHistory = (): FinanceTotal   => this._totalHistory;
    public getTotalProfits = (): number         => this._totalProfits;

    /**
    * Handle Finance events at each turn 
    * 
    * @param  {HandleTurnInfo}  info - object with relevant turn information
    */

    public handleTurn = (info: HandleTurnInfo): void => {
        this.handleStartTurn();
        if (info.playerData.routes.length > 0) {
            info.playerData.routes.forEach(route => {
                this.handleRoute(route, info.playerData.upgrades);
            });
        }
    }

    /**
    * Add entry to expense object from the turn at hand
    * 
    * @param {FinanceType} type   - FinanceType of the expense
    * @param {string}      id     - string with id of the expense
    * @param {number}      amount - number with amount of the expense
    * @param {number}      value  - number with value of the expense
    */

    public addToFinanceExpense = (
            type  : FinanceType, 
            id    : string, 
            amount: number, 
            value : number
    ): void => {
        this.addToTotalHistory(localKeys[type], amount * value);
        this._totalProfits -= amount * value;
        this.addNthTurnObject(FinanceGeneralType.Expense, type, id, amount, value);
    }

    /**
    * Remove entry from expense object.
    * 
    * @param {FinanceType} type   - FinanceType of the expense to be removed
    * @param {string}      id     - string with id of the expense to be removed
    * 
    * @returns {boolean}            true if removed else false
    */

    public removeFromFinanceExpense = ( 
            type: FinanceType, 
            id  : string
    ): boolean => {
        const targets: Array<FinanceTurnItem[]> = Object.keys(this._history.expense).map(e => this._history.expense[e]);
        for (let i: number = 0; i < targets.length; i++) {
            const target: FinanceTurnItem[] = targets[i];
            for (let j = 0; j < target.length; j++) {
                if (target[j].type === type && target[j].id === id) {
                    const value: number = target[j].amount * target[j].value;
                    target.splice(j, 1);
                    this._totalProfits += value;
                    this.addGold(value);
                    return true;
                }
            }
        }
        return false;
    }

    /**
    * @returns {number} number that describes the revenue in gold over the last three turns
    */

    public getAverageRevenue = (): number => {
        const keys: string[] = Object.keys(this._history.income);
        let sum: number = 0;
        keys.forEach(key => {
            sum += this._history.income[key].reduce((prev, cur) => prev + (cur.amount * cur.value), 0);
        });
        return Math.round(sum / keys.length);
    }

    /**
    * Set nthTurn array of income and expense object to an empty array
    */

    private handleStartTurn = (): void => {
        this.updateHistoryItemsOnStartedTurn(this._history.income);
        this.updateHistoryItemsOnStartedTurn(this._history.expense);
    }

    /**
    * Check if a Route has arrived and handle income accordingly
    * 
    * @param {Route} route - Route to be checked and handled
    */

    private handleRoute = (route: Route, upgrades: Upgrade[]): void => {
        const state: RouteState = route.getRouteState();
        const train: Train = route.getTrain();
        const upkeep: number = this.getTrainUpkeep(train, upgrades);
        route.subtractFromProfit(upkeep);
        this.addToFinanceExpense(FinanceType.Upkeep, train.id, 1, upkeep);
        if (state.hasArrived) {
            state.cargo.forEach(cargo => {
                if (state.destination.isDemand(cargo.resource)) {
                    const value: number = cargo.actualAmount * cargo.resource.getValue();
                    route.addToProfit(value);
                    this._totalProfits += value;
                    this.addToTotalHistory(cargo.resource.id, value);
                    this.addNthTurnObject(
                        FinanceGeneralType.Income, 
                        FinanceType.Resource,
                        cargo.resource.id,
                        cargo.actualAmount,
                        cargo.resource.getValue()
                    );
                }
            });
        }
    }

    /**
     * Get Train upkeep with Player upgrades taken into consideration
     * 
    * @return {number} - number with the correct Train upkeep
    */

    private getTrainUpkeep = (train: Train, upgrades: Upgrade[]): number => {
        const relevantUpgrades: Upgrade[] = upgrades.filter(e => e.type === UpgradeType.TrainUpkeepCheaper);
        let upkeep: number = train.upkeep;
        if (relevantUpgrades.length > 0) {
            relevantUpgrades.forEach(e => {
                upkeep -= Math.floor(upkeep * e.value);
            });
        }
        return upkeep;
    }

    /**
    * Add to gold count
    * 
    * @param {number} value - number with gold to be added
    */

    private addGold = (value: number): void => {
        this._gold += value;
    }

    /**
    * Remove gold from count
    * 
    * @param {number} value - number with gold to be subtracted
    */

    private removeGold = (value: number): void => {
        this._gold -= value;
    }

    private addToTotalHistory = (id: string, value: number): void => {
        if (typeof this._totalHistory[id] !== 'undefined') {
            this._totalHistory[id] += value;
        } else {
            this._totalHistory[id] = value;
        }
    }

    /**
    * Add entry to any nthTurn object
    * 
    * @param {FinanceGeneralType} generalType - FinanceGeneralType of the entry
    * @param {FinanceType}        type   - FinanceType of the expense
    * @param {string}             id     - string with id of the expense
    * @param {number}             amount - number with amount of the expense
    * @param {number}             value  - number with value of the expense
    */

    private addNthTurnObject = (
            generalType: FinanceGeneralType, 
            type: FinanceType, 
            id: string, 
            amount: number, 
            value: number
    ) => {
        const isIncome: boolean = generalType === FinanceGeneralType.Income;
        const object: FinanceTurnItem = {
            type: type,
            id: id,
            amount: amount,
            value: value
        };
        const target: FinanceHistoryItem = isIncome ? this._history.income : this._history.expense;
        const goldTarget: (value: number) => void = isIncome ? this.addGold : this.removeGold;
        target.nthTurn.push(object);
        goldTarget(object.amount * object.value);
    }

    /**
    * Shift each entry one place forward and then reset the nthTurn array
    * 
    * @param {FinanceHistoryItem} item - FinanceHistoryItem to be shifted
    */

    private updateHistoryItemsOnStartedTurn = (item: FinanceHistoryItem): void => {
        item.nthTurnMinusTwo = item.nthTurnMinusOne;
        item.nthTurnMinusOne = item.nthTurn;
        item.nthTurn = [];
    }

    /**
    * @returns {FinanceHistory} FinanceHistory default starting state
    */

    private getInitialHistoryState = (): FinanceHistory => {
        return {
            income: {
                nthTurn: [],
                nthTurnMinusOne: [],
                nthTurnMinusTwo: []
            },
            expense: {
                nthTurn: [],
                nthTurnMinusOne: [],
                nthTurnMinusTwo: []
            }
        };
    }

    /**
     * Get Finance instance from stringified JSON.
     * 
    * @param {string}     stringifiedJSON - string with information to be used
    * 
    * @return {Finance}                     Finance instance created from the model
    */

    public static createFromStringifiedJSON = (stringifiedJSON: string): Finance => {
        const parsedJSON: any = JSON.parse(stringifiedJSON);
        return new Finance(
            parsedJSON.name,
            parsedJSON._gold,
            parsedJSON._history,
            parsedJSON._totalHistory,
            parsedJSON._totalProfits,
            parsedJSON.id
        );
    }
}