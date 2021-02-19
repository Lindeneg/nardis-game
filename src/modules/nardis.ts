import City from './core/city';
import Route from './core/route';
import Upgrade from './core/player/upgrade';
import Player from './core/player/player';
import Train from './core/train';
import Resource from './core/resource';
import Finance from './core/player/finance';
import Opponent from './core/player/opponent/opponent';
import Stock from './core/player/stock';
import { genericOpponentsName } from '../data/preparedData';
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
    Indexable
} from '../types/types';
import {
    localKeys, START_GOLD, START_OPPONENTS
} from '../util/constants';
import {
    generateData
} from '../data/data';
import {
    getRangeTurnCost, isDefined
} from '../util/util';
import { 
    RawDataModel 
} from '../types/model';


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

        this.updatePlayersNetWorth();
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
        const upgrades: Upgrade[] = this._currentPlayer.getUpgrades().filter((upgrade: Upgrade): boolean => upgrade.type === UpgradeType.TrainValueCheaper);
        return this.data.trains.map((train: Train): AdjustedTrain => {
            let cost: number = train.cost;
            upgrades.forEach((upgrade: Upgrade): void => {
                cost -= Math.floor(cost * upgrade.value);
            });
            return {
                train,
                cost
            };
        });
    }

    /**
     * // TODO update winning condition when net worth and stock is implemented
     */

    public hasAnyPlayerWon = (): {player: Player, hasWon: boolean} => {
        const result = this.players.filter(player => player.getFinance().getGold() > 10000);
        return {
            player: result ? result[0] : null,
            hasWon: !!result
        };
    }

    /**
     * Add an entry to Player queue.
     * 
     * @param {BuyableRoute} buyableRoute - BuyableRoute to add.
     */

    public addRouteToPlayerQueue = (buyableRoute: BuyableRoute): void => {
        const route: Route = new Route(
            `${buyableRoute.cityOne.name} <--> ${buyableRoute.cityTwo.name}`,
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
        if (matchedUpgrade) {
            this._currentPlayer.addUpgrade(matchedUpgrade[0]);
            this._currentPlayer.getFinance().addToFinanceExpense(
                FinanceType.Upgrade,
                matchedUpgrade[0].id,
                1,
                matchedUpgrade[0].cost
            );
            return true;
        }
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

    public changeActivePlayerRoute = (routeId: string, train: Train, routePlan: RoutePlanCargo, cost: number): boolean => {
        const routes: Route[] = this._currentPlayer.getRoutes().filter(e => e.id === routeId);
        if (routes.length > 0) {
            if (cost > 0) {
                this._currentPlayer.getFinance().addToFinanceExpense(FinanceType.Train, train.id, 1, cost);
            }
            routes[0].change(train, routePlan);
            return true;
        }
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
        const stockOwner: Player = this.players.filter((player: Player): boolean => player.id === playerId)[0];
        if (isDefined(this.stocks[playerId]) && isDefined(stockOwner)) {
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
                return true;
            }
        }
        return false;
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
                localKeys[LocalKey.CurrentPlayer], btoa(JSON.stringify(this._currentPlayer.deconstruct()))
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
        const currentPlayerRaw          = JSON.parse(atob(
            window.localStorage.getItem(localKeys[LocalKey.CurrentPlayer])
        ));
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
        const currentPlayer: Player     = players.filter(player => player.id === currentPlayerRaw.id)[0];
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