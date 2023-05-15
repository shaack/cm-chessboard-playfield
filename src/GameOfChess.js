/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard
 * License: MIT, see file 'LICENSE'
 */
const {Chess} = await import(nodeModulesUrl + "cm-chess/src/Chess.js")
const {COLOR} = await import(nodeModulesUrl + "cm-chessboard/src/Chessboard.js")
const {Extension} = await import(nodeModulesUrl + "cm-chessboard/src/model/Extension.js")
const {Observed} = await import(nodeModulesUrl + "cm-web-modules/src/observed/Observed.js")
const {MARKER_TYPE} = await import(nodeModulesUrl + "cm-chessboard/src/extensions/markers/Markers.js")
import {LocalPlayer} from "./players/LocalPlayer.js"
import {RandomPlayer} from "./players/RandomPlayer.js"

export class GameOfChess extends Extension {
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
    }
}
