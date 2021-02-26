import City from './core/city';
import Route from './core/route';
import Upgrade from './core/player/upgrade';
import Player from './core/player/player';
import Train from './core/train';
import Resource from './core/resource';
import Finance from './core/player/finance';
import Opponent from './core/player/opponent/opponent';
import Stock from './core/player/stock';
import Logger from '../util/logger';
import { genericOpponentsName } from '../data/preparedData';
import {  RawDataModel } from '../types/model';
import { generateData } from '../data/data';
import { 
    getRangeTurnCost, 
    isDefined 
} from '../util/util';
import {
    localKeys, 
    START_GOLD, 
    START_OPPONENTS, 
    stockConstant
} from '../util/constants';
import {
    GameData,
    PotentialRoute,
    BuyableRoute,
    FinanceType,
    UpgradeType,
    PlayerType,
    LocalKey,
    RoutePlanCargo,
    AdjustedTrain,
    Stocks,
    Indexable,
    StockSupply,
    BuyOutValue,
    StockHolding,
    GameStatus,
    PartialLog,
    LogLevel
} from '../types/types';


/**
 * @constructor
 * @param {GameData} data          - Object with GameData.
 * @param {Player[]} players       - Array with Players.
 * @param {Stocks}   stocks        - Object with Stocks.
 * 
 * @param {Player}   currentPlayer - (optional) Player instance of the current turn taker.
 * @param {number}   turn          - (optional) Number describing the current turn.
 */

export class Nardis {

    readonly data         : GameData;
    readonly players      : Player[];
    readonly stocks       : Stocks;

    private _currentPlayer: Player;
    private _turn         : number;

    private log           : PartialLog

    constructor(
        gameData          : GameData,
        players           : Player[],
        stocks            : Stocks,
        currentPlayer    ?: Player,
        turn             ?: number
    ) {

        this.data           = gameData;
        this.players        = players;
        this.stocks         = stocks;

        this._currentPlayer = currentPlayer ? currentPlayer : this.players[0];
        this._turn          = turn          ? turn          : 1;
        
        this.log            = Logger.log.bind(null, LogLevel.All, 'nardis-game');

        this.updatePlayersNetWorth();

        Logger.setTurn(this._turn);
    }

    public getCurrentPlayer = (): Player => this._currentPlayer;
    public getCurrentTurn   = (): number => this._turn;

    /**
     * Runs at the end of each human Player turn.
     */

    public endTurn = (): void => {
        this._currentPlayer.handleTurn(
            {
                turn: this._turn, 
                data: this.data,
                playerData: {
                    routes: this._currentPlayer.getRoutes(),
                    upgrades: this._currentPlayer.getUpgrades(),
                    queue: this._currentPlayer.getQueue()
                }
            }
        );
        this.handleComputerTurn();
        [...this.data.cities, ...this.data.resources].forEach((turnComponent: City | Resource): void => {
            turnComponent.handleTurn({turn: this._turn, data: this.data, playerData: {routes: [], upgrades: [], queue: []}});
        });
        this._turn++;
        this.updateStocks();
        this.updatePlayersNetWorth();
        this.saveGame();
        Logger.setTurn(this._turn);
    }

    /**
     * Get array of PotentialRoute objects respecting the current Players maximum range.
     * 
     * @param   {City}              origin - City instance of initial departure.
     * 
     * @returns {PotentialRoute[]}  Array of PotentialRoutes.
     */

    public getArrayOfPossibleRoutes = (origin: City): PotentialRoute[] => {
        const constraint: number = this._currentPlayer.getRange();
        const potentialRoutes: PotentialRoute[] = [];
        this.data.cities.forEach((city: City): void => {
            const distance: number = city.distanceTo(origin);
            const { goldCost, turnCost }: Indexable<number> = this.getPotentialRouteCost(distance);
            if (distance > 0 && distance <= constraint) {
                potentialRoutes.push({
                    cityOne: origin,
                    cityTwo: city,
                    distance: distance,
                    goldCost: goldCost,
                    turnCost: turnCost,
                    purchasedOnTurn: this._turn
                });
            }
        });
        return potentialRoutes;
    }

