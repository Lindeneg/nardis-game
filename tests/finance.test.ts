import Finance from '../src/modules/core/player/finance';
import Stock from '../src/modules/core/player/stock';
import Upgrade from '../src/modules/core/player/upgrade';
import Route from '../src/modules/core/route';
import {
    FinanceType
} from '../src/types/types';
import {
    localKeys,
    netWorthDivisors,
    START_GOLD,
    stockConstant
} from '../src/util/constants';
import { getRouteConfig } from './data';

// TODO test stock buy/sell

const data = getRouteConfig();
const { c1, c2, t1, distance, r1, r2} = data.data.initiated;
const routePlanCargo = data.routePlanCargo;
const handleTurnData = data.data.handleTurnData;

const upkeepUpgrade = new Upgrade(
    data.data.upgrades[3].name,
    data.data.upgrades[3].cost,
    data.data.upgrades[3].value,
    data.data.upgrades[3].type,
    data.data.upgrades[3].levelRequired
);

const route = new Route(
    'testRoute',
    c1,
    c2,
    t1,
    routePlanCargo,
    distance,
    0,
    0
);

const finance = new Finance('test', 'test2', START_GOLD);
const stock = new Stock('test', 'test2', 0);
const history = finance.getHistory();

const handleTurn = {
    ...handleTurnData,
    playerData: {
        routes: [route],
        upgrades: [],
        queue: [],
        gameStocks: {
            test2: stock
        }
    }
};

let turnCount = 1;

test('can initialize Finance correctly', () => {
    expect(finance.name).toEqual('test');
    expect(finance.getGold()).toEqual(START_GOLD);
    expect(finance.getNetWorth()).toEqual(START_GOLD + stockConstant.startingShares * stockConstant.multipliers.stockHolder);
});

test('can add to Finance expense history', () => {
    finance.addToFinanceExpense(
        FinanceType.Track,
        'test route',
        1,
        200
    );
    expect(history.expense.nthTurn.length).toEqual(1);
    expect(history.expense.nthTurn[0].id).toEqual('test route');
    expect(history.expense.nthTurn[0].type).toEqual(FinanceType.Track);
    expect(history.expense.nthTurn[0].amount).toEqual(1);
    expect(history.expense.nthTurn[0].value).toEqual(200);
    expect(finance.getTotalHistory()[localKeys[FinanceType.Track]]).toEqual(200);
    expect(finance.getTotalProfits()).toEqual(START_GOLD-200);
    expect(finance.getGold()).toEqual(START_GOLD - 200);
});

test('can remove from Finance expense history', () => {
    const didRemove = finance.removeFromFinanceExpense(FinanceType.Track, 'test route');
    expect(didRemove).toBe(true);
    expect(history.expense.nthTurn.length).toEqual(0);
    expect(finance.getTotalHistory()[localKeys[FinanceType.Track]]).toEqual(0);
    expect(finance.getTotalProfits()).toEqual(START_GOLD);
    expect(finance.getGold()).toEqual(START_GOLD);
});

for (turnCount < 100; turnCount++;) {
    route.handleTurn({
        ...handleTurn,
        turn: turnCount
    });
    if (route.getRouteState().hasArrived) { 
        break; 
    }
}

test('can handle route on turns', () => {
    finance.handleTurn({
        ...handleTurn,
        turn: turnCount++
    });
    const value = r1.resource.getValue() * 4;
    expect(history.income.nthTurn.length).toEqual(1);
    expect(history.income.nthTurn[0].id).toEqual(r1.resource.id);
    expect(history.income.nthTurn[0].type).toEqual(FinanceType.Resource);
    expect(history.income.nthTurn[0].amount).toEqual(4);
    expect(history.income.nthTurn[0].value).toEqual(r1.resource.getValue());
    expect(finance.getGold()).toEqual(START_GOLD + value - route.getTrain().upkeep);
    expect(finance.getNetWorth()).toEqual(
        ((Math.floor(START_GOLD / netWorthDivisors.gold)) + value - route.getTrain().upkeep) +
        Math.floor(route.getCost() / netWorthDivisors.tracks) +
        Math.floor(route.getTrain().cost / netWorthDivisors.train) 
    );
    expect(finance.getTotalHistory()[r1.resource.id]).toEqual(value);
});
 
