import { Nardis } from '../src/modules/nardis';
import Opponent from '../src/modules/core/player/opponent/opponent';
import { START_GOLD } from '../src/util/constants';



const game = Nardis.createFromPlayer('test', START_GOLD, 1);

test('todo', () => {
    game.endTurn();
});