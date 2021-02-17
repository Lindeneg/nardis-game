import { ISaveable } from '../../types/types';
/**
 * Abstract class used to guarantee some properties and methods.
 *
 * @constructor
 * @param {string} name - String describing name.
 * @param {string} id   - (optional) String number describing id.
 */
export default abstract class BaseComponent implements ISaveable {
    readonly id: string;
    readonly name: string;
    constructor(name: string, id?: string);
    /**
     * @returns {boolean} True if instances has same id else false.
    */
    equals: (other: BaseComponent) => boolean;
    /**
     * Deconstruction for localStorage use.
    */
    abstract deconstruct(): string;
}
