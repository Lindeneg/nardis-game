import { 
    createId, 
    isDefined 
} from '../../util/util';
import { 
    ISaveable 
} from '../../types/types';


/**
 * Abstract class used to guarantee some properties and methods.
 *
 * @constructor
 * @param {string} name - String describing name.
 * @param {string} id   - (optional) String number describing id.
 */

export default abstract class BaseComponent implements ISaveable {

    readonly id  : string;
    readonly name: string;

    constructor(name: string, id?: string) {
        this.id   = isDefined(id) ? id : createId();
        this.name = name;
    }

    /** 
     * @returns {boolean} True if instances has same id else false.
    */

    public equals = (other: BaseComponent): boolean => {
        return this.id === other.id;
    }

    /** 
     * Deconstruction for localStorage use.
    */

    public abstract deconstruct(): string;
}