import BaseComponent from '../../component/base-component';
import Upgrade from './upgrade';
import Route from '../route';
import Train from '../train';
import { isDefined } from '../../../util/util';
import {
    localKeys, netWorthDivisors, stockConstant
} from '../../../util/constants';
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
    UpgradeType,
    PlayerData,
    QueuedRouteItem,
    Stocks,
    StockHolding,
    RouteCargo
} from '../../../types/types';


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
 * @param {StockHolding}   stocks       - (optional) StockHolding object.
 * @param {string}         id           - (optional) String number describing id.
 */

export default class Finance extends BaseComponent implements ITurnable {

    private _playerId    : string;
    private _gold        : number;
    private _history     : FinanceHistory;
    private _totalHistory: FinanceTotal;
    private _totalProfits: number;
    private _netWorth    : number;
    private _stocks      : StockHolding;

    constructor(
        name             : string,
        playerId         : string,
        gold             : number,
        history         ?: FinanceHistory,
        totalHistory    ?: FinanceTotal,
        totalProfits    ?: number,
        netWorth        ?: number,
        stocks          ?: StockHolding,
        id              ?: string
    ) {
        super(name, id);

        this._playerId     = playerId;
        this._gold         = gold;
        this._history      = isDefined(history) ? history : this.getInitialHistoryState();
        this._totalProfits = isDefined(totalProfits) ? totalProfits : 0;
        this._totalHistory = isDefined(totalHistory) ? totalHistory : {
            [localKeys[FinanceType.Train]]    : 0,
            [localKeys[FinanceType.Track]]    : 0,
            [localKeys[FinanceType.Upkeep]]   : 0,
            [localKeys[FinanceType.Upgrade]]  : 0,
            [localKeys[FinanceType.Recoup]]   : 0,
            [localKeys[FinanceType.StockBuy]] : 0,
            [localKeys[FinanceType.StockSell]]: 0
        };
        this._netWorth     = isDefined(netWorth) ? netWorth : this._gold + Math.floor(
            stockConstant.startingShares * stockConstant.multipliers.stockHolder
        );
        this._stocks       = isDefined(stocks) ? stocks : {
            [this._playerId]: stockConstant.startingShares
        };
    }

    public getGold         = (): number         => this._gold;
    public getHistory      = (): FinanceHistory => this._history;
    public getTotalHistory = (): FinanceTotal   => this._totalHistory;
    public getTotalProfits = (): number         => this._totalProfits;
    public getNetWorth     = (): number         => this._netWorth;
    public getStocks       = (): StockHolding   => this._stocks;

    /**
     * Handle Finance events at each turn.
     * 
     * @param  {HandleTurnInfo}  info - Object with relevant turn information.
     */

    public handleTurn = (info: HandleTurnInfo): void => {
        this.handleStartTurn();
        if (info.playerData.routes.length > 0) {
            info.playerData.routes.forEach((route: Route): void => {
                this.handleRoute(route, info.playerData.upgrades);
            });
        }
        this.updateNetWorth(info.playerData)
    }

    /**
     * Add entry to expense object from the turn at hand.
     * 
     * @param {FinanceType} type   - FinanceType of the expense.
     * @param {string}      id     - String with id of the expense.
     * @param {number}      amount - Number with amount of the expense.
     * @param {number}      value  - Number with value of the expense.
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
     * @param   {FinanceType} type   - FinanceType of the expense to be removed.
     * @param   {string}      id     - string with id of the expense to be removed.
     * 
     * @returns {boolean}     True if removed else false.
     */

