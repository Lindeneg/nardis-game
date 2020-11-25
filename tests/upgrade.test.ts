import Upgrade from '../src/modules/core/player/upgrade';
import {
    PlayerLevel,
    UpgradeType
} from '../src/types/types';


const model = {
    name: 'hello there',
    cost: 120,
    value: 0.1,
    type: UpgradeType.TrainSpeedQuicker,
    levelRequired: PlayerLevel.Intermediate
};
const upgrade = Upgrade.createFromModel(model);

test('can create train from model', () => {
    expect(upgrade.name === model.name).toBe(true);
    expect(upgrade.cost === model.cost).toBe(true);
    expect(upgrade.value === model.value).toBe(true);
    expect(upgrade.type === model.type).toBe(true);
    expect(upgrade.levelRequired === model.levelRequired).toBe(true);
});

test('can reconstruct train', () => {
    const stringifiedTrain = upgrade.deconstruct();
    const reconstructedTrain = Upgrade.createFromStringifiedJSON(stringifiedTrain);

    expect(reconstructedTrain.equals(upgrade)).toBe(true);
    expect(upgrade.name === reconstructedTrain.name).toBe(true);
    expect(upgrade.cost === reconstructedTrain.cost).toBe(true);
    expect(upgrade.value === reconstructedTrain.value).toBe(true);
    expect(upgrade.type === reconstructedTrain.type).toBe(true);
    expect(upgrade.levelRequired === reconstructedTrain.levelRequired).toBe(true);
});