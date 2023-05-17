/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
const {Fen} = await import(`${node_modules}/cm-chess/src/Fen.js`)
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
            moveShown: null,
            player: new this.props.player.type(this, this.props.player.name),
            opponent: new this.props.opponent.type(this, this.props.opponent.name)
        })
        Object.assign(this.props, props)
        this.registerMethod("chess", () => {
            return this.state.chess
        })
        this.state.chess.addObserver(() => {
        })
        this.state.addObserver(() => {
            const fenOfMoveShown = new Fen(this.state.moveShown.fen)
            if (this.chessboard.getPosition() !== fenOfMoveShown.position) {
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
            playerToMove.moveRequest((move) => {
                setTimeout(() => {
                    this.handleMoveResponse(move)
                })
            })
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
        // if (this.state.moveShown === this.state.chess.lastMove().previousMove) {
            this.state.moveShown = this.state.chess.lastMove()
        // }
        if (!this.state.chess.gameOver()) {
            this.nextMove()
        }
        return moveResult
    }

}