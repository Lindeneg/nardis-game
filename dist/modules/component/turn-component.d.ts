import BaseComponent from './base-component';
import { HandleTurnInfo } from '../../types/types';
/**
 * Abstract class used to guarantee handleTurn method
 *
 * @constructor
 * @param {string} name - name of the component
 */
export default abstract class TurnComponent extends BaseComponent {
    constructor(name: string);
    abstract handleTurn(info: HandleTurnInfo): void;
}
