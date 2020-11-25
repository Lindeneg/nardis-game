import Resource from '../src/modules/core/resource';
import { 
    getTestData 
} from './data';


const data = getTestData();
const model = data.model.resources[0]
const resource = Resource.createFromModel(model);
const initialValue = resource.getValue();

test('can create Resource instance from model', () => {
    expect(model.name === resource.name).toBe(true);
    expect(model.value === initialValue).toBe(true);
    expect(model.weight === resource.getWeight()).toBe(true);
});

const turnChange = []
for (let i = 1; i < 50; i++) {
    resource.handleTurn({turn: i, playerData: {routes: [], upgrades: []}, data: {cities: [], resources: [], trains: [], upgrades: []}});
    let val = resource.getValue();
    if (val !== initialValue) {
        turnChange.push({amount: val, turn: i});
        break;
    }
}

test('can update Resource value over time', () => {
    expect(turnChange.length > 0).toBe(true);
});

test('can update value history on value change', () => {
    const history = resource.getValueHistory();
    expect(turnChange[0].amount === history[history.length - 1].value).toBe(true);
    expect(turnChange[0].turn === history[history.length - 1].turn).toBe(true);
});

test('can reconstruct resource base properties', () => {
    const stringifiedJSON = resource.deconstruct();
    const reconstructedResource = Resource.createFromStringifiedJSON(stringifiedJSON);

    expect(reconstructedResource.equals(resource)).toBe(true);
    expect(reconstructedResource.name).toEqual(resource.name);
    expect(reconstructedResource.getWeight()).toEqual(resource.getWeight());
});

test('can reconstruct resource value properties', () => {
    const stringifiedJSON = resource.deconstruct();
    const reconstructedResource = Resource.createFromStringifiedJSON(stringifiedJSON);

    expect(reconstructedResource.getValue()).toEqual(resource.getValue());
    expect(reconstructedResource.getMinValue()).toEqual(resource.getMinValue());
    expect(reconstructedResource.getMaxValue()).toEqual(resource.getMaxValue());
    expect(reconstructedResource.getValueVolatility()).toEqual(resource.getValueVolatility());
});

test('can reconstruct resource value history', () => {
    const stringifiedJSON = resource.deconstruct();
    const reconstructedResource = Resource.createFromStringifiedJSON(stringifiedJSON);
    const [h1, h2] = [reconstructedResource.getValueHistory(), resource.getValueHistory()];

    expect(h1.length).toEqual(h2.length);
    expect(h1[0].turn).toEqual(h2[0].turn);
    expect(h1[1].value).toEqual(h2[1].value);
});