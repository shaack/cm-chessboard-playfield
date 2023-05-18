/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {Markers} from "cm-chessboard/src/extensions/markers/Markers.js"
import {PLAYFIELD_MESSAGES} from "../Playfield.js"
import {Chess} from "cm-chess/src/Chess.js"

export class PlayfieldMarkers extends Markers {
    constructor(chessboard, props = {}) {
        super(chessboard, props)
        props.playfield.messageBroker.subscribe(PLAYFIELD_MESSAGES.gameMoveIllegal, (data) => {
            this.markIllegalMove(data.from, data.to)
        })
        props.playfield.state.addObserver((event) => {
           console.log("event", event)
            this.markLastMove(event.value)
        }, ["moveShown"])
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
        this.chessboard.addMarker(this.props.markers.lastMove, move.from)
        this.chessboard.addMarker(this.props.markers.lastMove, move.to)
        if (move.inCheck || move.inCheckmate) {
            const tmpChess = new Chess(move.fen)
            const kingSquare = tmpChess.pieces("k", tmpChess.turn())[0]
            this.chessboard.addMarker(this.props.markers.check, kingSquare.square)
        }
    }
}
