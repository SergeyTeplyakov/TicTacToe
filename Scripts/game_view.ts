/// <reference path="assert.ts"/>

/// <reference path="tile.ts"/>
/// <reference path="grid.ts"/>

module View {

    export interface AbstractView {
        // Show message for the next player
        introduceNextPlayer(playerName: string): void;

        makeMove(x: number, y: number, value: string): void;
        // clears all pending messages on the scrin
        clearMessage(): void;

        victory(winner: string): void;
        draw(): void;

        updateGameStatistics(gameStatistics: Model.GameStatistics): void;
        updateGameState(gameState: Model.GameSnapshot): void;
    }

    export class GameView implements AbstractView {
        tileContainer: Element;
        firstPlayerScoreContainer: Element;
        secondPlayerScoreContainer: Element;
        messageContainer: Element;

        gameHintContainer: Element;

        firstPlayerScore: number;
        secondPlayerScore: number;

        constructor(firstPlayerName: string, secondPlayerName: string) {

            this.tileContainer = document.querySelector(".tile-container");
            this.firstPlayerScoreContainer = document.querySelector(".first-player-container");
            this.secondPlayerScoreContainer = document.querySelector(".second-player-container");
            this.messageContainer = document.querySelector(".game-message");
            this.gameHintContainer = document.querySelector(".game-intro");

            this.setPlayerNames(firstPlayerName, secondPlayerName);
        }

        introduceNextPlayer(playerName: string): void {
            let type = "game-intro";

            var message = `${playerName}, this is your move!`;

            this.gameHintContainer.classList.add(type);
            this.gameHintContainer.getElementsByTagName("p")[0].textContent = message;            
        }

        makeMove(x: number, y: number, value: string): void {
            this.addTile(x, y, value);
        }

        // Continues the game (both restart and keep playing)
        clearMessage() {
            this.clearMessages();
        }

        victory(winner: string): void {
            var type = "game-won";
            var message = `${winner}: You win!`;

            this.messageContainer.classList.add(type);
            this.messageContainer.getElementsByTagName("p")[0].textContent = message;
        }

        draw(): void {
            var type = "game-over";
            var message = "Game over! This is DRAW!!";

            this.messageContainer.classList.add(type);
            this.messageContainer.getElementsByTagName("p")[0].textContent = message;
        }

        updateGameStatistics(gameStatistics: Model.GameStatistics): void {
            this.updateScore(gameStatistics.firstPlayerScore, gameStatistics.secondPlayerScore);
        }

        updateGameState(gameState: Model.GameSnapshot): void {
            window.requestAnimationFrame(() => {
                this.clearContainer(this.tileContainer);

                let grid = gameState.grid;
                for (let x = 0; x < grid.size; x++) {
                    for (let y = 0; y < grid.size; y++) {
                        let state = grid[x] && grid[x][y];
                        if (state) {
                            this.addTile(x, y, state.toString());
                        }
                    }
                }
            });
        }

        private setPlayerNames(firstPlayerName: string, secondPlayerName: string) {
            
        }

        private clearContainer(container) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }

        private addTile(x: number, y: number, value: string) {
            var wrapper = document.createElement("div");
            var inner = document.createElement("div");

            // TODO: need to call getTileClass!
            let positionClass = getPositionClass({ x: x, y: y });

            // We can't use classlist because it somehow glitches when replacing classes
            var classes = ["tile", "tile-" + value, positionClass];

            this.applyClasses(wrapper, classes);

            inner.classList.add("tile-inner");
            inner.textContent = value.toString();

            classes.push("tile-new");
            this.applyClasses(wrapper, classes);

            // Add the inner part of the tile to the wrapper
            wrapper.appendChild(inner);

            // Put the tile on the board
            this.tileContainer.appendChild(wrapper);
        }

        private applyClasses(element: HTMLDivElement, classes: string[]) {
            element.setAttribute("class", classes.join(" "));
        }

        private updateScore(firstPlayerScore: number, secondPlayerScore: number) {
            this.clearContainer(this.firstPlayerScoreContainer);

            var firstPlayerScoreDiff = firstPlayerScore - this.firstPlayerScore;
            this.firstPlayerScore = firstPlayerScore;

            this.firstPlayerScoreContainer.textContent = this.firstPlayerScore.toString();

            if (firstPlayerScoreDiff > 0) {
                let addition = document.createElement("div");
                addition.classList.add("score-addition");
                addition.textContent = "+" + firstPlayerScoreDiff;

                this.firstPlayerScoreContainer.appendChild(addition);
            }

            this.clearContainer(this.secondPlayerScoreContainer);

            var secondPlayerDiff = secondPlayerScore - this.secondPlayerScore;
            this.secondPlayerScore = secondPlayerScore;

            this.secondPlayerScoreContainer.textContent = this.secondPlayerScore.toString();

            if (secondPlayerDiff > 0) {
                let addition = document.createElement("div");
                addition.classList.add("score-addition");
                addition.textContent = "+" + secondPlayerDiff;

                this.secondPlayerScoreContainer.appendChild(addition);
            }
        }

        private clearMessages() {
            // IE only takes one value to remove at a time.
            this.messageContainer.classList.remove("game-won");
            this.messageContainer.classList.remove("game-over");
        }
    }

    function normalizePosition(position: {x: number, y: number}) {
        return { x: position.x + 1, y: position.y + 1 };
    }

    function getPositionClass(position: {x: number, y: number}) {
        let np = normalizePosition(position);
        return `tile-position-${np.x}-${np.y}`;
    }

    function getTileClass(tile: Model.Tile) {
        return `tile-value-${tile.toString()}`;
    }

}