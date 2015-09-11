/// <reference path="../Scripts/Grid.ts"/>

QUnit.module("Grid.ts tests");

const size = 3;
import Value = Model.Tile;
import Grid = Model.Grid;

const firstMove = Value.X;

test("basic grid test", () => {
    
    let grid = new Grid(size, size, Value.X);

    // First player should match constructor's argument
    equal(grid.nextPlayer(), Value.X, "first move should be X!");

    // Making first move
    grid.makeMove(0, 0);

    //expect(grid.gameStatus()).toBe(Logic.GameStatus.KeepPlaying);
    equal(grid.gameStatus(), Model.GameStatus.KeepPlaying);
    equal(grid.getState(0, 0), Value.X);
    equal(grid.nextPlayer(), Value.O);
});

test("test draw", () => {
    // Arrange
    let grid = createGrid();

    let cells = [
        [Value.X, Value.X, Value.O],
        [Value.O, Value.O, Value.X],
        [Value.X, Value.X, Value.O]
    ];
    //grid.makeMove(0, 0, Value.X)
    // Act
    syncGridState(grid, cells);

    // Assert
    equal(grid.emptyCellsCount(), 0, `Should be no empty cells any more.`);
    equal(grid.gameStatus(), Model.GameStatus.Draw);
    //let isUndefined = (grid.nextPlayer() === undefined);
    //equal(r, true);
    equal(grid.nextPlayer(), undefined, `When game is done nextPlayer() should be 'undefined' but was '${grid.nextPlayer()}'`);
});

test("move on occupied cell should throw", () => {
    let grid = createGrid();

    grid.makeMove(0, 0);

    throws(() => grid.makeMove(0, 0));
});

test("test subarray", () => {
    let grid = createGrid();
    grid.makeMove(0, 0, Value.X);
    grid.makeMove(0, 1, Value.X);
    grid.makeMove(0, 2, Value.X);
    //equal(grid.winner(), Value.X);
    //equal(grid.checkWinner({ x: 2, y: 2 }), Value.X);

    let subArray = grid.getSubArray({ x: 0, y: 0 }, { x: 0, y: 4 });
    equal(subArray.length, 3, 'len should be 3 but was ' + subArray.length);

    let strike = grid.longestStrike(subArray);
    equal(strike.count, grid.strike);
    equal(strike.value, Value.X);

    //equal(strike.count)
});

test("diag should win", () => {
    let grid = createGrid();
    grid.makeMove(0, 0, Value.X);
    grid.makeMove(1, 1, Value.X);
    let status = grid.makeMove(2, 2, Value.X);

    if (status instanceof Model.Victory) {
        equal(status.winner, Value.X);
        return;
    }

    ok(false, "Should not get here!");
});

test("test few winner combinations", () => {
    let cells = [
        [Value.X, Value.X, Value.X],
        [Value.O, Value.O, Value.X],
        [Value.O, Value.X, Value.O]
    ];

    equal(winner(createGrid(), cells), Value.X, 'first case');

    cells = [
        [Value.O,        ,        ],
        [       , Value.O,        ],
        [       ,        , Value.O]
    ];

    equal(winner(createGrid(), cells), Value.O);

    cells = [
        [Value.O,        , Value.X],
        [       , Value.X,        ],
        [Value.X,        , Value.O]
    ];

    equal(winner(createGrid(), cells), Value.X);
});

test("test few winner with 5x5", () => {
    let cells = [
        [Value.X, Value.X, Value.X, undefined, undefined],
        [Value.O, Value.O, Value.X, undefined, undefined],
        [Value.O, Value.X, Value.O, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined]
    ];

    equal(winner(new Grid(5, 3, Value.X), cells), Value.X, 'first case');

    cells = [
        [Value.O  , undefined, undefined, undefined, undefined],
        [undefined, Value.O  , undefined, undefined, undefined],
        [undefined, undefined, Value.O, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined]
    ];

    equal(winner(new Grid(5, 3, Value.O), cells), Value.O);

    cells = [
        [undefined, Value.O, undefined, undefined, undefined],
        [undefined, Value.O, undefined, undefined, undefined],
        [undefined, Value.O, Value.O, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined]
    ];

    equal(winner(new Grid(5, 3, Value.O), cells), Value.O);
});

function createGrid() {
    return new Grid(size, size, firstMove);
}

function syncGridState(grid: Grid, state: Value[][]) {
    for (let x = 0; x < state.length; x++) {
        let row = state[x];

        for (let y = 0; y < row.length; y++) {
            grid.makeMove(x, y, row[y]);
        }
    }
}

function winner(grid: Grid, state: Value[][]): Value {
    syncGridState(grid, state);
    return grid.winner();
}
