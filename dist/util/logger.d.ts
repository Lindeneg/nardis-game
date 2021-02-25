import { LogLevel } from '../types/types';
/**
 * Very basic static logging class for debugging purposes.
 */
export default class Logger {
    private static turn;
    static setTurn: (turn: number) => void;
    static log: (level: LogLevel, origin: string, msg: string, ...rest: any[]) => void;
    private static shouldLog;
}
