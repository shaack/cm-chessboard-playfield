/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {Markers} from "cm-chessboard/src/extensions/markers/Markers.js"
import {PLAYFIELD_MESSAGES} from "../Playfield.js"
import {Chess} from "cm-chess/src/Chess.js"

export class PlayfieldMarkers {
    constructor(playfield, props) {
        this.playfield = playfield
        this.props = props
        playfield.chessboard.addExtension(Markers, {
            autoMarkers: props.markers.move
        })
        playfield.messageBroker.subscribe(PLAYFIELD_MESSAGES.gameMoveIllegal, (data) => {
            this.markIllegalMove(data.from, data.to)
        })
        playfield.state.addObserver((event) => {
            this.markLastMove(event.value)
        }, ["moveShown"])
        this.markLastMove(playfield.state.moveShown)
    }
    markIllegalMove(from, to) {
        this.playfield.chessboard.removeMarkers(this.props.markers.illegalMove)
        clearTimeout(this.removeMarkersTimeout)
        this.playfield.chessboard.addMarker(this.props.markers.illegalMove, from)
        if (to) {
            this.playfield.chessboard.addMarker(this.props.markers.illegalMove, to)
        }
        this.removeMarkersTimeout = setTimeout(() => {
            this.playfield.chessboard.removeMarkers(this.props.markers.illegalMove)
        }, 500)
    }

    markLastMove(move) {
        this.playfield.chessboard.removeMarkers(this.props.markers.check)
        this.playfield.chessboard.removeMarkers(this.props.markers.lastMove)
        if(move) {
            this.playfield.chessboard.addMarker(this.props.markers.lastMove, move.from)
            this.playfield.chessboard.addMarker(this.props.markers.lastMove, move.to)
            if (move.inCheck || move.inCheckmate) {
                const tmpChess = new Chess(move.fen)
                const kingSquare = tmpChess.pieces("k", tmpChess.turn())[0]
                this.playfield.chessboard.addMarker(this.props.markers.check, kingSquare.square)
            }
        } else {
            const chess = this.playfield.state.chess
            if (chess.inCheck() || chess.inCheckmate()) {
                const kingSquare = chess.pieces("k", chess.turn())[0]
                this.playfield.chessboard.addMarker(this.props.markers.check, kingSquare.square)
            }
        }
    }

}