    /**
     * @returns {AdjustedTrain[]} Array of Trains with their cost adjusted to reflect potential Player Upgrades.
     */

    public getArrayOfAdjustedTrains = (): AdjustedTrain[] => {
        const upgrades: Upgrade[] = this._currentPlayer.getUpgrades().filter(
            (upgrade: Upgrade): boolean => upgrade.type === UpgradeType.TrainValueCheaper
        );
        return this.data.trains.map((train: Train): AdjustedTrain => {
            let cost: number = train.cost;
            upgrades.forEach((upgrade: Upgrade): void => {
                cost -= Math.floor(cost * upgrade.value);
            });
            return { train, cost };
        });
    }

    /**
     * Check if a single Player is left and thus is the winner of the game.
     * 
     * @returns {GameStatus} GameStatus of the Nardis instance in question.
     */

    public getGameStatus = (): GameStatus => {
        const winner: Player[] = this.players.filter((player: Player): boolean => player.isActive());
        let id: string = ''; let gameOver: boolean = false;
        if (winner.length === 1) {
            this.log(`'${winner[0].name}' is the only active player left`);
            id = winner[0].id; gameOver = true;
        }
        return {id, gameOver};
    }
    
    /**
     * Add an entry to Player queue.
     * 
     * @param {BuyableRoute} buyableRoute - BuyableRoute to add.
     */

    public addRouteToPlayerQueue = (buyableRoute: BuyableRoute): void => {
        const route: Route = new Route(
            '',
            buyableRoute.cityOne,
            buyableRoute.cityTwo,
            buyableRoute.train,
            buyableRoute.routePlanCargo,
            buyableRoute.distance,
            buyableRoute.goldCost,
            buyableRoute.purchasedOnTurn
        );
        this.handleNewRoutePlayerFinance(buyableRoute, route.id);
        this._currentPlayer.addRouteToQueue(route, buyableRoute.turnCost);
    }

    /**
     * Add Upgrade to Player.
     * 
     * @param   {string}   id - String with id of Upgrade to add.
     * 
     * @returns {boolean}  True if Upgrade was added else false.
     */

    public addUpgradeToPlayer = (id: string): boolean => {
        const matchedUpgrade: Upgrade[] = this.data.upgrades.filter(upgrade => upgrade.id === id);
        if (matchedUpgrade.length > 0) {
            this.log(`adding upgrade '${id}' to '${this._currentPlayer.name}'`);
            this._currentPlayer.addUpgrade(matchedUpgrade[0]);
            this._currentPlayer.getFinance().addToFinanceExpense(
                FinanceType.Upgrade,
                matchedUpgrade[0].id,
                1,
                matchedUpgrade[0].cost
            );
            return true;
        }
        this.log(`upgrade '${id}' could not be found in game data`);
        return false;
    }

    /**
     * Change Train and/or RoutePlanCargo of active Route.
     * 
     * @param   {string}         id        - String with id of Route to alter.
     * @param   {Train}          train     - Train instance to be used.
     * @param   {RoutePlanCargo} routePlan - RoutePlanCargo to be used.
     * @param   {number}         cost      - Number with cost of the Route change.
     * 
     * @returns {boolean}        True if Route was altered else false.
     */

    public changeActivePlayerRoute = (
        routeId  : string, 
        train    : Train, 
        routePlan: RoutePlanCargo, 
        cost     : number
    ): boolean => {
        const routes: Route[] = this._currentPlayer.getRoutes().filter(e => e.id === routeId);
        if (routes.length > 0) {
            if (cost > 0) {
                this._currentPlayer.getFinance().addToFinanceExpense(FinanceType.Train, train.id, 1, cost);
            }
            routes[0].change(train, routePlan);
            return true;
        }
        this.log(`route '${routeId}' not found in '${this._currentPlayer.name}' data for editing`);
        return false;
    }

    /**
     * Remove an entry from Player queue.
     * 
     * @param   {string}   routeId - String with id of Route to remove.
     * @param   {string}   trainId - String with id of Train in Route.
     * 
     * @returns {boolean}  True if Route was removed from queue else false.
     */

