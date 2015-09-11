/// <reference path="../Scripts/content_storage.ts"/>
/// <reference path="../Scripts/tile.ts"/>


module ContentStorage_Tests {

    QUnit.module("ContentStorage tests");

    test("tests for storage", () => {

        let storage = new Control.ContentStorage();

        storage.reset();
        console.log('Im here\r\n');
        equal(storage.getGameState(), undefined);
        equal(storage.getGameStatistics(), undefined);
        // Crazy stuff!! Atempt to read Model.Tile.O will lead to NRE if tile.ts was not included!
        storage.updateGameState({
            firstPlayer: Model.Tile.O,
            nextPlayer: Model.Tile.X,
            gameStatus: Model.GameStatus.KeepPlaying,
            winner: undefined,
            grid: {
                size: 0,
                longestStrike: 0,
                cells: []
            }
        });

        let gameState = storage.getGameState();
        ok(gameState, 'gameState should not be null or undefined');
        equal(gameState.firstPlayer, Model.Tile.O, `firstPlayer should be O`);
        equal(gameState.nextPlayer, Model.Tile.X, `nextPlayer should be X`);

        ok(gameState.grid,`gridState should be defined`);
        equal(gameState.grid.size, 0, `grid should empty`);
    });
}