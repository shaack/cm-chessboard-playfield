/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
const {Markers} = await import(`${node_modules}/cm-chessboard/src/extensions/markers/Markers.js`)

export class PlayfieldMarkers extends Markers {
    constructor(chessboard, props = {}) {
        super(chessboard, props)
    }
}
