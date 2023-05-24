/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/cm-chessboard-playfield
 * License: MIT, see file 'LICENSE'
 */
import {Extension, EXTENSION_POINT} from "cm-chessboard/src/model/Extension.js"
import {AudioSprite} from "cm-web-modules/src/audio/AudioSprite.js"
import {Playfield} from "../Playfield.js"
import {INPUT_EVENT_TYPE} from "cm-chessboard/src/Chessboard.js"

export class PlayfieldSounds extends Extension {
    constructor(chessboard, props = {}) {
        super(chessboard)
        this.props = {
            soundSpriteFile: "assets/playfield-sounds.mp3"
        }
        Object.assign(this.props, props)
        this.playfield = chessboard.getExtension(Playfield)
        this.audioSprite = new AudioSprite(this.props.soundSpriteFile,
            {
                gain: 1,
                slices: {
                    "game_start": {offset: 0, duration: 0.9},
                    "game_won": {offset: 0.9, duration: 1.8},
                    "game_lost": {offset: 2.7, duration: 0.9},
                    "game_draw": {offset: 9.45, duration: 1.35},
                    "check": {offset: 3.6, duration: 0.45},
                    "illegal_move": {offset: 4.05, duration: 0.45},
                    "move": {offset: 4.5, duration: 0.2},
                    "capture": {offset: 6.3, duration: 0.2},
                    "castle": {offset: 7.65, duration: 0.2},
                    "take_back": {offset: 8.1, duration: 0.12},
                    "promotion": {offset: 9.0, duration: 0.45},
                    "dialog": {offset: 10.8, duration: 0.45}
                }
            })
        this.playfield.state.chess.addObserver((event) => {
            if (event.type === "legalMove") {
                if (event.move.flags.indexOf("p") !== -1) {
                    this.audioSprite.play("promotion")
                } else if (event.move.flags.indexOf("c") !== -1) {
                    this.audioSprite.play("capture")
                } else if (event.move.flags.indexOf("k") !== -1 ||
                    event.move.flags.indexOf("q") !== -1) {
                    this.audioSprite.play("castle")
                } else {
                    this.audioSprite.play("move")
                }
                if (event.move.inCheck || event.move.inCheckmate) {
                    this.audioSprite.play("check")
                }
            }
        })
        this.registerExtensionPoint(EXTENSION_POINT.moveInput, (event) => {
            if((event.type === INPUT_EVENT_TYPE.validateMoveInput ||
                event.type === INPUT_EVENT_TYPE.moveInputStarted)
                && !event.moveInputCallbackResult) {
                if(this.playfield.state.player.state.premoving) {
                    // todo play premove sound
                } else {
                    this.audioSprite.play("illegal_move")
                }
            }
        })
    }
}
