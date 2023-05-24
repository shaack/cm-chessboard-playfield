/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */

export class PlayfieldPlayer {

    constructor(playfield, name) {
        if (new.target === PlayfieldPlayer) {
            throw new TypeError("Player is an abstract class, it can't be instantiated directly.")
        }
        this.playfield = playfield
        this.name = name
        this.state = {}
    }

    /**
     * Called by the playfield, when the player should make a move.
     * @param moveResponse a callback to call as the moveResponse. Parameter is an object,
     * containing a `move` object. Example: `moveResult = moveResponse({from: "e2", to: "e4", promotion: ""})`.
     */
    moveRequest(moveResponse) {
    }

}