    public removeRouteFromPlayerQueue = (routeId: string, trainId: string): boolean => {
        return this.handleRemoveRouteFromPlayerFinance(routeId, trainId) && this._currentPlayer.removeRouteFromQueue(routeId);
    }

    /**
     * Remove an entry from Player routes.
     * 
     * @param   {string}   routeId  - String with id of Route to remove.
     * @param   {number}   value    - Number wih gold to recoup.
     * 
     * @returns {boolean}  True if Route was removed from routes else false.
     */

    public removeRouteFromPlayerRoutes = (routeId: string, value: number): boolean => {
        if (this._currentPlayer.removeRouteFromRoutes(routeId)) {
            this._currentPlayer.getFinance().recoupDeletedRoute(value);
            return true;
        }
        this.log(`route '${routeId}' not found in '${this._currentPlayer.name}' data for deletion`);
        return false;
    }

    /**
     * Buyout Player(s) of a certain Stock and take over the owning Player.
     * 
     * @param   {string}  playerId   - String with Id of the 'losing' Player. 
     * 
     * @param   {boolean} selfBuyOut - (optional) Boolean describing if the takeover is from/to the same Player.
     * 
     * @returns {boolean} True if Player was bought out else False. 
     */

    public buyOutPlayer = (playerId: string, selfBuyOut: boolean = false): boolean => {
        this.log(`'${this._currentPlayer.name}' is attempting to buyout '${playerId}' stock`);
        const stock: Stock = this.stocks[playerId]; const supply: StockSupply = stock.getSupply(); 
        const diff: number = stockConstant.maxStockAmount - (isDefined(supply[this._currentPlayer.id]) ? supply[this._currentPlayer.id] : 0);
        const cpFinance: Finance = this._currentPlayer.getFinance();
        if (stock.currentAmountOfStockHolders() >= stockConstant.maxStockAmount) {
            const mLosingPlayer: Player[] = this.players.filter(e => e.id === playerId);
            if (mLosingPlayer.length > 0) {
                const losingPlayer: Player = mLosingPlayer[0];
                let expense: number = 0;
                let nShareHolders: number = 0;
                stock.getBuyOutValues().forEach((buyout: BuyOutValue): void => {
                    if (buyout.id !== this._currentPlayer.id) {
                        const mStockHolder: Player[] = this.players.filter(e => e.id === buyout.id);
                        if (buyout.shares > 0 && mStockHolder.length > 0) {
                            const stockHolder: Player = mStockHolder[0];
                            if (buyout.id === losingPlayer.id && !selfBuyOut) {
                                losingPlayer.getFinance().sellStock(losingPlayer.id, 0, buyout.shares);
                                stock.sellStock(losingPlayer.id, buyout.shares);
                                this.log(`took over ${buyout.shares} shares from losing player '${losingPlayer.name}'`);
                            } else {
                                stockHolder.getFinance().sellStock(playerId, buyout.totalValue, buyout.shares);
                                stock.sellStock(stockHolder.id, buyout.shares);
                                this.log(`bought out ${buyout.shares} shares from '${stockHolder.name}' for ${buyout.totalValue}g`);
                                nShareHolders++;
                            }
                            expense += buyout.totalValue;
                        }
                    }
                }); 
                cpFinance.addToFinanceExpense(FinanceType.StockBuy, localKeys[FinanceType.StockBuy], 1, expense);
                for (let i: number = 0; i < diff; i++) {
                    stock.buyStock(this._currentPlayer.id);
                    cpFinance.buyStock(playerId, 0);
                }
                this.log(`bought out ${nShareHolders} shareholders for a total of ${expense}g`);
                !selfBuyOut ? this.playerTakeOver(this._currentPlayer, losingPlayer, stock) : null;
                return true;
            } else {
                this.log(`could not find player from id '${playerId}'`);
            }
        } else {
            this.log(`could not buyout '${playerId}' as not all supply has been consumed`);
        }
        return false;
    }

    /**
     * Buy Stock to the Player of the current turn.
     * 
     * @param   {string}  playerId - String with id of the owning player of Stock to buy.
     * 
     * @returns {boolean} True if Stock was bought else false. 
     */

    public buyStock = (playerId: string): boolean => this.performStockAction(playerId, true);

