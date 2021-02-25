import { LogLevel } from '../types/types';
import { isNumber } from './util';


/**
 * Very basic static logging class for debugging purposes.   
 */

export default class Logger {

    private static turn: number = 0;

    public static setTurn = (turn: number) => { 
        Logger.turn = turn;
        Logger.shouldLog(1) ? console.log('\n\n') : null;
    }

    public static log = (level: LogLevel, origin: string, msg: string, ...rest: any[]): void => {
        if (Logger.shouldLog(level)) {
            console.log(`t${Logger.turn} : ${origin} => ${msg}`.toLowerCase(), ...rest);
        }
    }

    private static shouldLog = (level: LogLevel): boolean => {
        const n: number = parseInt(window['nardisDebug']);
        return isNumber(n) && n >= level;
    }
}