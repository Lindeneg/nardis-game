import {
    GameEvent,
    EventLogLevel
} from '../../types/types';
import {
    eventLogLevelName
} from '../../util/constants';

// TODO

export default class NardisEvent  {
    private static gameEvents: GameEvent[]        = [];
    private static currentGameEvents: GameEvent[] = [];

    public static getAllEvents         = () => NardisEvent.gameEvents;
    public static getGameEvents        = () => NardisEvent.gameEvents.filter(e => e.level === EventLogLevel.GAME);
    public static getCurrentGameEvents = () => NardisEvent.currentGameEvents.filter(e => e.level === EventLogLevel.GAME);

    public static logEvent = (event: GameEvent) => {
       NardisEvent.currentGameEvents.push(event);
        if (event.level <= NardisEvent.getEventLogLevel()) {
            console.log('nardis ' + eventLogLevelName[event.level] + ' ' + event.origin + ': ' + event.message);
        }
    }

    public static endTurn = (): void => {
        NardisEvent.gameEvents        = [...NardisEvent.gameEvents, ...NardisEvent.currentGameEvents];
        NardisEvent.currentGameEvents = [];
    }

    private static getEventLogLevel = (): EventLogLevel => {
        window.location.search.replace('?', '').split('&').filter(param => {
            const [key, value] = param.split('=');
            if (key === 'nd') {
                const level: number = parseInt(value);
                return Number.isNaN(level) ? EventLogLevel.GAME : level;
            }
        });
        return EventLogLevel.GAME;
    }
}