import { stockConstant } from '../src/util/constants';
import Finance from '../src/modules/core/player/finance';
import Stock from '../src/modules/core/player/stock';

const stock = new Stock('tests', 'test2');
const finance = new Finance('testf', 'test2', 0);

test('can get initial sell value', () => {
    expect(stock.getSellValue()).toEqual(
        Math.floor(stockConstant.startingShares * stockConstant.multipliers.stockHolder)
    );
});

test('can get initial buy value', () => {
    expect(stock.getBuyValue()).toEqual(Math.floor(
        Math.floor(stockConstant.startingShares * stockConstant.multipliers.stockHolder) *
        stockConstant.multipliers.stockBuy
    ));
});

test('can get calculate new sell value', () => {
    stock.buyStock('test2');
    stock.updateValue(finance, 0, 2)
    expect(stock.getSellValue()).toEqual(
        Math.floor((stockConstant.startingShares + 1) * stockConstant.multipliers.stockHolder)
    );
});

test('can get calculate new buy value', () => {
    stock.buyStock('test2');
    stock.updateValue(finance, 0, 3)
    expect(stock.getBuyValue()).toEqual(Math.floor(
        Math.floor((stockConstant.startingShares + 2) * stockConstant.multipliers.stockHolder) *
        stockConstant.multipliers.stockBuy
    ));
});