    /**
     * Sell Stock to the Player of the current turn.
     * 
     * @param   {string}  playerId - String with id of the owning player of Stock to sell.
     * 
     * @returns {boolean} True if Stock was sold else false. 
     */

    public sellStock = (playerId: string): boolean => this.performStockAction(playerId, false);

    /**
     * Clear the saved game state from localStorage.
     */

    public clearStorage = (): void => {
        this.log(`clearing ${localKeys} keys from localStorage`);
        localKeys.forEach(key => {
            window.localStorage.removeItem(key);
        });
    }

    /**
     * Buy or Sell Stock to the Player of the current turn. 
     * 
     * @param   {string}  playerId - String with id of the owning player of Stock to buy/sell.
     * @param   {boolean} buy      - True if action should be buy, false if action should be sell.
     * 
     * @returns {boolean} True if action was performed else false. 
     */

    private performStockAction = (
        playerId: string, 
        buy     : boolean
    ): boolean => {
        const mStockOwner: Player[] = this.players.filter((player: Player): boolean => player.id === playerId);
        if (isDefined(this.stocks[playerId]) && mStockOwner.length > 0) {
            const stockOwner: Player = mStockOwner[0];
            const value: number = (buy ?
                this.stocks[playerId].getBuyValue() : 
                this.stocks[playerId].getSellValue()
            );
            const didSomething: boolean = (buy ? 
                this.stocks[playerId].buyStock(this._currentPlayer.id) : 
                this.stocks[playerId].sellStock(this._currentPlayer.id)
            );
            if (didSomething) {
                const finance: Finance = this._currentPlayer.getFinance();
                (buy ? 
                    finance.buyStock(playerId, value) : 
                    finance.sellStock(playerId, value)
                );
                this.updateStock(stockOwner);
                this.updatePlayerNetWorth(this._currentPlayer);
                this.updatePlayerNetWorth(stockOwner);
                this.log(`'${this._currentPlayer.name}' ${buy ? 'bought' : 'sold'} stock from '${stockOwner.name}' for ${value}g`);
                buy ? this.checkIfPlayerIsFullyOwned(stockOwner) : null;
                return true;
            }
        }
        this.log(`'${this._currentPlayer.name}' could not ${buy ? 'buy' : 'sell'} stock '${playerId}'`);
        return false;
    }

    /**
     * Check if a Player is fully owned by a foreign Player. If so, perform a Player takeover.
     * 
     * @param {Player} stockOwner - Player instance to check if owned by another Player. 
     */

    private checkIfPlayerIsFullyOwned = (stockOwner: Player): void => {
        const supply: StockSupply = this.stocks[stockOwner.id].getSupply();
        if (supply[this._currentPlayer.id] >= stockConstant.maxStockAmount && stockOwner.id !== this._currentPlayer.id) {
            this.log(`'${this._currentPlayer.name}' now owns 100% of '${stockOwner.name}`);
            this.playerTakeOver(this._currentPlayer, stockOwner, this.stocks[stockOwner.id]);
        } 
    }

    /**
     * Update the net worth of every Player in the game.
     */

    private updatePlayersNetWorth = (): void => this.players.forEach((player: Player): void => {
        this.updatePlayerNetWorth(player);
    });

    /**
     * Update net worth of a single Player
     * 
     * @param {Player} player - Player instance whose net worth to update. 
     */

    private updatePlayerNetWorth = (player: Player): void => player.getFinance().updateNetWorth({
        routes    : player.getRoutes(),
        queue     : player.getQueue(),
        upgrades  : player.getUpgrades(),
        gameStocks: this.stocks
    });

    /**
     * Update the value of every Stock in game.
     */

    private updateStocks = (): void => this.players.forEach((player: Player): void => {
        this.updateStock(player);
    });

    /**
     * Update value of Stock associated with a given Player.
     * 
     * @param {Player} player - Player instance whose Stock value should be updated.
     */

    private updateStock = (player: Player): void => {
        this.stocks[player.id].updateValue(
            player.getFinance(), 
            player.getRoutes().length + player.getQueue().length, 
            this._turn
        );
    }

