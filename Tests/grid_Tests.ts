/// <reference path="../Scripts/Grid.ts"/>

QUnit.module("Grid.ts tests");

const size = 3;
import Value = Model.Tile;
import Grid = Model.Grid;

const firstMove = Value.X;

test("basic grid test", () => {
    
    let grid = new Grid(size, Value.X);

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
    equal(grid.emptyCells().length, 0, `Should be no empty cells any more.`);
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

test("test few winner combinations", () => {
    let cells = [
        [Value.X, Value.X, Value.X],
        [Value.O, Value.O, Value.X],
        [Value.O, Value.X, Value.O]
    ];

    equal(winner(createGrid(), cells), Value.X);

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

function createGrid() {
    return new Grid(size, firstMove);
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
