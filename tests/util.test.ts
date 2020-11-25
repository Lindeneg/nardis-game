import {
    randomNumber,
    getPlayerLevelFromNumber,
    degreesToRadians,
    createId,
    generateArrayOfRandomNames,
    getLowYieldResourceModels,
    getMediumYieldResourceModels,
    getHighYieldResources
} from '../src/util/util';
import {
    PlayerLevel
} from '../src/types/types';


test('can generate random number', () => {
    const min = 0;
    const max = 11;
    const errors = [];
    for (let _ = 0; _ < 500; _++) {
        const n: number = randomNumber(min, max);
        if (n < min || n > max) {
            errors.push(n);
        }
    }
    expect(errors.length).toEqual(0);
});

test('can get PlayerLevel None from number', () => {
    expect(getPlayerLevelFromNumber(0)).toEqual(PlayerLevel.None);
});

test('can get PlayerLevel Novice from number', () => {
    expect(getPlayerLevelFromNumber(1)).toEqual(PlayerLevel.Novice);
});

test('can get PlayerLevel Intermediate from number', () => {
    expect(getPlayerLevelFromNumber(2)).toEqual(PlayerLevel.Intermediate);
});

test('can get PlayerLevel Advanced from number', () => {
    expect(getPlayerLevelFromNumber(3)).toEqual(PlayerLevel.Advanced);
});

test('can get PlayerLevel Master from number', () => {
    expect(getPlayerLevelFromNumber(4)).toEqual(PlayerLevel.Master);
});

test('can convert degrees to radians', () => {
    expect(degreesToRadians(180).toFixed(3)).toEqual("3.142");
});

test('can create id string', () => {
    expect(createId().length).toEqual(32);
});

const randomNames = generateArrayOfRandomNames(15, 4, 7, []);

test('can generate array with correct length of random names', () => {
    expect(randomNames.length).toEqual(15);
});

test('can generate array of random names with correct length', () => {
    expect(randomNames.filter(e => {
        return e.length < 4 || e.length > 7; 
    }).length).toEqual(0);
});

test('can get low yield resources', () => {
    const r = getLowYieldResourceModels();
    expect(
        r.filter(e => {
            return e.value > e.maxValue || e.value < e.minValue; 
        }).length
    ).toEqual(0);
});

test('can get medium yield resources', () => {
    const r = getMediumYieldResourceModels();
    expect(
        r.filter(e => {
            return e.value > e.maxValue || e.value < e.minValue; 
        }).length
    ).toEqual(0);
});

test('can get high yield resources', () => {
    const r = getHighYieldResources();
    expect(
        r.filter(e => {
            return e.value > e.maxValue || e.value < e.minValue; 
        }).length
    ).toEqual(0);
});