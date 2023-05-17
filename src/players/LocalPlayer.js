/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {COLOR, INPUT_EVENT_TYPE} from "cm-chessboard/src/Chessboard.js"
import {Chess} from "cm-chess/src/Chess.js"
import {PromotionDialog} from "cm-chessboard/src/extensions/promotion-dialog/PromotionDialog.js"
import {PlayfieldPlayer} from "../PlayfieldPlayer.js"

export class LocalPlayer extends PlayfieldPlayer {

    constructor(playfield, name, props) {
        super(playfield, name)
        this.props = {}
        Object.assign(this.props, props)
        if (!this.playfield.chessboard.hasExtension(PromotionDialog)) {
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
        switch (event.type) {
            case INPUT_EVENT_TYPE.moveInputStarted:
                return true;
            case INPUT_EVENT_TYPE.validateMoveInput:
                const result = this.onValidateMoveInput(event, moveResponse);
                if(result) {
                    this.playfield.chessboard.disableMoveInput()
                }
                return result
        }
    }

    onValidateMoveInput(event, moveResponse) {
        console.log("onValidateMoveInput", event)
        const tmpChess = new Chess(this.playfield.state.chess.fen())
        let move = {from: event.squareFrom, to: event.squareTo}
        const moveResult = tmpChess.move(move)
        if (moveResult) {
            return true
        }
    }


}
