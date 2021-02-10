import BaseComponent from '../component/base-component';
import {
    TrainModel
} from '../../types/model';


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

    readonly cost         : number;
    readonly upkeep       : number;
    readonly speed        : number;
    readonly cargoSpace   : number;
    readonly levelRequired: number;

    constructor(
        name              : string,
        cost              : number,
        upkeep            : number,
        speed             : number,
        cargoSpace        : number,
        levelRequired     : number,
        id               ?: string
    ) {
        super(name, id);

        this.cost          = cost;
        this.upkeep        = upkeep;
        this.speed         = speed;
        this.cargoSpace    = cargoSpace;
        this.levelRequired = levelRequired;
    }

    /** 
     * @return {string} String with JSON stringified property keys and values.
    */
   
    public deconstruct = (): string => JSON.stringify(this)

    /**
     * Get Train instance from a ResourceModel.
     * 
     * @param {TrainModel}  model - TrainModel to be used.
     * 
     * @return {Train}              Train instance created from the model.
     */

    public static createFromModel = (model: TrainModel): Train => {
        return new Train(
            model.name,
            model.cost,
            model.upkeep,
            model.speed,
            model.cargoSpace,
            model.levelRequired
        );
    }

    /**
     * Get Train instance from stringified JSON.
     * 
     * @param {string}  stringifiedJSON - String with information to be used.
     * 
     * @return {Train}                    Train instance created from the string.
     */

    public static createFromStringifiedJSON = (stringifiedJSON: string): Train => {
        const parsedJSON: any = JSON.parse(stringifiedJSON);
        return new Train(
            parsedJSON.name,
            parsedJSON.cost,
            parsedJSON.upkeep,
            parsedJSON.speed,
            parsedJSON.cargoSpace,
            parsedJSON.levelRequired,
            parsedJSON.id
        );
    }
}