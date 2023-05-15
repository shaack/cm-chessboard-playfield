# cm-chessboard-chess

A cm-chessboard plugin which knows the rules of chess to validate moves, support promotions and do some fancy square marking.

## API

### props

```
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
```

