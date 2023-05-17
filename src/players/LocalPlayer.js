/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
const {COLOR, INPUT_EVENT_TYPE} = await import(`${node_modules}/cm-chessboard/src/Chessboard.js`)
const {Chess} = await import(`${node_modules}/chess.mjs/src/Chess.js`)
const {PromotionDialog} = await import(`${node_modules}/cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js`)
import {Player} from "../Player.js"

export class LocalPlayer extends Player {

    constructor(playfield, name, props) {
        super(playfield, name)
        this.props = {
            allowPremoves: false
        }
        Object.assign(this.props, props)
        this.premoves = []
        if (!this.playfield.chessboard.hasExtension(PromotionDialog)) {
            this.playfield.chessboard.addExtension(PromotionDialog)
        }
    }

    /**
     * The return value returns, if valid or if is promotion.
     * The callback returns the move.
     */
    validateMoveAndPromote(fen, squareFrom, squareTo, callback) {
        const tmpChess = new Chess(fen)
        let move = {from: squareFrom, to: squareTo}
        const moveResult = tmpChess.move(move)
        if (moveResult) {
            callback(moveResult)
        } else { // is a promotion?
            if (tmpChess.get(squareFrom) && tmpChess.get(squareFrom).type === "p") {
                const possibleMoves = tmpChess.moves({square: squareFrom, verbose: true})
                for (let possibleMove of possibleMoves) {
                    if (possibleMove.to === squareTo && possibleMove.promotion) {
                        this.playfield.chessboard.showPromotionDialog(squareTo, tmpChess.turn(), (event) => {
                            if (event.piece) {
                                move.promotion = event.piece.charAt(1)
                                callback(tmpChess.move(move))
                            } else {
                                callback(null)
                            }
                        })
                    }
                }
            }
        }
        callback(null)
    }

    /**
     * Handles the events from cm-chessboard
     *
     * INPUT_EVENT_TYPE.moveDone
     * - validates Move, returns false, if not valid
     * - does promotion
     * - calls moveResponse()
     *
     * INPUT_EVENT_TYPE.moveStart
     * - allowed only the right color to move
     */
    chessboardMoveInputCallback(event, moveResponse) {
        // if player can make move, make, if not store as premove
        // const boardFen = this.chessConsole.components.board.chessboard.getPosition()
        const gameFen = this.playfield.state.chess.fen()
        if (this.playfield.playerToMove() === this) {
            if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
                this.validateMoveAndPromote(gameFen, event.squareFrom, event.squareTo, (moveResult) => {
                    let result
                    if (moveResult) { // valid
                        result = moveResponse(moveResult)
                    } else { // not valid
                        result = moveResponse({from: event.squareFrom, to: event.squareTo})
                        this.premoves = []
                    }
                    console.log("2b95bb result", moveResult)
                    if(result) {
                        console.log("08c961 disableMoveInput")
                        this.playfield.chessboard.disableMoveInput()
                    }
                })
            } else if (event.type === INPUT_EVENT_TYPE.moveInputStarted) {
                // reset position, if not on last move
                if (this.playfield.state.moveShown !== this.playfield.state.chess.lastMove()) {
                    this.playfield.state.moveShown = this.playfield.state.chess.lastMove()
                }
            }
        } else {
            // premoves
            if(this.props.allowPremoves) {
                if (event.type === INPUT_EVENT_TYPE.validateMoveInput) {
                    this.premoves.push(event)
                }
            }
            return true
        }
    }

    moveRequest(moveResponse) {
        const color = this.playfield.state.chess.turn() === 'w' ? COLOR.white : COLOR.black
        if (!this.playfield.state.chess.gameOver()) {
            console.log("603a3a enableMoveInput")
            this.playfield.chessboard.enableMoveInput(
                (event) => {
                    return this.chessboardMoveInputCallback(event, moveResponse)
                }, color
            )
        }
    }

}