    public removeFromFinanceExpense = (
        type: FinanceType,
        id  : string
    ): boolean => {
        const targets: Array <FinanceTurnItem[]> = Object.keys(this._history.expense).map(e => this._history.expense[e]);
        for (let i: number = 0; i < targets.length; i++) {
            const target: FinanceTurnItem[] = targets[i];
            for (let j: number = 0; j < target.length; j++) {
                if (target[j].type === type && target[j].id === id) {
                    const value: number = target[j].amount * target[j].value;
                    target.splice(j, 1);
                    this._totalProfits += value;
                    this.removeFromTotalHistory(localKeys[type], value);
                    this.addGold(value);
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @returns {number} Number that describes the revenue in gold over the last three turns.
     */

    public getAverageRevenue = (): number => this.getAverageHistory(this._history.income);

    /**
     * @returns {number} Number that describes the expense in gold over the last three turns.
     */

    public getAverageExpense = (): number => this.getAverageHistory(this._history.expense);

    /**
     * Add to gold from a deleted Route.
     * 
     * @param {number} value - Number wih gold to recoup.
     */

    public recoupDeletedRoute = (value: number): void => {
        const id: string = localKeys[FinanceType.Recoup];
        this.addToTotalHistory(id, value);
        this._totalProfits += value;
        this.addNthTurnObject(FinanceGeneralType.Income, FinanceType.Recoup, id, 1, value);
    }

    /**
     * Update the net worth of the owning Player.
     * 
     * @param {PlayerData} data - Object with PlayerData. 
     */

    public updateNetWorth = (data: PlayerData): void => {
        this._netWorth = [...data.queue.map((queue: QueuedRouteItem): Route => queue.route), ...data.routes]
        .map((route: Route): number => (
            Math.floor(route.getCost() / netWorthDivisors.tracks) +
            Math.floor(route.getTrain().cost / netWorthDivisors.train)
        )).reduce((a: number, b: number): number => a + b, data.upgrades.map((upgrade: Upgrade): number => (
            Math.floor(upgrade.cost / netWorthDivisors.upgrade)
        )).reduce((a: number, b: number): number => a + b, 
        this.getValueOfOwnedStock(data.gameStocks) + Math.floor(this._gold / netWorthDivisors.gold)));
    }

    /**
     * Add Stock to StockHolding and handle expense.
     * 
     * @param {string} playerId - String with id of the owning player of Stock to add.
     * @param {number} value    - BuyValue of the Stock. 
     */

    public buyStock = (playerId: string, value: number): void => {
        if (isDefined(this._stocks[playerId])) {
            this._stocks[playerId] += 1;
        } else {
            this._stocks[playerId] = 1;
        }
        this.addToFinanceExpense(FinanceType.StockBuy, localKeys[FinanceType.StockBuy], 1, value);
    }

    /**
     * Remove Stock from StockHolding and handle income.
     * 
     * @param {string} playerId      - String with id of the owning player of Stock to remove.
     * @param {number} value         - SellValue of the Stock. 
     * 
     * @param {number} stockSubtract - (optional) Number to subtract from current holding.
     */
    
    public sellStock = (playerId: string, value: number, stockSubtract: number = 1): void => {
        if (isDefined(this._stocks[playerId]) && this._stocks[playerId] - stockSubtract >= 0) {
            this._stocks[playerId] -= stockSubtract;
            this.addNthTurnObject(
                FinanceGeneralType.Income, 
                FinanceType.StockSell, 
                localKeys[FinanceType.StockSell], 
                1, 
                value
            );
            this._totalProfits += value;
            this.addToTotalHistory(localKeys[FinanceType.StockSell], value);
        }
    }

    /** 
     * @returns {string} String with JSON stringified property keys and values.
     */

    public deconstruct = (): string => JSON.stringify(this)

    /**
     * Set nthTurn array of income and expense object to an empty array.
     */

    private handleStartTurn = (): void => {
        this.updateHistoryItemsOnStartedTurn(this._history.income);
        this.updateHistoryItemsOnStartedTurn(this._history.expense);
    }

    /**
     * @param   {FinanceHistoryItem} historyItem - History object to average.
     * 
     * @returns {number}             Number with average value of the history item.
     */

    private getAverageHistory = (historyItem: FinanceHistoryItem): number => {
        const keys: string[] = Object.keys(historyItem);
        return Math.round(
            keys.map((key: string): number => historyItem[key]
                .reduce((a: number, b: FinanceTurnItem): number => a + (b.amount * b.value), 0))
            .reduce((a: number, b: number): number => a + b, 0) /
            keys.length
        );
    }

    /**
     * Check if a Route has arrived and handle income accordingly.
     * 
     * @param {Route}     route    - Route to be checked and handled.
     * @param {Upgrade[]} upgrades - Upgrades to be accounted for.
     */

    private handleRoute = (route: Route, upgrades: Upgrade[]): void => {
        const state: RouteState = route.getRouteState();
        const train: Train = route.getTrain();
        const upkeep: number = this.getTrainUpkeep(train, upgrades);
        route.subtractFromProfit(upkeep);
        this.addToFinanceExpense(FinanceType.Upkeep, train.id, 1, upkeep);
        if (state.hasArrived) {
            state.cargo.forEach((cargo: RouteCargo): void => {
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
     * Get Train upkeep with Player upgrades taken into consideration.
     * 
     * @param   {Train}     train    - Train to get upkeep from.
     * @param   {Upgrade[]} upgrades - Upgrades to be accounted for.
     * 
     * @returns {number}    Number with the correct Train upkeep.
     */

    private getTrainUpkeep = (train: Train, upgrades: Upgrade[]): number => {
        const relevantUpgrades: Upgrade[] = upgrades.filter((e: Upgrade): boolean => e.type === UpgradeType.TrainUpkeepCheaper);
        let upkeep: number = train.upkeep;
        if (relevantUpgrades.length > 0) {
            relevantUpgrades.forEach(e => {
                upkeep -= Math.floor(upkeep * e.value);
            });
        }
        return upkeep;
    }

    /**
     * Add to gold count.
     * 
     * @param {number} value - Number with gold to be added.
     */

    private addGold = (value: number): void => {
        this._gold += value;
    }

    /**
     * Remove gold from count.
     * 
     * @param {number} value - number with gold to be subtracted.
     */

    private removeGold = (value: number): void => {
        this._gold -= value;
    }

    /**
     * Get total value of the owning Player's current stock holdings.
     * 
     * @param   {Stocks} stocks - Stocks object with all game Stock objects.
     * 
     * @returns {number} Number with value of Stocks.
     */

    private getValueOfOwnedStock = (stocks: Stocks): number => {
        if (isDefined(stocks)) {
            return Object.keys(this._stocks).map((key: string): number => (
                isDefined(stocks[key]) ? stocks[key].getSellValue() * this._stocks[key] : 0
            )).reduce((a, b) => a + b, 0);
        }
        return 0;
    }

    /**
     * Add entry to FinanceTotal.
     * 
     * @param {string} id    - String with id of the entry target.
     * @param {number} value - Number with value to add to target.
     */

    private addToTotalHistory = (id: string, value: number): void => {
        if (isDefined(this._totalHistory[id])) {
            this._totalHistory[id] += value;
        } else {
            this._totalHistory[id] = value;
        }
    }

    /**
     * Remove entry from FinanceTotal.
     * 
     * @param {string} id    - String with id of the entry target.
     * @param {number} value - Number with value to remove from target.
     */

    private removeFromTotalHistory = (id: string, value: number): void => {
        if (isDefined(this._totalHistory[id])) {
            this._totalHistory[id] -= value;
        }
    }

    /**
     * Add entry to any nthTurn object.
     * 
     * @param {FinanceGeneralType} generalType - FinanceGeneralType of the entry.
     * @param {FinanceType}        type        - FinanceType of the expense.
     * @param {string}             id          - string with id of the expense.
     * @param {number}             amount      - number with amount of the expense.
     * @param {number}             value       - number with value of the expense.
     */

    private addNthTurnObject = (
        generalType: FinanceGeneralType,
        type       : FinanceType,
        id         : string,
        amount     : number,
        value      : number
    ): void => {
        const isIncome: boolean = generalType === FinanceGeneralType.Income;
        const object: FinanceTurnItem = {
            type  : type,
            id    : id,
            amount: amount,
            value : value
        };
        const target: FinanceHistoryItem = isIncome ? this._history.income : this._history.expense;
        const goldTarget: (value: number) => void = isIncome ? this.addGold : this.removeGold;
        target.nthTurn.push(object);
        goldTarget(object.amount * object.value);
    }

    /**
     * Shift each entry one place forward and then reset the nthTurn array.
     * 
     * @param {FinanceHistoryItem} item - FinanceHistoryItem to be shifted.
     */

    private updateHistoryItemsOnStartedTurn = (item: FinanceHistoryItem): void => {
        item.nthTurnMinusTwo = item.nthTurnMinusOne;
        item.nthTurnMinusOne = item.nthTurn;
        item.nthTurn = [];
    }

    /**
     * @returns {FinanceHistory} FinanceHistory default starting state.
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
     * @param   {string}     stringifiedJSON - String with information to be used.
     * 
     * @returns {Finance}    Finance instance created from the model.
     */

    public static createFromStringifiedJSON = (stringifiedJSON: string | object): Finance => {
        const parsedJSON = typeof stringifiedJSON === 'string' ? JSON.parse(stringifiedJSON) : stringifiedJSON;
        return new Finance(
            parsedJSON.name,
            parsedJSON._playerId,
            parsedJSON._gold,
            parsedJSON._history,
            parsedJSON._totalHistory,
            parsedJSON._totalProfits,
            parsedJSON._netWorth,
            parsedJSON._stocks,
            parsedJSON.id
        );
    }
}