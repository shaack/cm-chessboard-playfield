/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {Fen} from "cm-chess/src/Fen.js"
import {Chess} from "cm-chess/src/Chess.js"
import {COLOR} from "cm-chessboard/src/Chessboard.js"
import {Extension} from "cm-chessboard/src/model/Extension.js"
import {MARKER_TYPE} from "cm-chessboard/src/extensions/markers/Markers.js"
import {Observed} from "cm-web-modules/src/observed/Observed.js"
import {PlayfieldMarkers} from "./PlayfieldMarkers.js"
import {LocalPlayer} from "./players/LocalPlayer.js"
import {RandomPlayer} from "./players/RandomPlayer.js"

export class Playfield extends Extension {

    constructor(chessboard, props = {}) {
        super(chessboard)
        this.props = {
            playerColor: COLOR.white,
            player: {name: "Local Player", type: LocalPlayer},
            opponent: {name: "Random Player", type: RandomPlayer},
            markers: {
                move: MARKER_TYPE.frame,
                lastMove: MARKER_TYPE.frame,
                check: MARKER_TYPE.circleDanger,
                checkMate: MARKER_TYPE.circleDanger,
                validMove: MARKER_TYPE.dot,
                validMoveCapture: MARKER_TYPE.bevel
            },
            accessibility: {
                brailleNotationInAlt: true,
                movePieceForm: true,
                boardAsTable: true,
                piecesAsList: true,
                visuallyHidden: true
            }
        }
        this.state = new Observed({
            chess: new Chess(),
            moveShown: null,
            player: new this.props.player.type(this, this.props.player.name),
            opponent: new this.props.opponent.type(this, this.props.opponent.name)
        })
        Object.assign(this.props, props)
        this.chessboard.addExtension(PlayfieldMarkers, this.props.markers)

        this.registerMethod("chess", () => {
            return this.state.chess
        })
        this.state.chess.addObserver(() => {
        })
        this.state.addObserver(() => {
            const fenOfMoveShown = new Fen(this.state.moveShown.fen)
            console.log(this.chessboard.getPosition(), fenOfMoveShown.position)
            if (this.chessboard.getPosition() !== this.state.moveShown.position) {
                this.chessboard.setPosition(this.state.moveShown.fen, true)
            }
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
        const moveResult = this.state.chess.move(move)
        if (!moveResult) {
            if (this.props.debug) {
                console.error("illegalMove", this.state.chess, move)
                throw Error("illegalMove")
            }
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
