import {COLOR} from "cm-chessboard"

/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard
 * License: MIT, see file 'LICENSE'
 */
const {Chess} = await import(nodeModulesUrl + "cm-chess/src/Chess.js")
const {COLOR} = await import(nodeModulesUrl + "cm-chessboard/src/Chessboard.js")
const {Extension} = await import(nodeModulesUrl + "cm-chessboard/src/model/Extension.js")
const {Observed} = await import(nodeModulesUrl + "cm-web-modules/src/observed/Observed.js")

export class ChessGame extends Extension {
    constructor(chessboard, props = {}) {
        super(chessboard)
        this.props = {
            orientation: COLOR.white
        }
        this.state = new Observed({
            chess: new Chess()
        })
        Object.assign(this.props, props)
        this.registerMethod("chess", () => {
            return this.state.chess
        })
    }
}
