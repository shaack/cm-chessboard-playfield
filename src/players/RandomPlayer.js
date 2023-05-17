/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {Chess} from "cm-chess/src/Chess.js"
import {PlayfieldPlayer} from "./PlayfieldPlayer.js"

export class RandomPlayer extends PlayfieldPlayer {

    constructor(playfield, name, props = {}) {
        super(playfield, name)
        this.chess = new Chess()
        this.props = {delay: 1000}
        Object.assign(this.props, props)
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    moveRequest(moveResponse) {
        setTimeout(() => {
            this.chess.load(this.playfield.state.chess.fen())
            const possibleMoves = this.chess.moves({verbose: true})
            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[this.random(0, possibleMoves.length - 1)]
                moveResponse(randomMove)
            }
        }, this.props.delay)
    }
}
