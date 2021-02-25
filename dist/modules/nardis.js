"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Nardis = void 0;
var city_1 = require("./core/city");
var route_1 = require("./core/route");
var upgrade_1 = require("./core/player/upgrade");
var player_1 = require("./core/player/player");
var train_1 = require("./core/train");
var resource_1 = require("./core/resource");
var opponent_1 = require("./core/player/opponent/opponent");
var stock_1 = require("./core/player/stock");
var logger_1 = require("../util/logger");
var preparedData_1 = require("../data/preparedData");
var data_1 = require("../data/data");
var util_1 = require("../util/util");
var constants_1 = require("../util/constants");
var types_1 = require("../types/types");
/**
 * @constructor
 * @param {GameData} data          - Object with GameData.
 * @param {Player[]} players       - Array with Players.
 * @param {Stocks}   stocks        - Object with Stocks.
 *
 * @param {Player}   currentPlayer - (optional) Player instance of the current turn taker.
 * @param {number}   turn          - (optional) Number describing the current turn.
 */
var Nardis = /** @class */ (function () {
    function Nardis(gameData, players, stocks, currentPlayer, turn) {
        var _this = this;
        this.getCurrentPlayer = function () { return _this._currentPlayer; };
        this.getCurrentTurn = function () { return _this._turn; };
        /**
         * Runs at the end of each human Player turn.
         */
        this.endTurn = function () {
            _this._currentPlayer.handleTurn({
                turn: _this._turn,
                data: _this.data,
                playerData: {
                    routes: _this._currentPlayer.getRoutes(),
                    upgrades: _this._currentPlayer.getUpgrades(),
                    queue: _this._currentPlayer.getQueue()
                }
            });
            _this.handleComputerTurn();
            __spreadArrays(_this.data.cities, _this.data.resources).forEach(function (turnComponent) {
                turnComponent.handleTurn({ turn: _this._turn, data: _this.data, playerData: { routes: [], upgrades: [], queue: [] } });
            });
            _this._turn++;
            _this.updateStocks();
            _this.updatePlayersNetWorth();
            _this.saveGame();
            logger_1.default.setTurn(_this._turn);
        };
        /**
         * Get array of PotentialRoute objects respecting the current Players maximum range.
         *
         * @param   {City}              origin - City instance of initial departure.
         *
         * @returns {PotentialRoute[]}  Array of PotentialRoutes.
         */
        this.getArrayOfPossibleRoutes = function (origin) {
            var constraint = _this._currentPlayer.getRange();
            var potentialRoutes = [];
            _this.data.cities.forEach(function (city) {
                var distance = city.distanceTo(origin);
                var _a = _this.getPotentialRouteCost(distance), goldCost = _a.goldCost, turnCost = _a.turnCost;
                if (distance > 0 && distance <= constraint) {
                    potentialRoutes.push({
                        cityOne: origin,
                        cityTwo: city,
                        distance: distance,
                        goldCost: goldCost,
                        turnCost: turnCost,
                        purchasedOnTurn: _this._turn
                    });
                }
            });
            return potentialRoutes;
        };
        /**
         * @returns {AdjustedTrain[]} Array of Trains with their cost adjusted to reflect potential Player Upgrades.
         */
        this.getArrayOfAdjustedTrains = function () {
            var upgrades = _this._currentPlayer.getUpgrades().filter(function (upgrade) { return upgrade.type === types_1.UpgradeType.TrainValueCheaper; });
            return _this.data.trains.map(function (train) {
                var cost = train.cost;
                upgrades.forEach(function (upgrade) {
                    cost -= Math.floor(cost * upgrade.value);
                });
                return { train: train, cost: cost };
            });
        };
        /**
         * Check if a single Player is left and thus is the winner of the game.
         *
         * @returns {GameStatus} GameStatus of the Nardis instance in question.
         */
        this.getGameStatus = function () {
            var winner = _this.players.filter(function (player) { return player.isActive(); });
            var id = '';
            var gameOver = false;
            if (winner.length === 1) {
                _this.log("'" + winner[0].name + "' is the only active player left");
                id = winner[0].id;
                gameOver = true;
            }
            return { id: id, gameOver: gameOver };
        };
        /**
         * Add an entry to Player queue.
         *
         * @param {BuyableRoute} buyableRoute - BuyableRoute to add.
         */
        this.addRouteToPlayerQueue = function (buyableRoute) {
            var route = new route_1.default('', buyableRoute.cityOne, buyableRoute.cityTwo, buyableRoute.train, buyableRoute.routePlanCargo, buyableRoute.distance, buyableRoute.goldCost, buyableRoute.purchasedOnTurn);
            _this.handleNewRoutePlayerFinance(buyableRoute, route.id);
            _this._currentPlayer.addRouteToQueue(route, buyableRoute.turnCost);
        };
        /**
         * Add Upgrade to Player.
         *
         * @param   {string}   id - String with id of Upgrade to add.
         *
         * @returns {boolean}  True if Upgrade was added else false.
         */
        this.addUpgradeToPlayer = function (id) {
            var matchedUpgrade = _this.data.upgrades.filter(function (upgrade) { return upgrade.id === id; });
            if (matchedUpgrade.length > 0) {
                _this.log("adding upgrade '" + id + "' to '" + _this._currentPlayer.name + "'");
                _this._currentPlayer.addUpgrade(matchedUpgrade[0]);
                _this._currentPlayer.getFinance().addToFinanceExpense(types_1.FinanceType.Upgrade, matchedUpgrade[0].id, 1, matchedUpgrade[0].cost);
                return true;
            }
            _this.log("upgrade '" + id + "' could not be found in game data");
            return false;
        };
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
        this.changeActivePlayerRoute = function (routeId, train, routePlan, cost) {
            var routes = _this._currentPlayer.getRoutes().filter(function (e) { return e.id === routeId; });
            if (routes.length > 0) {
                if (cost > 0) {
                    _this._currentPlayer.getFinance().addToFinanceExpense(types_1.FinanceType.Train, train.id, 1, cost);
                }
                routes[0].change(train, routePlan);
                return true;
            }
            _this.log("route '" + routeId + "' not found in '" + _this._currentPlayer.name + "' data for editing");
            return false;
        };
        /**
         * Remove an entry from Player queue.
         *
         * @param   {string}   routeId - String with id of Route to remove.
         * @param   {string}   trainId - String with id of Train in Route.
         *
         * @returns {boolean}  True if Route was removed from queue else false.
         */
        this.removeRouteFromPlayerQueue = function (routeId, trainId) {
            return _this.handleRemoveRouteFromPlayerFinance(routeId, trainId) && _this._currentPlayer.removeRouteFromQueue(routeId);
        };
        /**
         * Remove an entry from Player routes.
         *
         * @param   {string}   routeId  - String with id of Route to remove.
         * @param   {number}   value    - Number wih gold to recoup.
         *
         * @returns {boolean}  True if Route was removed from routes else false.
         */
        this.removeRouteFromPlayerRoutes = function (routeId, value) {
            if (_this._currentPlayer.removeRouteFromRoutes(routeId)) {
                _this._currentPlayer.getFinance().recoupDeletedRoute(value);
                return true;
            }
            _this.log("route '" + routeId + "' not found in '" + _this._currentPlayer.name + "' data for deletion");
            return false;
        };
        /**
         * Buyout Player(s) of a certain Stock and take over the owning Player.
         *
         * @param   {string}  playerId   - String with Id of the 'losing' Player.
         *
         * @param   {boolean} selfBuyOut - (optional) Boolean describing if the takeover is from/to the same Player.
         *
         * @returns {boolean} True if Player was bought out else False.
         */
        this.buyOutPlayer = function (playerId, selfBuyOut) {
            if (selfBuyOut === void 0) { selfBuyOut = false; }
            _this.log("'" + _this._currentPlayer.name + "' is attempting to buyout '" + playerId + "' stock");
            var stock = _this.stocks[playerId];
            var diff = constants_1.stockConstant.maxStockAmount - stock.getSupply()[_this._currentPlayer.id];
            var cpFinance = _this._currentPlayer.getFinance();
            if (stock.currentAmountOfStockHolders() >= constants_1.stockConstant.maxStockAmount) {
                var mLosingPlayer = _this.players.filter(function (e) { return e.id === playerId; });
                if (mLosingPlayer.length > 0) {
                    var losingPlayer_1 = mLosingPlayer[0];
                    var expense_1 = 0;
                    var nShareHolders_1 = 0;
                    stock.getBuyOutValues().forEach(function (buyout) {
                        if (buyout.id !== _this._currentPlayer.id) {
                            var mStockHolder = _this.players.filter(function (e) { return e.id === buyout.id; });
                            if (buyout.shares > 0 && mStockHolder.length > 0) {
                                var stockHolder = mStockHolder[0];
                                if (buyout.id === losingPlayer_1.id && !selfBuyOut) {
                                    losingPlayer_1.getFinance().sellStock(losingPlayer_1.id, 0, buyout.shares);
                                    stock.sellStock(losingPlayer_1.id, buyout.shares);
                                    _this.log("took over " + buyout.shares + " shares from losing player '" + losingPlayer_1.name + "'");
                                }
                                else {
                                    stockHolder.getFinance().sellStock(playerId, buyout.totalValue, buyout.shares);
                                    stock.sellStock(stockHolder.id, buyout.shares);
                                    _this.log("bought out " + buyout.shares + " shares from '" + stockHolder.name + "' for " + buyout.totalValue + "g");
                                    nShareHolders_1++;
                                }
                                expense_1 += buyout.totalValue;
                            }
                        }
                    });
                    cpFinance.addToFinanceExpense(types_1.FinanceType.StockBuy, constants_1.localKeys[types_1.FinanceType.StockBuy], 1, expense_1);
                    for (var i = 0; i < diff; i++) {
                        stock.buyStock(_this._currentPlayer.id);
                        cpFinance.buyStock(playerId, 0);
                    }
                    _this.log("bought out " + nShareHolders_1 + " shareholders for a total of " + expense_1 + "g");
                    !selfBuyOut ? _this.playerTakeOver(_this._currentPlayer, losingPlayer_1, stock) : null;
                    return true;
                }
                else {
                    _this.log("could not find player from id '" + playerId + "'");
                }
            }
            else {
                _this.log("could not buyout '" + playerId + "' as not all supply has been consumed");
            }
            return false;
        };
        /**
         * Buy Stock to the Player of the current turn.
         *
         * @param   {string}  playerId - String with id of the owning player of Stock to buy.
         *
         * @returns {boolean} True if Stock was bought else false.
         */
        this.buyStock = function (playerId) { return _this.performStockAction(playerId, true); };
        /**
         * Sell Stock to the Player of the current turn.
         *
         * @param   {string}  playerId - String with id of the owning player of Stock to sell.
         *
         * @returns {boolean} True if Stock was sold else false.
         */
        this.sellStock = function (playerId) { return _this.performStockAction(playerId, false); };
        /**
         * Clear the saved game state from localStorage.
         */
        this.clearStorage = function () {
            _this.log("clearing " + constants_1.localKeys + " keys from localStorage");
            constants_1.localKeys.forEach(function (key) {
                window.localStorage.removeItem(key);
            });
        };
        /**
         * Buy or Sell Stock to the Player of the current turn.
         *
         * @param   {string}  playerId - String with id of the owning player of Stock to buy/sell.
         * @param   {boolean} buy      - True if action should be buy, false if action should be sell.
         *
         * @returns {boolean} True if action was performed else false.
         */
        this.performStockAction = function (playerId, buy) {
            var mStockOwner = _this.players.filter(function (player) { return player.id === playerId; });
            if (util_1.isDefined(_this.stocks[playerId]) && mStockOwner.length > 0) {
                var stockOwner = mStockOwner[0];
                var value = (buy ?
                    _this.stocks[playerId].getBuyValue() :
                    _this.stocks[playerId].getSellValue());
                var didSomething = (buy ?
                    _this.stocks[playerId].buyStock(_this._currentPlayer.id) :
                    _this.stocks[playerId].sellStock(_this._currentPlayer.id));
                if (didSomething) {
                    var finance = _this._currentPlayer.getFinance();
                    (buy ?
                        finance.buyStock(playerId, value) :
                        finance.sellStock(playerId, value));
                    _this.updateStock(stockOwner);
                    _this.updatePlayerNetWorth(_this._currentPlayer);
                    _this.updatePlayerNetWorth(stockOwner);
                    _this.log("'" + _this._currentPlayer.name + "' " + (buy ? 'bought' : 'sold') + " stock from '" + stockOwner.name + "' for " + value + "g");
                    buy ? _this.checkIfPlayerIsFullyOwned(stockOwner) : null;
                    return true;
                }
            }
            _this.log("'" + _this._currentPlayer.name + "' could not " + (buy ? 'buy' : 'sell') + " stock '" + playerId + "'");
            return false;
        };
        /**
         * Check if a Player is fully owned by a foreign Player. If so, perform a Player takeover.
         *
         * @param {Player} stockOwner - Player instance to check if owned by another Player.
         */
        this.checkIfPlayerIsFullyOwned = function (stockOwner) {
            var supply = _this.stocks[stockOwner.id].getSupply();
            if (supply[_this._currentPlayer.id] >= constants_1.stockConstant.maxStockAmount && stockOwner.id !== _this._currentPlayer.id) {
                _this.log("'" + _this._currentPlayer.name + "' now owns 100% of '" + stockOwner.name);
                _this.playerTakeOver(_this._currentPlayer, stockOwner, _this.stocks[stockOwner.id]);
            }
        };
        /**
         * Update the net worth of every Player in the game.
         */
        this.updatePlayersNetWorth = function () { return _this.players.forEach(function (player) {
            _this.updatePlayerNetWorth(player);
        }); };
        /**
         * Update net worth of a single Player
         *
         * @param {Player} player - Player instance whose net worth to update.
         */
        this.updatePlayerNetWorth = function (player) { return player.getFinance().updateNetWorth({
            routes: player.getRoutes(),
            queue: player.getQueue(),
            upgrades: player.getUpgrades(),
            gameStocks: _this.stocks
        }); };
        /**
         * Update the value of every Stock in game.
         */
        this.updateStocks = function () { return _this.players.forEach(function (player) {
            _this.updateStock(player);
        }); };
        /**
         * Update value of Stock associated with a given Player.
         *
         * @param {Player} player - Player instance whose Stock value should be updated.
         */
        this.updateStock = function (player) {
            _this.stocks[player.id].updateValue(player.getFinance(), player.getRoutes().length + player.getQueue().length, _this._turn);
        };
        /**
         * Merge loser Player with victor Player, if the latter is taking over the former.
         * Merge all Routes, Upgrades, Gold and Stock.
         *
         * @param {Player} victor - Player instance taking over.
         * @param {Player} loser  - Player instance being taken over.
         * @param {Stock}  stock  - Stock instance of the losing Player.
         */
        this.playerTakeOver = function (victor, loser, stock) {
            _this.log("commencing '" + victor.name + "' takeover of '" + loser.name + "'");
            var vFinance = victor.getFinance();
            var lFinance = loser.getFinance();
            var profit = lFinance.getGold();
            if (profit > 0) {
                vFinance.sellStock(loser.id, profit, 0);
                lFinance.addToFinanceExpense(types_1.FinanceType.StockBuy, constants_1.localKeys[types_1.FinanceType.StockBuy], 1, profit);
            }
            var r = victor.mergeQueue(loser.getQueue());
            var q = victor.mergeRoutes(loser.getRoutes());
            var _a = _this.mergeStock(victor, loser), sh = _a[0], st = _a[1];
            _this.log("merged " + profit + "g, " + r + " routes, " + q + " queue and " + sh + " shares distributed between " + st + " stocks");
            loser.setInactive();
            stock.setInactive(_this._turn);
            _this.updateStocks();
            _this.updatePlayersNetWorth();
        };
        /**
         * Merge losing Player Stock into winning Player Stock.
         *
         * @param {Player} victor - Player instance taking over.
         * @param {Player} loser  - Player instance being taken over.
         *
         * @returns {[number, number]} Tuple with two numbers describing merged amount of Stock and shares.
         */
        this.mergeStock = function (victor, loser) {
            _this.log("merging '" + loser.name + "' stock to '" + victor.name + "' holdings");
            var mergedStock = 0;
            var mergedShares = 0;
            var vFinance = victor.getFinance();
            var lFinance = loser.getFinance();
            var lStocks = lFinance.getStocks();
            Object.keys(lStocks).forEach(function (key) {
                if (key !== loser.id && lStocks[key] > 0) {
                    var stock = _this.stocks[key];
                    var amount = lStocks[key];
                    lFinance.sellStock(key, 0, amount);
                    stock.sellStock(loser.id, amount);
                    mergedShares += amount;
                    mergedStock++;
                    for (var i = 0; i < amount; i++) {
                        vFinance.buyStock(key, 0);
                        stock.buyStock(victor.id);
                    }
                    _this.log("merged " + amount + " shares from stock '" + key + "'");
                }
            });
            return [mergedStock, mergedShares];
        };
        /**
         * Iterate over each Computer player and handle their turns accordingly.
         */
        this.handleComputerTurn = function () {
            var actualPlayer = _this._currentPlayer;
            _this.players.forEach(function (player) {
                if (player.playerType === types_1.PlayerType.Computer) {
                    _this._currentPlayer = player;
                    player.handleTurn({ turn: _this._turn,
                        data: _this.data,
                        playerData: {
                            routes: player.getRoutes(),
                            upgrades: player.getUpgrades(),
                            queue: player.getQueue(),
                            gameStocks: _this.stocks
                        } }, _this);
                }
            });
            _this._currentPlayer = actualPlayer;
        };
        /**
         * Handle Player expenses when purchasing a new Route and Train.
         *
         * @param {BuyableRoute} buyableRoute - BuyableRoute object.
         * @param {string}       id           - String with id of the Route.
         */
        this.handleNewRoutePlayerFinance = function (buyableRoute, id) {
            var finance = _this._currentPlayer.getFinance();
            finance.addToFinanceExpense(types_1.FinanceType.Track, id, 1, buyableRoute.goldCost);
            finance.addToFinanceExpense(types_1.FinanceType.Train, buyableRoute.train.id, 1, buyableRoute.trainCost);
        };
        /**
         * Remove Player expenses when reverting the purchase of Route and Train.
         *
         * @param   {string}   routeId - String with id of Route to remove.
         * @param   {string}   trainId - String with id of Train in Route.
         *
         * @returns {boolean}  True if removed from Finance else false.
         */
        this.handleRemoveRouteFromPlayerFinance = function (routeId, trainId) {
            var finance = _this._currentPlayer.getFinance();
            return (finance.removeFromFinanceExpense(types_1.FinanceType.Track, routeId) &&
                finance.removeFromFinanceExpense(types_1.FinanceType.Train, trainId));
        };
        /**
         * Get an object describing the gold and turn cost for a given Route with Upgrades taken into account.
         *
         * @param   {number}  distance - String with id of Route to remove.
         *
         * @returns {Object}  Object with gold and turn cost for a given distance
         */
        this.getPotentialRouteCost = function (distance) {
            var upgrades = _this._currentPlayer.getUpgrades();
            var valUp = upgrades.filter(function (upgrade) { return upgrade.type === types_1.UpgradeType.TrackValueCheaper; });
            var turnUp = upgrades.filter(function (upgrade) { return upgrade.type === types_1.UpgradeType.TurnCostCheaper; });
            var goldCost = distance * 2;
            var turnCost = util_1.getRangeTurnCost(distance);
            valUp.forEach(function (e) {
                var value = Math.floor(goldCost * e.value);
                if (goldCost - value < 10) {
                    goldCost = 10;
                }
                else {
                    goldCost -= value;
                }
            });
            turnUp.forEach(function (e) {
                if (turnCost >= 2) {
                    turnCost -= e.value;
                }
            });
            return {
                goldCost: goldCost,
                turnCost: turnCost ? turnCost : 1
            };
        };
        /**
         * Save the complete state of the game to localStorage.
         */
        this.saveGame = function () {
            try {
                window.localStorage.setItem(constants_1.localKeys[types_1.LocalKey.HasActiveGame], '1');
                window.localStorage.setItem(constants_1.localKeys[types_1.LocalKey.Trains], btoa(JSON.stringify(_this.data.trains.map(function (e) { return e.deconstruct(); }))));
                window.localStorage.setItem(constants_1.localKeys[types_1.LocalKey.Resources], btoa(JSON.stringify(_this.data.resources.map(function (e) { return e.deconstruct(); }))));
                window.localStorage.setItem(constants_1.localKeys[types_1.LocalKey.Upgrades], btoa(JSON.stringify(_this.data.upgrades.map(function (e) { return e.deconstruct(); }))));
                window.localStorage.setItem(constants_1.localKeys[types_1.LocalKey.Cities], btoa(JSON.stringify(_this.data.cities.map(function (e) { return e.deconstruct(); }))));
                window.localStorage.setItem(constants_1.localKeys[types_1.LocalKey.Players], btoa(JSON.stringify(_this.players.map(function (e) { return e.deconstruct(); }))));
                window.localStorage.setItem(constants_1.localKeys[types_1.LocalKey.CurrentPlayer], btoa(_this._currentPlayer.id));
                window.localStorage.setItem(constants_1.localKeys[types_1.LocalKey.Stocks], btoa(JSON.stringify(Object.keys(_this.stocks).map(function (key) { return ({
                    key: key,
                    stock: _this.stocks[key].deconstruct()
                }); }))));
                window.localStorage.setItem(constants_1.localKeys[types_1.LocalKey.Turn], btoa(_this._turn.toString()));
            }
            catch (err) {
                console.log(err);
            }
        };
        this.data = gameData;
        this.players = players;
        this.stocks = stocks;
        this._currentPlayer = currentPlayer ? currentPlayer : this.players[0];
        this._turn = turn ? turn : 1;
        this.log = logger_1.default.log.bind(null, types_1.LogLevel.All, 'nardis-game');
        this.updatePlayersNetWorth();
        logger_1.default.setTurn(this._turn);
    }
    /**
     * Get Nardis instance from saved localStorage data.
     *
     * @returns {Nardis} Nardis instance recreated from localStorage.
     */
    Nardis.createFromLocalStorage = function () {
        if (!window.localStorage.getItem(constants_1.localKeys[types_1.LocalKey.HasActiveGame])) {
            throw new Error('cannot recreate from empty storage');
        }
        var trainsRaw = JSON.parse(atob(window.localStorage.getItem(constants_1.localKeys[types_1.LocalKey.Trains])));
        var citiesRaw = JSON.parse(atob(window.localStorage.getItem(constants_1.localKeys[types_1.LocalKey.Cities])));
        var resourcesRaw = JSON.parse(atob(window.localStorage.getItem(constants_1.localKeys[types_1.LocalKey.Resources])));
        var upgradesRaw = JSON.parse(atob(window.localStorage.getItem(constants_1.localKeys[types_1.LocalKey.Upgrades])));
        var playersRaw = JSON.parse(atob(window.localStorage.getItem(constants_1.localKeys[types_1.LocalKey.Players])));
        var currentPlayerRaw = atob(window.localStorage.getItem(constants_1.localKeys[types_1.LocalKey.CurrentPlayer]));
        var stocks = {};
        JSON.parse(atob(window.localStorage.getItem(constants_1.localKeys[types_1.LocalKey.Stocks]))).forEach(function (e) {
            stocks[e.key] = stock_1.default.createFromStringifiedJSON(e.stock);
        });
        var trains = trainsRaw.map(function (trainString) { return train_1.default.createFromStringifiedJSON(trainString); });
        var upgrades = upgradesRaw.map(function (upgradeString) { return upgrade_1.default.createFromStringifiedJSON(upgradeString); });
        var resources = resourcesRaw.map(function (resourceString) { return resource_1.default.createFromStringifiedJSON(resourceString); });
        var cities = citiesRaw.map(function (cityString) { return city_1.default.createFromStringifiedJSON(cityString, resources); });
        var players = playersRaw.map(function (playerString) {
            var re = /^.+playerType\":(\d).+$/.exec(playerString);
            if (re && re[1]) {
                if (parseInt(re[1]) === types_1.PlayerType.Computer) {
                    return opponent_1.default.createFromStringifiedJSON(playerString, cities, trains, resources, upgrades);
                }
            }
            return player_1.default.createFromStringifiedJSON(playerString, cities, trains, resources, upgrades);
        });
        var currentPlayer = players.filter(function (player) { return player.id === currentPlayerRaw; })[0];
        var turn = parseInt(atob(window.localStorage.getItem(constants_1.localKeys[types_1.LocalKey.Turn])));
        return new Nardis({
            trains: trains,
            upgrades: upgrades,
            resources: resources,
            cities: cities
        }, players, stocks, currentPlayer, turn);
    };
    /**
     * Create a Nardis instance from one to three parameters.
     *
     * @param   {string}   name      - String with name of player.
     * @param   {number}   gold      - (optional) Number specifying start gold.
     * @param   {number}   opponents - (optional) Number specifying number of opponents.
     *
     * @returns {Nardis}   Created Nardis instance.
     */
    Nardis.createFromPlayer = function (name, gold, opponents) {
        if (gold === void 0) { gold = constants_1.START_GOLD; }
        if (opponents === void 0) { opponents = constants_1.START_OPPONENTS; }
        var data = data_1.generateData();
        var resources = data.resources.map(function (resource) { return resource_1.default.createFromModel(resource); });
        var cities = data.cities.map(function (city) { return city_1.default.createFromModel(city, resources); });
        var startCities = cities.filter(function (city) { return city.isStartCity; });
        var nStartCities = startCities.length;
        var nOpponents = opponents + 1;
        var _a = Nardis.createPlayersAndStock(name, gold, opponents, startCities), players = _a[0], stocks = _a[1];
        if (nStartCities >= nOpponents) {
            return new Nardis({
                resources: resources,
                cities: cities,
                trains: data.trains.map(function (train) { return train_1.default.createFromModel(train); }),
                upgrades: data.upgrades.map(function (upgrade) { return upgrade_1.default.createFromModel(upgrade); })
            }, players, stocks);
        }
        else {
            throw new Error("not enough start cities '" + nStartCities + "' to satisfy number of players '" + nOpponents + "'");
        }
    };
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
    Nardis.createPlayersAndStock = function (name, gold, opponents, cities) {
        var players = [];
        var stocks = {};
        for (var i = 0; i < opponents; i++) {
            var opponent = new opponent_1.default(preparedData_1.genericOpponentsName.pop(), gold, cities.pop());
            stocks[opponent.id] = new stock_1.default(opponent.name, opponent.id);
            players.push(opponent);
        }
        var player = new player_1.default(name, gold, types_1.PlayerType.Human, cities.pop());
        stocks[player.id] = new stock_1.default(player.name, player.id);
        return [__spreadArrays([player], players), stocks];
    };
    return Nardis;
}());
exports.Nardis = Nardis;
