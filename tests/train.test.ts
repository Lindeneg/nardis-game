import Train from '../src/modules/core/train';
import {
    PlayerLevel
} from '../src/types/types';


const model = {
    name: 'hello there',
    cost: 120,
    upkeep: 100,
    speed: 75,
    cargoSpace: 7,
    levelRequired: PlayerLevel.Novice
};
const train = Train.createFromModel(model);

test('can create train from model', () => {
    expect(train.name === model.name).toBe(true);
    expect(train.cost === model.cost).toBe(true);
    expect(train.upkeep === model.upkeep).toBe(true);
    expect(train.speed === model.speed).toBe(true);
    expect(train.cargoSpace === model.cargoSpace).toBe(true);
    expect(train.levelRequired === model.levelRequired).toBe(true);
});

test('can reconstruct train', () => {
    const stringifiedTrain = train.deconstruct();
    const reconstructedTrain = Train.createFromStringifiedJSON(stringifiedTrain);

    expect(reconstructedTrain.equals(train)).toBe(true);
    expect(train.name === reconstructedTrain.name).toBe(true);
    expect(train.cost === reconstructedTrain.cost).toBe(true);
    expect(train.upkeep === reconstructedTrain.upkeep).toBe(true);
    expect(train.speed === reconstructedTrain.speed).toBe(true);
    expect(train.cargoSpace === reconstructedTrain.cargoSpace).toBe(true);
    expect(train.levelRequired === reconstructedTrain.levelRequired).toBe(true);
});