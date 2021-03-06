﻿/// <reference path="../Scripts/game_controller.ts"/>


module GameController_Tests {

    class FakeKeyboard implements Control.AbstractKeyboardListener {

        private handler: (event: Control.InputEvent) => void;

        subscribe(handler: (event: Control.InputEvent) => void): void {
            this.handler = handler;
        }

        public emulateMove(x: number, y: number) {
            this.handler(new Control.TileClick(x, y));
        }
    }

    class FakeView implements View.AbstractView {
        public introducedPlayer;
        introduceNextPlayer(playerName: string): void { this.introducedPlayer = playerName; }

        public moved: {x: number, y: number, value: Model.Tile};
        makeMove(x: number, y: number, value: Model.Tile): void { this.moved = { x: x, y: y, value: value }; }
        
        public clearedGame: boolean;
        clearMessage(): void { this.clearedGame = true; }

        public winner: string;
        victory(winner: string): void { this.winner = winner; }

        setWinningStrike(tile: Model.Tile, cells: { x: number, y: number }[]) {}

        public drawWasCalled: boolean;
        draw(): void { this.drawWasCalled = true; }

        updateGameStatistics(gameStatistics: Model.GameStatistics): void {}
        updateGameState(gameState: Model.GameSnapshot): void {}
    }

    const size = 3;

    QUnit.module("GameController tests");

    // TODO: add tests for undo!!! to grid and this class!

    test("basic test", () => {
        let keyboard = new FakeKeyboard();
        let view = new FakeView();
        let firstPlayer = "player1";
        let secondPlayer = "player2";

        let controller = new Control.GameController(size, size, view, keyboard, firstPlayer, secondPlayer);

        ok(view.introducedPlayer, 'introducePlayer should be called on the view from the beginning');
        equal(view.introducedPlayer, firstPlayer, 'first player should be introduced');

        // Act
        keyboard.emulateMove(0, 0);

        ok(view.moved, "moved method should be called on the view");
        equal(view.moved.x, 0);
        equal(view.moved.y, 0);

        equal(view.introducedPlayer, secondPlayer, 'second player should be introduced');
    });
}