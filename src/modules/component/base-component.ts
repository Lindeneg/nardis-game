import { 
    createId 
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
        this.id   = id ? id : createId();
        this.name = name;
    }

    /** 
     * @return {boolean} True if instances has same id else false.
    */

    public equals = (other: BaseComponent): boolean => {
        return this.id === other.id;
    }

    /** 
     * @return {string} String with JSON stringified property keys and values.
    */

    public deconstruct = (): string => JSON.stringify(this);
}