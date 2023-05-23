/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {LocalPlayer} from "./LocalPlayer.js"

export class LocalPlayerWithPremoves extends LocalPlayer {
    constructor(playfield, name) {
        super(playfield, name)
        this.premoving = false
    }

    moveRequest(moveResponse) {
        if(!this.premoving) {
            return super.moveRequest(moveResponse)
        }
    }

    handleMoveResponse(moveResponse, move) {
        if(!this.premoving) {
            return super.handleMoveResponse(moveResponse, move)
        }
    }
}
