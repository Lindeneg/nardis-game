import { Nardis } from '../src/modules/nardis';
import { netWorthDivisors, stockConstant } from '../src/util/constants';

import { 
    PlayerType, 
    PlayerLevel 
} from '../src/types/types';
import {
    rangePerLevel
} from '../src/util/constants';
import Opponent from '../src/modules/core/player/opponent/opponent';
import { isDefined } from '../src';


const START_GOLD = 5000;
const game = Nardis.createFromPlayer('', START_GOLD, 1);
const opponent = game.players[1];
const finance = opponent.getFinance();


test('can initialize correctly', () => {
    expect(opponent.playerType).toEqual(PlayerType.Computer);
    expect(opponent.getLevel()).toEqual(PlayerLevel.Novice)
    expect(opponent.getStartCity().isStartCity).toBe(true);
});

test('can get correct range from opponent level', () => {
    expect(opponent.getRange()).toEqual(rangePerLevel[PlayerLevel.Novice]);
});

test('can get correct opponent finance', () => {
    expect(finance.getGold()).toEqual(START_GOLD);
    expect(finance.getNetWorth()).toEqual(START_GOLD + Math.floor(stockConstant.startingShares * (Math.floor(stockConstant.startingShares * stockConstant.multipliers.stockHolder) + stockConstant.baseValue)));
    expect(finance.getAverageRevenue()).toEqual(0);
    expect(finance.getAverageExpense()).toEqual(0);
    expect(finance.getTotalProfits()).toEqual(START_GOLD);
});

test('can handle first turn', () => {
    game.endTurn();
    expect(game.getCurrentTurn()).toBe(2);
});

test('can buy upgrades on first turn', () => {
    expect(opponent.getUpgrades().length).toBe(2);
});

test('can buy routes on first turn', () => {
    expect(opponent.getQueue().length).toBeGreaterThan(0);
});

test('can get finance on first turn', () => {
    const stocks = finance.getStocks();
    const profits = finance.getTotalProfits()
    expect(finance.getGold()).toEqual(profits);
    expect(finance.getNetWorth()).toEqual(opponent.getUpgrades()
        .map(e => Math.floor(e.cost / netWorthDivisors.upgrade))
        .reduce((a, b) => a + b, [...opponent.getQueue().map(k => k.route), ...opponent.getRoutes()]
            .map(e => Math.floor(e.getCost() / netWorthDivisors.tracks) + Math.floor(e.getTrain().cost / netWorthDivisors.train))
        .reduce((a, b) => a + b, 
            Math.floor((Object.keys(stocks).map((key: string): number => (
                isDefined(game.stocks[key]) ? game.stocks[key].getSellValue() * stocks[key] : 0
            )).reduce((a, b) => a + b, 0))) + 
            Math.floor(finance.getGold() / netWorthDivisors.gold)
        ))
    );
});

test('can handle second turn', () => {
    game.endTurn();
    expect(game.getCurrentTurn()).toBe(3);
});

test('can get finance on second turn', () => {
    const stocks = finance.getStocks();
    const profits = finance.getTotalProfits();
    expect(finance.getGold()).toEqual(profits);
    expect(finance.getNetWorth()).toEqual(opponent.getUpgrades()
        .map(e => Math.floor(e.cost / netWorthDivisors.upgrade))
        .reduce((a, b) => a + b, [...opponent.getQueue().map(k => k.route), ...opponent.getRoutes()]
            .map(e => Math.floor(e.getCost() / netWorthDivisors.tracks) + Math.floor(e.getTrain().cost / netWorthDivisors.train))
        .reduce((a, b) => a + b, 
            Math.floor((Object.keys(stocks).map((key: string): number => (
                isDefined(game.stocks[key]) ? game.stocks[key].getSellValue() * stocks[key] : 0
            )).reduce((a, b) => a + b, 0))) + 
            Math.floor(finance.getGold() / netWorthDivisors.gold)
        ))
    );
});

test('can generate revenue and expenses', () => {
    for (let i = 0; i < 50; i++) {
        game.endTurn();
    }
    expect(finance.getAverageRevenue()).toBeGreaterThan(0);
    expect(finance.getAverageExpense() * -1).toBeLessThan(0);
});

