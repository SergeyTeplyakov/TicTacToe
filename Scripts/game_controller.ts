/// <reference path="assert.ts" />

/// <reference path="keyboard_listener.ts" />
/// <reference path="game_view.ts" />
/// <reference path="content_storage.ts" />

module Control {

    const defaultTile = Model.Tile.X;
    const firstPlayer = Model.Tile.X;

    export class GameController {
        private contentStorage: ContentStorage;
        private view: View.AbstractView;
        private keyboardListener: AbstractKeyboardListener;

        private grid: Model.Grid;

        private firstPlayer = { name: "Player1", score: 0 };
        private secondPlayer = { name: "Player2", score: 0 };

        private player(value: Model.Tile): {name: string, score: number} {
            return value === firstPlayer ? this.firstPlayer : this.secondPlayer;
        }
        //private firstPlayer(): { name: string, score: number } { return this.player(Model.Tile.X); }
        //private secondPlayer(): { name: string, score: number } { return this.player(Model.Tile.X); }

        constructor(gridSize: number, longestStrike: number, view: View.AbstractView, keyboardListener: AbstractKeyboardListener,
            firstPlayer?: string, secondPlayer?: string) {

            this.view = view;
            this.keyboardListener = keyboardListener || new KeyboardListener(gridSize);
            this.contentStorage = new ContentStorage();

            this.firstPlayer.name = firstPlayer;
            this.secondPlayer.name = secondPlayer;

            // this will create this.grid
            this.restoreGameStateIfNeeded(gridSize, longestStrike);

            // For JS newby: bind is super critical, because 'this' in callbacks would be equal to sender, not to the receiver!
            this.keyboardListener.subscribe(this.handleInput.bind(this));

            // this will initialize the score
            this.restoreGameStatistics();

            // Need to introduce next player
            this.view.introduceNextPlayer(this.player(this.grid.nextPlayer()).name);
        }

        private handleInput(event: InputEvent) {
            if (event instanceof TileClick) {
                this.handleClick(event.x, event.y);
            } else if (event instanceof Restart) {
                this.restart();
            }
        }

        private handleClick(x: number, y: number) {
            // Argument validation (check for -1 is required for now!)
            if ((x === -1 || y === -1) || this.grid.isOccupied(x, y)) {
                return;
            }

            // Making a move at the grid
            let nextValue = this.grid.nextPlayer();
            let moveResult = this.grid.makeMove(x, y);

            // Making a move on the view
            // TODO: nextValue.toString() provides 1 and 2!
            this.view.makeMove(x, y, nextValue);

            // Checking the results
            if (moveResult instanceof Model.Victory) {
                this.player(moveResult.winner).score++;

                this.view.victory(this.player(moveResult.winner).name);

                // Need to store the statistics as well, because game was finished!
                let gameStatistics = this.getGameStatistics();
                this.contentStorage.updateGameStatistics(gameStatistics);
                this.view.updateGameStatistics(gameStatistics);
            }
            else if (moveResult instanceof Model.Draw) {
                this.view.draw();
            } else {
                // Keep playing. Need to introduce next player then
                let nextPlayer = this.grid.nextPlayer();
                this.view.introduceNextPlayer(this.player(nextPlayer).name);
            }

            this.contentStorage.updateGameState(this.getGameState());
        }

        private restoreGameStateIfNeeded(size: number, longestStrike: number) {
            var gameState = this.contentStorage.getGameState();

            // Reload the game from a previous game if present
            if (gameState && gameState.grid.size === size && gameState.grid.longestStrike === longestStrike) {
                this.grid = new Model.Grid(
                    gameState.grid.size,
                    gameState.grid.longestStrike,
                    gameState.firstPlayer,
                    gameState.grid.cells);

                this.view.updateGameState(gameState);

                // TODO: fix this!
                //Debug.assert(this.grid.nextPlayer() === gameState.nextPlayer,
                //    `After game restore expected next player should be '${gameState.nextPlayer}', but was '${this.grid.nextPlayer() }'`);
            } else {
                this.grid = new Model.Grid(size, longestStrike, defaultTile);
            }
        }

        private restoreGameStatistics() {
            var gameStatistics = this.contentStorage.getGameStatistics();

            if (gameStatistics) {
                this.firstPlayer.score = gameStatistics.firstPlayerScore;
                this.secondPlayer.score = gameStatistics.secondPlayerScore;

                this.view.updateGameStatistics(gameStatistics);
            }
        }

        private restart() {
            //alert('restarting...');
            let size = this.grid.size;
            let strike = this.grid.strike;
            this.grid = new Model.Grid(size, strike, Model.getAnotherValue(this.grid.firstMove));

            let gameState = this.getGameState();
            this.contentStorage.updateGameState(gameState);

            this.view.clearMessage();
            this.view.updateGameState(gameState);
            this.view.introduceNextPlayer(this.player(this.grid.nextPlayer()).name);
        }

        // Keep playing after winning (allows going over 2048)
        keepPlayingFunc() {
            //this.keepPlaying = true;
            //this.actuator.continueGame(); // Clear the game won/lost message
        }

        //isGameTerminated() {
        //    return this.over || (this.won && !this.keepPlaying);
        //}

        getGameState(): Model.GameSnapshot {
            return {
                firstPlayer: this.grid.firstMove,
                nextPlayer: this.grid.nextPlayer(),
                winner: this.grid.winner(),
                gameStatus: this.grid.gameStatus(),
                grid: this.grid.serialize()
            };
        }

        getGameStatistics(): Model.GameStatistics {
            return {
                firstPlayerScore: this.firstPlayer.score,
                secondPlayerScore: this.secondPlayer.score,
            };
        }
    }
}