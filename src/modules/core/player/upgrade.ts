import BaseComponent from '../../component/base-component';
import {
    UpgradeType,
    PlayerLevel
} from '../../../types/types';
import {
    UpgradeModel
} from '../../../types/model';

/**
 * Base Upgrade class. Does nothing thus far besides having readonly values.
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

export default class Upgrade extends BaseComponent {

    readonly type         : UpgradeType;
    readonly value        : number;
    readonly levelRequired: PlayerLevel;
    readonly cost         : number;

    constructor(
        name              : string,
        cost              : number,
        value             : number,
        type              : UpgradeType,
        levelRequired     : PlayerLevel,
        id               ?: string
    ) {
        super(name, id);

        this.type          = type;
        this.value         = value;
        this.levelRequired = levelRequired;
        this.cost          = cost;
    }

    /**
     * Get Upgrade instance from a UpgradeModel.
     * 
     * @param {UpgradeModel}  model - UpgradeModel to be used.
     * 
     * @return {Upgrade}              Upgrade instance created from the model.
     */

    public static createFromModel = (model: UpgradeModel): Upgrade => {
        return new Upgrade(
            model.name,
            model.cost,
            model.value,
            model.type,
            model.levelRequired
        );
    }

    /**
     * Get Upgrade instance from stringified JSON.
     * 
     * @param {string}  stringifiedJSON - String with information to be used.
     * 
     * @return {Upgrade}                  Upgrade instance created from the string.
     */

    public static createFromStringifiedJSON = (stringifiedJSON: string): Upgrade => {
        const parsedJSON: any = JSON.parse(stringifiedJSON);
        return new Upgrade(
            parsedJSON.name,
            parsedJSON.cost,
            parsedJSON.value,
            parsedJSON.type,
            parsedJSON.levelRequired,
            parsedJSON.id
        );
    }
}