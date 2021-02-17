import BaseComponent from '../component/base-component';
import { TrainModel } from '../../types/model';
/**
 * Base Train class. Does nothing thus far besides having readonly values.
 *
 * @constructor
 * @param {string} name          - String with name.
 * @param {number} cost          - Number with cost in gold.
 * @param {number} upkeep        - Number with upkeep per turn in gold.
 * @param {number} speed         - Number with speed in kilometers per turn.
 * @param {number} cargoSpace    - Number with max cargo space.
 * @param {number} levelRequired - Number with min level required.
 *
 * @param {string} id            - (optional) String number describing id.
 */
export default class Train extends BaseComponent {
    readonly cost: number;
    readonly upkeep: number;
    readonly speed: number;
    readonly cargoSpace: number;
    readonly levelRequired: number;
    constructor(name: string, cost: number, upkeep: number, speed: number, cargoSpace: number, levelRequired: number, id?: string);
    /**
     * @returns {string} String with JSON stringified property keys and values.
    */
    deconstruct: () => string;
    /**
     * Get Train instance from a ResourceModel.
     *
     * @param   {TrainModel}  model - TrainModel to be used.
     *
     * @returns {Train}       Train instance created from the model.
     */
    static createFromModel: (model: TrainModel) => Train;
    /**
     * Get Train instance from stringified JSON.
     *
     * @param   {string} stringifiedJSON - String with information to be used.
     *
     * @returns {Train}  Train instance created from the string.
     */
    static createFromStringifiedJSON: (stringifiedJSON: string) => Train;
}
