/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */

export class Player {

    constructor(playfield, name) {
        if (new.target === Player) {
            throw new TypeError("Player is an abstract class, it can't be instantiated directly.")
        }
        this.playfield = playfield
        this.name = name
    }

    /**
     * Called, when the GameOfChess requests the next Move from a Player.
     * The Player should answer the moveRequest with a moveResponse.
     * The moveResponse then returns the move result, if no move result was returned, the move was not legal.
     * @param fen current position
     * @param moveResponse a callback function to call as the moveResponse. Parameter is an object,
     * containing a `move` object. Example: `moveResult = moveResponse({from: "e2", to: "e4", promotion: ""})`.
     */
    moveRequest(fen, moveResponse) {
    }

}
