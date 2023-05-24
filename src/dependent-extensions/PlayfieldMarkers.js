/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {MARKER_TYPE, Markers} from "cm-chessboard/src/extensions/markers/Markers.js"
import {Playfield} from "../Playfield.js"
import {Chess} from "cm-chess/src/Chess.js"
import {EXTENSION_POINT} from "cm-chessboard/src/model/Extension.js"
import {INPUT_EVENT_TYPE} from "cm-chessboard/src/Chessboard.js"

export class PlayfieldMarkers extends Markers {
    constructor(chessboard, props = {}) {
        super(chessboard, props)
        this.props = {
            autoMarkers: {...MARKER_TYPE.frame},
            markers: {
                lastMove: {...MARKER_TYPE.frame},
                check: {...MARKER_TYPE.circleDanger},
                checkMate: {...MARKER_TYPE.circleDanger},
                illegalMove: {...MARKER_TYPE.frameDanger},
                validMove: {...MARKER_TYPE.dot},
                validMoveCapture: {...MARKER_TYPE.bevel},
                premove: {...MARKER_TYPE.framePrimary}
            }
        }
        Object.assign(this.props, props)
        this.playfield = chessboard.getExtension(Playfield)
        this.registerExtensionPoint(EXTENSION_POINT.moveInput, (data) => {
            if(data.type !== INPUT_EVENT_TYPE.movingOverSquare && data.type !== INPUT_EVENT_TYPE.moveInputFinished) {
                chessboard.removeMarkers(this.props.markers.validMove)
                chessboard.removeMarkers(this.props.markers.validMoveCapture)
            }
            if(data.moveInputCallbackResult === false) {
                this.markIllegalMove(data.squareFrom, data.squareTo)
            } else {
                if(data.type === INPUT_EVENT_TYPE.moveInputStarted) {
                    const moves = this.playfield.state.chess.moves({square: data.squareFrom, verbose: true})
                    for (const move of moves) { // draw dots on valid moves
                        if (move.promotion && move.promotion !== "q") {
                            continue
                        }
                        if (this.playfield.state.chess.piece(move.to)) {
                            chessboard.addMarker(this.props.markers.validMoveCapture, move.to)
                        } else {
                            chessboard.addMarker(this.props.markers.validMove, move.to)
                        }
                    }
                }
            }
        })
        this.chessboard.addPremoveMarker = (square) => {
            this.chessboard.addMarker(this.props.markers.premove, square)
        }
        this.chessboard.removePremoveMarkers = () => {
            this.chessboard.removeMarkers(this.props.markers.premove)
        }
        this.playfield.state.addObserver((event) => {
            this.markLastMove(event.value)
        }, ["moveShown"])
        this.markLastMove(this.playfield.state.moveShown)
    }
    markIllegalMove(from, to) {
        if(this.playfield.state.player.state.premoving) {
            return
        }
        this.chessboard.removeMarkers(this.props.markers.illegalMove)
        clearTimeout(this.removeMarkersTimeout)
        this.chessboard.addMarker(this.props.markers.illegalMove, from)
        if (to) {
            this.chessboard.addMarker(this.props.markers.illegalMove, to)
        }
        this.removeMarkersTimeout = setTimeout(() => {
            this.chessboard.removeMarkers(this.props.markers.illegalMove)
        }, 500)
    }

    markLastMove(move) {
        this.chessboard.removeMarkers(this.props.markers.check)
        this.chessboard.removeMarkers(this.props.markers.lastMove)
        if(move) {
            this.chessboard.addMarker(this.props.markers.lastMove, move.from)
            this.chessboard.addMarker(this.props.markers.lastMove, move.to)
            if (move.inCheck || move.inCheckmate) {
                const tmpChess = new Chess(move.fen)
                const kingSquare = tmpChess.pieces("k", tmpChess.turn())[0]
                this.chessboard.addMarker(this.props.markers.check, kingSquare.square)
            }
        } else {
            const chess = this.playfield.state.chess
            if (chess.inCheck() || chess.inCheckmate()) {
                const kingSquare = chess.pieces("k", chess.turn())[0]
                this.chessboard.addMarker(this.props.markers.check, kingSquare.square)
            }
        }
    }

}
