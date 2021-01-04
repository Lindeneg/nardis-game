import Player from '../player';
import Finance from '../finance';
import Upgrade from '../upgrade';
import Route from '../../route';
import City from '../../city';
import { HandleTurnInfo, QueuedRouteItem, PlayerLevel } from '../../../../types/types';
export default class Opponent extends Player {
    constructor(name: string, startCity: City, finance?: Finance, level?: PlayerLevel, queue?: QueuedRouteItem[], routes?: Route[], upgrades?: Upgrade[]);
    handleTurn: (info: HandleTurnInfo) => void;
    private deduceAction;
}
