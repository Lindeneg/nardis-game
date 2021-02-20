import { stockConstant } from '../src/util/constants';
import Finance from '../src/modules/core/player/finance';
import Stock from '../src/modules/core/player/stock';

// TODO

const stock = new Stock('tests', 'test2');
const finance = new Finance('testf', 'test2', 0);
const { startingShares, baseValue,multipliers } = stockConstant;

test('can get initial sell value', () => {
    expect(stock.getSellValue()).toEqual(
        Math.floor(startingShares * multipliers.stockHolder) + baseValue
    );
});

test('can get initial buy value', () => {
    expect(stock.getBuyValue()).toEqual(Math.floor(
        (Math.floor(startingShares * multipliers.stockHolder) + baseValue) *
        multipliers.stockBuy
    ));
});

test('can get calculate new sell value', () => {
    stock.buyStock('test2');
    stock.updateValue(finance, 0, 2)
    expect(stock.getSellValue()).toEqual(
        Math.floor((startingShares + 1) * multipliers.stockHolder) + baseValue
    );
});

test('can get calculate new buy value', () => {
    stock.buyStock('test2');
    stock.updateValue(finance, 0, 3);
    expect(stock.getBuyValue()).toEqual(Math.floor(
        (Math.floor((startingShares + 2) * multipliers.stockHolder) + baseValue) *
        multipliers.stockBuy
    ));
});