test('can keep money positive', () => {
    expect(opponent.getFinance().getGold()).toBeGreaterThan(0);
});

test('can get correct net worth', () => {
    const stocks = finance.getStocks();
    game.endTurn();
    expect(finance.getNetWorth()).toEqual(opponent.getUpgrades()
        .map(e => Math.floor(e.cost / netWorthDivisors.upgrade))
        .reduce((a, b) => a + b, [...opponent.getQueue().map(k => k.route), ...opponent.getRoutes()]
            .map(e => Math.floor(e.getCost() / netWorthDivisors.tracks) + Math.floor(e.getTrain().cost / netWorthDivisors.train))
        .reduce((a, b) => a + b, 
            Math.floor((Object.keys(stocks).map((key: string): number => (
                isDefined(game.stocks[key]) ? game.stocks[key].getSellValue() * stocks[key] : 0
            )).reduce((a, b) => a + b, 0))) + 
            Math.floor(finance.getGold() / netWorthDivisors.gold)
        ))
    );
});

test('can reconstruct opponent base properties', () => {
    const str = opponent.deconstruct();
    const rec = Opponent.createFromStringifiedJSON(str, game.data.cities, game.data.trains, game.data.resources, game.data.upgrades);
    expect(rec.equals(opponent)).toBe(true);
    expect(rec.name).toEqual(opponent.name);
    expect(rec.getLevel()).toEqual(opponent.getLevel());
    expect(rec.playerType).toEqual(opponent.playerType);
    expect(rec.getRange()).toEqual(opponent.getRange());
    expect(rec.getStartCity().equals(opponent.getStartCity())).toBe(true);
});

test('can reconstruct opponent finance properties', () => {
    const str = opponent.deconstruct();
    const rec = Opponent.createFromStringifiedJSON(str, game.data.cities, game.data.trains, game.data.resources, game.data.upgrades);
    const [f1, f2] = [rec.getFinance(), opponent.getFinance()];
    const [h1, h2] = [f1.getHistory(), f2.getHistory()];

    expect(f1.equals(f2)).toBe(true);
    expect(f1.getGold()).toEqual(f2.getGold());
    expect(f1.getAverageRevenue()).toEqual(f2.getAverageRevenue());

    expect(h1.income.nthTurn.length).toEqual(h2.income.nthTurn.length);
    expect(h1.income.nthTurnMinusOne.length).toEqual(h2.income.nthTurnMinusOne.length);
    expect(h1.income.nthTurnMinusTwo.length).toEqual(h2.income.nthTurnMinusTwo.length);

    expect(h1.expense.nthTurn.length).toEqual(h2.expense.nthTurn.length);
    expect(h1.expense.nthTurnMinusOne.length).toEqual(h2.expense.nthTurnMinusOne.length);
    expect(h1.expense.nthTurnMinusTwo.length).toEqual(h2.expense.nthTurnMinusTwo.length);
});

test('can reconstruct opponent routes', () => {
    const str = opponent.deconstruct();
    const rec = Opponent.createFromStringifiedJSON(str, game.data.cities, game.data.trains, game.data.resources, game.data.upgrades);
    const [r1, r2] = [rec.getRoutes(), opponent.getRoutes()];

    let i = 0; 

    r1.forEach(r => {
        if (r2.filter(e => e.equals(r)).length > 0) {
            i++;
        }
    });

    expect(rec.getQueue().length).toEqual(opponent.getQueue().length);
    expect(r1.length).toEqual(r2.length);
    expect(i).toEqual(r1.length);
});

test('can reconstruct opponent upgrades', () => {
    const str = opponent.deconstruct();
    const rec = Opponent.createFromStringifiedJSON(str, game.data.cities, game.data.trains, game.data.resources, game.data.upgrades);
    const [u1, u2] = [rec.getUpgrades(), opponent.getUpgrades()];

    expect(u1.length).toEqual(u2.length);
    expect(u1[0].equals(u2[0])).toBe(true);
});