    /**
     * Merge loser Player with victor Player, if the latter is taking over the former.
     * Merge all Routes, Upgrades, Gold and Stock.
     * 
     * @param {Player} victor - Player instance taking over.
     * @param {Player} loser  - Player instance being taken over.
     * @param {Stock}  stock  - Stock instance of the losing Player.
     */

    private playerTakeOver = (victor: Player, loser: Player, stock: Stock): void => {
        this.log(`commencing '${victor.name}' takeover of '${loser.name}'`);
        const vFinance: Finance = victor.getFinance(); const lFinance: Finance = loser.getFinance();
        const profit: number = lFinance.getGold();
        if (profit > 0) {
            vFinance.sellStock(loser.id, profit, 0);
            lFinance.addToFinanceExpense(FinanceType.StockBuy, localKeys[FinanceType.StockBuy], 1, profit);
        }
        const r: number = victor.mergeQueue(loser.getQueue()); const q: number = victor.mergeRoutes(loser.getRoutes());
        const [sh, st]: [number, number] = this.mergeStock(victor, loser);
        this.log(`merged ${profit}g, ${r} routes, ${q} queue and ${sh} shares distributed between ${st} stocks`);
        loser.setInactive();
        stock.setInactive(this._turn);
        this.updateStocks();
        this.updatePlayersNetWorth();
    }

    /**
     * Merge losing Player Stock into winning Player Stock.
     * 
     * @param {Player} victor - Player instance taking over.
     * @param {Player} loser  - Player instance being taken over.
     * 
     * @returns {[number, number]} Tuple with two numbers describing merged amount of Stock and shares.
     */

    private mergeStock = (victor: Player, loser: Player): [number, number] => {
        this.log(`merging '${loser.name}' stock to '${victor.name}' holdings`);
        let mergedStock: number = 0; let mergedShares: number = 0;
        const vFinance: Finance = victor.getFinance(); const lFinance: Finance = loser.getFinance();
        const lStocks: StockHolding = lFinance.getStocks();
        Object.keys(lStocks).forEach((key: string): void => {
            if (key !== loser.id && lStocks[key] > 0) {
                const stock: Stock = this.stocks[key];
                const amount: number = lStocks[key];
                lFinance.sellStock(key, 0, amount);
                stock.sellStock(loser.id, amount);
                mergedShares += amount;
                mergedStock++;
                for (let i: number = 0; i < amount; i++) {
                    vFinance.buyStock(key, 0);
                    stock.buyStock(victor.id);
                }
                this.log(`merged ${amount} shares from stock '${key}'`);
            }
        });
        return [mergedStock, mergedShares];
    }

    /**
     * Iterate over each Computer player and handle their turns accordingly.
     */

    private handleComputerTurn = (): void => {
        const actualPlayer: Player = this._currentPlayer;
        this.players.forEach(player => {
            if (player.playerType === PlayerType.Computer) {
                this._currentPlayer = player;
                player.handleTurn(
                    {turn: this._turn, 
                    data: this.data, 
                    playerData: {
                        routes: player.getRoutes(), 
                        upgrades: player.getUpgrades(),
                        queue: player.getQueue(),
                        gameStocks: this.stocks
                    }},
                    this
                );
            }
        });
        this._currentPlayer = actualPlayer;
    }

    /**
     * Handle Player expenses when purchasing a new Route and Train.
     * 
     * @param {BuyableRoute} buyableRoute - BuyableRoute object.
     * @param {string}       id           - String with id of the Route.
     */

    private handleNewRoutePlayerFinance = (buyableRoute: BuyableRoute, id: string): void => {
        const finance: Finance = this._currentPlayer.getFinance();
        finance.addToFinanceExpense(FinanceType.Track, id, 1, buyableRoute.goldCost);
        finance.addToFinanceExpense(FinanceType.Train, buyableRoute.train.id, 1, buyableRoute.trainCost);
    }

    /**
     * Remove Player expenses when reverting the purchase of Route and Train.
     * 
     * @param   {string}   routeId - String with id of Route to remove.
     * @param   {string}   trainId - String with id of Train in Route.
     * 
     * @returns {boolean}  True if removed from Finance else false.
     */

