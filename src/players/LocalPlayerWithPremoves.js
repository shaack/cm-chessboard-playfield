/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {LocalPlayer} from "./LocalPlayer.js"
import {Observed} from "cm-web-modules/src/observed/Observed.js"

export class LocalPlayerWithPremoves extends LocalPlayer {
    constructor(playfield, name) {
        super(playfield, name)
        this.state = new Observed({
            premoving: false,
            premoveValidateEvent: null
        })
        this.state.addObserver((event) => {
            console.log("state", event)
        })
    }

    moveRequest(moveResponse) {
        this.state.premoving = false
        if(!this.playfield.chessboard.view.moveInputCallback) { // if not enabled
            this.playfield.chessboard.enableMoveInput((event) => {
                return this.chessboardMoveInputCallback(event, moveResponse)
            }, this.playfield.props.playerColor)
        }
        if(this.state.premoveValidateEvent) {
            moveResponse({
                from: this.state.premoveValidateEvent.squareFrom,
                to: this.state.premoveValidateEvent.squareTo
            })
            this.state.premoveValidateEvent = null
        }
    }

    onMoveInputStarted(chessboardEvent) {
        if (this.state.premoving) {
            return true // no validation when premoving
        } else {
            return super.onMoveInputStarted(chessboardEvent)
        }
    }

    onValidateMoveInput(chessboardEvent, moveResponse) {
        if(this.state.premoving) {
            this.state.premoveValidateEvent = chessboardEvent
            return true // no validation when premoving, todo show promotion dialog, if needed
        } else {
            return super.onValidateMoveInput(chessboardEvent, moveResponse)
        }
    }

    onMoveInputFinished(chessboardEvent, moveResponse) {
        if (chessboardEvent.legalMove && !this.state.premoving) {
            if (!this.playfield.chessboard.isPromotionDialogShown()) {
                this.handleMoveResponse(moveResponse,{
                    from: chessboardEvent.squareFrom,
                    to: chessboardEvent.squareTo
                })
            }
            if(!this.state.premoving) {
                this.state.premoving = true
            }
        }
    }
}
