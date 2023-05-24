/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {LocalPlayer} from "./LocalPlayer.js"
import {Observed} from "cm-web-modules/src/observed/Observed.js"
import {PlayfieldMarkers} from "../dependent-extensions/PlayfieldMarkers.js"

export class LocalPlayerWithPremoves extends LocalPlayer {
    constructor(playfield, name) {
        super(playfield, name)
        this.state = new Observed({
            premoving: false,
            premoveValidateEvent: null
        })
        this.state.addObserver((event) => {
            this.playfield.chessboard.removePremoveMarkers()
            if (event.value) {
                this.playfield.chessboard.addPremoveMarker(event.value.squareFrom)
                this.playfield.chessboard.addPremoveMarker(event.value.squareTo)
                // allow right click to cancel premove
                const handleContextMenu = () => {
                    this.state.premoveValidateEvent = null
                }
                this.playfield.chessboard.context.addEventListener("contextmenu", (event) => {
                    event.preventDefault()
                    handleContextMenu()
                    this.playfield.chessboard.context.removeEventListener("contextmenu", handleContextMenu)
                })
            }
        }, ["premoveValidateEvent"])
        setTimeout(() => {
            this.playfieldMarkers = this.playfield.chessboard.getExtension(PlayfieldMarkers)
        })
    }

    moveRequest(moveResponse) {
        this.state.premoving = false
        if (!this.playfield.chessboard.view.moveInputCallback) { // enable it only once on first request
            this.playfield.chessboard.enableMoveInput((event) => {
                return this.chessboardMoveInputCallback(event, moveResponse)
            }, this.playfield.props.playerColor)
        }
        if (this.state.premoveValidateEvent) {
            const isMoveValid = super.onValidateMoveInput(this.state.premoveValidateEvent, (move) => {
                moveResponse(move)
                this.state.premoving = true
                this.state.premoveValidateEvent = null
            })
            if(isMoveValid && !this.playfield.chessboard.isPromotionDialogShown()) {
                moveResponse({
                    from: this.state.premoveValidateEvent.squareFrom,
                    to: this.state.premoveValidateEvent.squareTo
                })
                this.state.premoving = true
            }
            if(!isMoveValid && !this.playfield.chessboard.isPromotionDialogShown()) {
                this.playfieldMarkers.markIllegalMove(this.state.premoveValidateEvent.squareFrom, this.state.premoveValidateEvent.squareTo)
            }
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
        if (this.state.premoving) {
            this.state.premoveValidateEvent = chessboardEvent
            return false // no validation when premoving
        } else {
            return super.onValidateMoveInput(chessboardEvent, moveResponse)
        }
    }

    onMoveInputFinished(chessboardEvent, moveResponse) {
        if (chessboardEvent.legalMove && !this.state.premoving) {
            if (!this.playfield.chessboard.isPromotionDialogShown()) {
                this.handleMoveResponse(moveResponse, {
                    from: chessboardEvent.squareFrom,
                    to: chessboardEvent.squareTo
                })
            }
            if (!this.state.premoving) {
                this.state.premoving = true
            }
        } else {
            if (this.state.premoveValidateEvent) {
                this.playfield.chessboard.setPosition(this.playfield.state.chess.fen())
            }
        }
    }
}