    private handleRemoveRouteFromPlayerFinance = (routeId: string, trainId: string): boolean => {
        const finance: Finance = this._currentPlayer.getFinance();
        return (
            finance.removeFromFinanceExpense(FinanceType.Track, routeId) &&
            finance.removeFromFinanceExpense(FinanceType.Train, trainId)
        );
    }

    /**
     * Get an object describing the gold and turn cost for a given Route with Upgrades taken into account.
     * 
     * @param   {number}  distance - String with id of Route to remove.
     * 
     * @returns {Object}  Object with gold and turn cost for a given distance
     */
 
    private getPotentialRouteCost = (distance: number): {goldCost: number, turnCost: number} => {
        const upgrades: Upgrade[] = this._currentPlayer.getUpgrades();
        const valUp: Upgrade[] = upgrades.filter(upgrade => upgrade.type === UpgradeType.TrackValueCheaper);
        const turnUp: Upgrade[] = upgrades.filter(upgrade => upgrade.type === UpgradeType.TurnCostCheaper);
        let goldCost: number = distance * 2;
        let turnCost: number = getRangeTurnCost(distance);
        valUp.forEach(e => {
            const value: number = Math.floor(goldCost * e.value);
            if (goldCost - value < 10) {
                goldCost = 10;
            } else {
                goldCost -= value;
            }
        });
        turnUp.forEach(e => {
            if (turnCost >= 2) {
                turnCost -= e.value;
            }
        });
        return {
            goldCost, 
            turnCost: turnCost ? turnCost : 1
        };
    }

    /**
     * Save the complete state of the game to localStorage.
     */

    private saveGame = (): void => {
        try {
            window.localStorage.setItem(
                localKeys[LocalKey.HasActiveGame], '1'
            );
            window.localStorage.setItem(
                localKeys[LocalKey.Trains], btoa(JSON.stringify(this.data.trains.map(e => e.deconstruct())))
            );
            window.localStorage.setItem(
                localKeys[LocalKey.Resources], btoa(JSON.stringify(this.data.resources.map(e => e.deconstruct())))
            );
            window.localStorage.setItem(
                localKeys[LocalKey.Upgrades], btoa(JSON.stringify(this.data.upgrades.map(e => e.deconstruct())))
            );
            window.localStorage.setItem(
                localKeys[LocalKey.Cities], btoa(JSON.stringify(this.data.cities.map(e => e.deconstruct())))
            );
            window.localStorage.setItem(
                localKeys[LocalKey.Players], btoa(JSON.stringify(this.players.map(e => e.deconstruct())))
            );
            window.localStorage.setItem(
                localKeys[LocalKey.CurrentPlayer], btoa(this._currentPlayer.id)
            );
            window.localStorage.setItem(
                localKeys[LocalKey.Stocks], btoa(JSON.stringify(Object.keys(this.stocks).map(key => ({
                    key,
                    stock: this.stocks[key].deconstruct()
                }))))
            );
            window.localStorage.setItem(
                localKeys[LocalKey.Turn], btoa(this._turn.toString())
            );
        } catch(err) {
            console.log(err);
        }
    }

    /**
     * Get Nardis instance from saved localStorage data.
     * 
     * @returns {Nardis} Nardis instance recreated from localStorage.
     */