test('can shift history array on turn change', () => {
    route.handleTurn({
        ...handleTurn,
        turn: turnCount++
    })
    finance.handleTurn({
        ...handleTurn,
        turn: turnCount++
    });
    expect(history.income.nthTurn.length).toEqual(0);
    expect(history.income.nthTurnMinusOne.length).toEqual(1);
});

test('can get average revenue over last three turns', () => {
    const expectedAverageRevenue = Math.round((r1.resource.getValue() * 4) / 3);
    expect(finance.getAverageRevenue()).toEqual(expectedAverageRevenue);
});

test('can reconstruct finance base properties', () => {
    const deconstructed = finance.deconstruct();
    const reconstructed = Finance.createFromStringifiedJSON(deconstructed);

    expect(reconstructed.equals(finance)).toBe(true);
    expect(reconstructed.name).toEqual(finance.name);
    expect(reconstructed.getGold()).toEqual(finance.getGold());
    expect(reconstructed.getNetWorth()).toEqual(finance.getNetWorth());
    expect(reconstructed.getAverageRevenue()).toEqual(finance.getAverageRevenue());
});

test('can reconstruct finance history property', () => {
    const deconstructed = finance.deconstruct();
    const reconstructed = Finance.createFromStringifiedJSON(deconstructed);
    const [h1, h2] = [reconstructed.getHistory(), finance.getHistory()];

    expect(h1.income.nthTurn.length).toEqual(h2.income.nthTurn.length);
    expect(h1.income.nthTurnMinusOne.length).toEqual(h2.income.nthTurnMinusOne.length);
    expect(h1.income.nthTurnMinusTwo.length).toEqual(h2.income.nthTurnMinusTwo.length);
    expect(h1.expense.nthTurn.length).toEqual(h2.expense.nthTurn.length);
    expect(h1.expense.nthTurnMinusOne.length).toEqual(h2.expense.nthTurnMinusOne.length);
    expect(h1.expense.nthTurnMinusTwo.length).toEqual(h2.expense.nthTurnMinusTwo.length);


    expect(h1.income.nthTurnMinusOne[0].amount).toEqual(h2.income.nthTurnMinusOne[0].amount);
    expect(h1.income.nthTurnMinusOne[0].id).toEqual(h2.income.nthTurnMinusOne[0].id);
    expect(h1.income.nthTurnMinusOne[0].type).toEqual(h2.income.nthTurnMinusOne[0].type);
    expect(h1.income.nthTurnMinusOne[0].value).toEqual(h2.income.nthTurnMinusOne[0].value);
});

test('can handle player upgrades', () => {
    const predictedUpkeep = route.getTrain().upkeep - Math.floor(route.getTrain().upkeep * upkeepUpgrade.value);
    route.handleTurn({
        ...handleTurn,
        turn: 1
    });
    finance.handleTurn({
        ...handleTurn,
        playerData: {
            routes: [route],
            upgrades: [upkeepUpgrade],
            queue: [],
            gameStocks: {}
        },
        turn: 10
    });
    expect(finance.getHistory().expense.nthTurn[0].value).toEqual(predictedUpkeep);
    expect(finance.getNetWorth()).toEqual(
        Math.floor(finance.getGold() / netWorthDivisors.gold) +
        Math.floor(route.getCost() / netWorthDivisors.tracks) +
        Math.floor(route.getTrain().cost / netWorthDivisors.train) +
        Math.floor(upkeepUpgrade.cost / netWorthDivisors.upgrade)
    );
});