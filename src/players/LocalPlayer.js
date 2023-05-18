/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {INPUT_EVENT_TYPE} from "cm-chessboard/src/Chessboard.js"
import {Chess} from "cm-chess/src/Chess.js"
import {PromotionDialog} from "cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js"
import {PlayfieldPlayer} from "./PlayfieldPlayer.js"
import {PLAYFIELD_MESSAGES} from "../Playfield.js"

export class LocalPlayer extends PlayfieldPlayer {

    constructor(playfield, name, props) {
        super(playfield, name)
        this.props = {}
        Object.assign(this.props, props)
        if (!this.playfield.chessboard.getExtension(PromotionDialog)) {
            this.playfield.chessboard.addExtension(PromotionDialog)
        }
    }

    /**
     * Called by the playfield, when it is the players turn
     * @param moveResponse
     */
    moveRequest(moveResponse) {
        this.playfield.chessboard.enableMoveInput((event) => {
            return this.chessboardMoveInputCallback(event, moveResponse)
        }, this.playfield.state.chess.turn())
    }

    chessboardMoveInputCallback(event, moveResponse) {
        // console.log("chessboardMoveInputCallback", event)
        switch (event.type) {
            case INPUT_EVENT_TYPE.moveInputStarted:
                return this.onMoveInputStarted(event)
            case INPUT_EVENT_TYPE.validateMoveInput:
                return this.onValidateMoveInput(event, moveResponse)
            case INPUT_EVENT_TYPE.moveInputFinished:
                this.onMoveInputFinished(event, moveResponse)
        }
    }

    onMoveInputStarted(event) {
        const tmpChess = new Chess(this.playfield.state.chess.fen())
        const moves = tmpChess.moves({square: event.squareFrom})
        const movesFound = moves.length > 0
        if (!movesFound) {
            this.playfield.messageBroker.publish(PLAYFIELD_MESSAGES.gameMoveIllegal, {from: event.squareFrom})
        }
        return movesFound
    }

    onValidateMoveInput(event, moveResponse) {
        const tmpChess = new Chess(this.playfield.state.chess.fen())
        const move = {from: event.squareFrom, to: event.squareTo}
        const validMove = !!tmpChess.move(move)
        if (validMove) {
            return true
        } else { // is a promotion?
            const piece = tmpChess.piece(event.squareFrom)
            if (piece && piece.type === "p") {
                const possibleMoves = tmpChess.moves({square: event.squareFrom, verbose: true})
                for (let possibleMove of possibleMoves) {
                    if (possibleMove.to === event.squareTo && possibleMove.promotion) {
                        this.playfield.chessboard.showPromotionDialog(event.squareTo, tmpChess.turn(), (dialogEvent) => {
                            if(!dialogEvent) {
                                this.playfield.chessboard.setPosition(this.playfield.state.chess.fen(), true)
                                this.moveRequest(moveResponse)
                            } else if (dialogEvent.piece) {
                                move.promotion = dialogEvent.piece.charAt(1)
                                moveResponse(tmpChess.move(move))
                            }
                        })
                        return true
                    }
                }
            }
        }
    }

    onMoveInputFinished(event, moveResponse) {
        // console.log("onMoveInputFinished", event)
        if (event.legalMove) {
            if(!this.playfield.chessboard.isPromotionDialogShown()) {
                moveResponse({
                    from: event.squareFrom,
                    to: event.squareTo
                })
            }
            this.playfield.chessboard.disableMoveInput()
        }
    }

}