    public static createFromLocalStorage= (): Nardis => {
        if (!window.localStorage.getItem(localKeys[LocalKey.HasActiveGame])) {
            throw new Error('cannot recreate from empty storage');
        }

        const trainsRaw                 = JSON.parse(atob(
            window.localStorage.getItem(localKeys[LocalKey.Trains])
        ));
        const citiesRaw                 = JSON.parse(atob(
            window.localStorage.getItem(localKeys[LocalKey.Cities])
        ));
        const resourcesRaw              = JSON.parse(atob(
            window.localStorage.getItem(localKeys[LocalKey.Resources])
        ));
        const upgradesRaw               = JSON.parse(atob(
            window.localStorage.getItem(localKeys[LocalKey.Upgrades])
        ));
        const playersRaw                = JSON.parse(atob(
            window.localStorage.getItem(localKeys[LocalKey.Players])
        ));
        const currentPlayerRaw          = atob(
            window.localStorage.getItem(localKeys[LocalKey.CurrentPlayer])
        );
        const stocks                    = {};
        JSON.parse(atob(
            window.localStorage.getItem(localKeys[LocalKey.Stocks])
        )).forEach(e => {
            stocks[e.key] = Stock.createFromStringifiedJSON(e.stock);
        });

        const trains       : Train[]    = trainsRaw.map(
            trainString   => Train.createFromStringifiedJSON(trainString)
        );
        const upgrades     : Upgrade[]  = upgradesRaw.map(
            upgradeString => Upgrade.createFromStringifiedJSON(upgradeString)
        );
        const resources    : Resource[] = resourcesRaw.map(
            resourceString => Resource.createFromStringifiedJSON(resourceString)
        );
        const cities       : City[]     = citiesRaw.map(
            cityString => City.createFromStringifiedJSON(cityString, resources)
        );
        const players      : Player[]   = playersRaw.map(
            playerString => {
                const re: RegExpExecArray = /^.+playerType\":(\d).+$/.exec(playerString);
                if (re && re[1]) {
                    if (parseInt(re[1]) === PlayerType.Computer) {
                        return Opponent.createFromStringifiedJSON(playerString, cities, trains, resources, upgrades);
                    }
                }
                return Player.createFromStringifiedJSON(playerString, cities, trains, resources, upgrades);
            }
        );
        const currentPlayer: Player     = players.filter(player => player.id === currentPlayerRaw)[0];
        const turn         : number     = parseInt(atob(window.localStorage.getItem(localKeys[LocalKey.Turn])));

        return new Nardis(
            {
                trains,
                upgrades,
                resources,
                cities
            },
            players,
            stocks,
            currentPlayer,
            turn
        );
    }

    /**
     * Create a Nardis instance from one to three parameters. 
     * 
     * @param   {string}   name      - String with name of player.
     * @param   {number}   gold      - (optional) Number specifying start gold.
     * @param   {number}   opponents - (optional) Number specifying number of opponents.
     * 
     * @returns {Nardis}   Created Nardis instance.
     */

    public static createFromPlayer = (name: string, gold: number = START_GOLD, opponents: number = START_OPPONENTS): Nardis => {
        const data: RawDataModel = generateData();
        const resources: Resource[] = data.resources.map(resource => Resource.createFromModel(resource));
        const cities: City[] = data.cities.map(city => City.createFromModel(city, resources));
        const startCities: City[] = cities.filter(city => city.isStartCity);
        const nStartCities: number = startCities.length; const nOpponents: number = opponents + 1;
        const [players, stocks]: [Player[], Stocks] = Nardis.createPlayersAndStock(name, gold, opponents, startCities);
        if (nStartCities >= nOpponents) {
            return new Nardis({
                resources,
                cities,
                trains: data.trains.map(train => Train.createFromModel(train)),
                upgrades: data.upgrades.map(upgrade => Upgrade.createFromModel(upgrade))
            },
            players, stocks);
        } else {
            throw new Error(`not enough start cities '${nStartCities}' to satisfy number of players '${nOpponents}'`)
        }
    }

    /**
     * Generate Players and Stocks.
     * 
     * @param   {string}  name      - String with name of human Player.
     * @param   {number}  gold      - Number with starting gold.
     * @param   {number}  opponents - Number of Opponents to generate.
     * @param   {City[]}  cities    - Array of City instances.
     * 
     * @returns {[Player[], Stocks]} Tuple with array of Players and a Stocks object. 
     */

    private static createPlayersAndStock = (name: string, gold: number, opponents: number, cities: City[]): [Player[], Stocks] => {
        const players: Player[] = [];
        const stocks: Stocks = {};
        for (let i = 0; i < opponents; i++) {
            const opponent: Opponent = new Opponent(genericOpponentsName.pop(), gold, cities.pop());
            stocks[opponent.id] = new Stock(opponent.name, opponent.id);
            players.push(opponent);
        }
        const player: Player = new Player(name, gold, PlayerType.Human, cities.pop());
        stocks[player.id] = new Stock(player.name, player.id);
        return [[player, ...players], stocks];
    }
}