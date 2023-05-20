/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {MARKER_TYPE, Markers} from "cm-chessboard/src/extensions/markers/Markers.js"
import {Playfield, PLAYFIELD_MESSAGES} from "../Playfield.js"
import {Chess} from "cm-chess/src/Chess.js"

export class PlayfieldMarkers extends Markers {
    constructor(chessboard, props = {}) {
        super(chessboard, props)
        this.props = {
            autoMarkers: MARKER_TYPE.frame,
            markers: {
                lastMove: {...MARKER_TYPE.frame},
                check: {...MARKER_TYPE.circleDanger},
                checkMate: {...MARKER_TYPE.circleDanger},
                illegalMove: {...MARKER_TYPE.frameDanger},
                validMove: {...MARKER_TYPE.dot},
                validMoveCapture: {...MARKER_TYPE.bevel}
            }
        }
        this.playfield = chessboard.getExtension(Playfield)
        console.log("this.playfield", this.playfield)
        this.playfield.messageBroker.subscribe(PLAYFIELD_MESSAGES.gameMoveIllegal, (data) => {
            this.markIllegalMove(data.from, data.to)
        })
        this.playfield.state.addObserver((event) => {
            this.markLastMove(event.value)
        }, ["moveShown"])
        this.markLastMove(this.playfield.state.moveShown)
    }
    markIllegalMove(from, to) {
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
