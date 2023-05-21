/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {Chess} from "cm-chess/src/Chess.js"
import {COLOR} from "cm-chessboard/src/Chessboard.js"
import {Extension} from "cm-chessboard/src/model/Extension.js"
import {Observed} from "cm-web-modules/src/observed/Observed.js"
import {LocalPlayer} from "./players/LocalPlayer.js"
import {RandomPlayer} from "./players/RandomPlayer.js"

export class Playfield extends Extension {

    constructor(chessboard, props = {}) {
        super(chessboard)
        this.props = {
            playerColor: COLOR.white,
            player: {name: "Local Player", type: LocalPlayer},
            opponent: {name: "Random Player", type: RandomPlayer}
        }
        this.state = new Observed({
            chess: new Chess(chessboard.props.position),
            moveShown: null,
            player: new this.props.player.type(this, this.props.player.name),
            opponent: new this.props.opponent.type(this, this.props.opponent.name)
        })
        Object.assign(this.props, props)
        this.chessboard.state.chess = this.state.chess
        this.state.addObserver(() => {
            this.chessboard.setPosition(this.state.moveShown.fen, true)
        }, ["moveShown"])
        this.nextMove()
    }

    playerToMove() {
        return this.state.chess.turn() === this.props.playerColor ? this.state.player : this.state.opponent
    }

    nextMove() {
        const playerToMove = this.playerToMove()
        if (playerToMove) {
            playerToMove.moveRequest(this.handleMoveResponse.bind(this))
        }
    }

    handleMoveResponse(move) {
        // console.log("handleMoveResponse", move)
        const moveResult = this.state.chess.move(move)
        if (!moveResult) {
            console.error("illegalMove", this.state.chess, move)
            return moveResult
        }
        if (this.state.moveShown === this.state.chess.lastMove().previous) {
            this.state.moveShown = this.state.chess.lastMove()
        }
        if (!this.state.chess.gameOver()) {
            this.nextMove()
        }
        return moveResult
    }

}
