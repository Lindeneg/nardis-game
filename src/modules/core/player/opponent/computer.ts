import Player from '../player';
import Finance from '../finance';
import Upgrade from '../upgrade';
import Route from '../../route';
import City from '../../city';
import {
    HandleTurnInfo,
    QueuedRouteItem,
    PlayerType,
    PlayerLevel
} from '../../../../types/types';


export default class Opponent extends Player {
    constructor(
        name        : string,
        startCity   : City,
        finance    ?: Finance,
        level      ?: PlayerLevel,
        queue      ?: QueuedRouteItem[],
        routes     ?: Route[],
        upgrades   ?: Upgrade[]
    ) {
        super(name, PlayerType.Computer, startCity, finance, level, queue, routes, upgrades);
    }

    public handleTurn = (info: HandleTurnInfo) => {
        if (this.shouldLevelBeIncreased()) {
            this.increaseLevel();
        }
        this.handleQueue();
        this.handleRoutes(info);
        this.handleFinance(info);
        this.deduceAction();
    }

    private deduceAction = (): void => {

    }
}