/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {INPUT_EVENT_TYPE} from "cm-chessboard/src/Chessboard.js"
import {Chess} from "cm-chess/src/Chess.js"
import {PromotionDialog} from "cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js"
import {PlayfieldPlayer} from "./PlayfieldPlayer.js"

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
                return this.onValidateMoveInput(event)
            case INPUT_EVENT_TYPE.moveInputFinished:
                this.onMoveInputFinished(event, moveResponse)
        }
    }

    onMoveInputStarted(event) {
        const tmpChess = new Chess(this.playfield.state.chess.fen())
        const moves = tmpChess.moves({square: event.squareFrom})
        return moves.length > 0
    }

    onValidateMoveInput(event) {
        const tmpChess = new Chess(this.playfield.state.chess.fen())
        return !!tmpChess.move({from: event.squareFrom, to: event.squareTo})
    }

    onMoveInputFinished(event, moveResponse) {
        // console.log("onMoveInputFinished", event)
        if (event.legalMove) {
            this.playfield.chessboard.disableMoveInput()
            moveResponse({
                from: event.squareFrom,
                to: event.squareTo
            })
        }
    }

}
