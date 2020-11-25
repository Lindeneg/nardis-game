import { GameEvent } from '../../types/types';
export default class NardisEvent {
    private static gameEvents;
    private static currentGameEvents;
    static getAllEvents: () => GameEvent[];
    static getGameEvents: () => GameEvent[];
    static getCurrentGameEvents: () => GameEvent[];
    static logEvent: (event: GameEvent) => void;
    static endTurn: () => void;
    private static getEventLogLevel;
}
