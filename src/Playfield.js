/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard
 * License: MIT, see file 'LICENSE'
 */
const {Chess} = await import(`${node_modules}/cm-chess/src/Chess.js`)
const {COLOR} = await import(`${node_modules}/cm-chessboard/src/Chessboard.js`)
const {Extension} = await import(`${node_modules}/cm-chessboard/src/model/Extension.js`)
const {Observed} = await import(`${node_modules}/cm-web-modules/src/observed/Observed.js`)
const {MARKER_TYPE} = await import(`${node_modules}/cm-chessboard/src/extensions/markers/Markers.js`)
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
            moveShown: null
        })
        Object.assign(this.props, props)
        this.registerMethod("chess", () => {
            return this.state.chess
        })
        this.nextMove()
    }

    playerToMove() {
        return this.state.chess.turn() === this.props.playerColor ? this.props.player : this.props.opponent
    }

    nextMove() {
        const playerToMove = this.playerToMove()
        if (playerToMove) {
            setTimeout(() => {
                playerToMove.moveRequest(this.state.chess.fen(), (move) => {
                    return this.handleMoveResponse(move)
                })
            })
        }
    }

    handleMoveResponse(move) {
        const moveResult = this.state.chess.move(move)
        if (!moveResult) {
            if (this.props.debug) {
                console.warn("illegalMove", this.state.chess, move)
            }
            return moveResult
        }
        if (this.state.plyViewed === this.state.chess.plyCount() - 1) {
            this.state.plyViewed++
        }
        if (!this.state.chess.gameOver()) {
            this.nextMove()
        }
        return moveResult
    }

}
