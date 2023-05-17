/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {Markers} from "cm-chessboard/src/extensions/markers/Markers.js"

export class PlayfieldMarkers extends Markers {
    constructor(chessboard, props = {}) {
        super(chessboard, props)
    }
}
