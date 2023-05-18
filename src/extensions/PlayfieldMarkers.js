/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {Markers} from "cm-chessboard/src/extensions/markers/Markers.js"
import {PLAYFIELD_MESSAGES} from "../Playfield.js"

export class PlayfieldMarkers extends Markers {
    constructor(chessboard, props = {}) {
        super(chessboard, props)
        props.messageBroker.subscribe(PLAYFIELD_MESSAGES.gameMoveIllegal, (data) => {
            this.markIllegalMove(data.from, data.to)
        })

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

    markLastMove(from, to) {

    }
}
