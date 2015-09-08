/// <reference path="tile.ts"/>
/// <reference path="grid.ts"/>

// TODO: MVP-like pattern is required here!
// Or event-based stuff, maybe!

function normalizePosition(position: TilePosition) {
    return {x: position.x + 1, y: position.y + 1};
}

function getPositionClass(position: TilePosition) {
    let np = normalizePosition(position);
    return `tile-position-${np.x}-${np.y}`;
}


class HtmlActuator {
    tileContainer: Element;
    firstPlayerScoreContainer: Element;
    secondPlayerScoreContainer: Element;
    messageContainer: Element;
    
    score: number;
    
    firstPlayerScore: number;
    secondPlayerScore: number;
    
    constructor() {
        this.tileContainer = document.querySelector(".tile-container");
        this.firstPlayerScoreContainer = document.querySelector(".first-player-container");
        this.secondPlayerScoreContainer = document.querySelector(".second-player-container");
        this.messageContainer = document.querySelector(".game-message");

        this.score = 0;
    }
    
    actuate(grid: Grid, metadata: AnotherGameState) {
        window.requestAnimationFrame(() => {
            this.clearContainer(this.tileContainer);
    
            grid.cells.forEach(column => {
                column.forEach(cell => {
                    if (cell) {
                        this.addTile(cell);
                    }
                });
            });
    
            this.updateScore(metadata.firstPlayerScore, metadata.secondPlayerScore);
            this.updateBestScore(metadata.bestScore);
    
            if (metadata.terminated) {
                if (metadata.over) {
                    this.message(false); // You lose
                } else if (metadata.won) {
                    this.message(true); // You win!
                }
            }
    
        });
    };
    
    // Continues the game (both restart and keep playing)
    continueGame() {
        this.clearMessage();
    };
    
    clearContainer(container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    };
    
    addTile(tile: Tile) {
        var self = this;
    
        var wrapper = document.createElement("div");
        var inner = document.createElement("div");
        
        // TODO: lack of separation model from view! this is bad!
        let position = tile.getPreviousOrCurrentPosition();
        let positionClass = getPositionClass(position);
    
        // We can't use classlist because it somehow glitches when replacing classes
        var classes = ["tile", "tile-" + tile.value, positionClass];
    
        // if (tile.value > 2048) classes.push("tile-super");
    
        this.applyClasses(wrapper, classes);
    
        inner.classList.add("tile-inner");
        inner.textContent = tile.value.toString();
    
        if (tile.previousPosition) {
            // Make sure that the tile gets rendered in the previous position first
            window.requestAnimationFrame(function () {
                classes[2] = getPositionClass({ x: tile.x, y: tile.y });
                self.applyClasses(wrapper, classes); // Update the position
            });
        } else if (tile.mergedFrom) {
            classes.push("tile-merged");
            this.applyClasses(wrapper, classes);
    
            // Render the tiles that merged
            tile.mergedFrom.forEach(function (merged) {
                self.addTile(merged);
            });
        } else {
            classes.push("tile-new");
            this.applyClasses(wrapper, classes);
        }
    
        // Add the inner part of the tile to the wrapper
        wrapper.appendChild(inner);
    
        // Put the tile on the board
        this.tileContainer.appendChild(wrapper);
    };
    
    applyClasses(element: HTMLDivElement, classes: string[]) {
        element.setAttribute("class", classes.join(" "));
    };
    
    updateScore(firstPlayerScore: number, secondPlayerScore: number) {
        this.clearContainer(this.firstPlayerScoreContainer);
    
        var firstPlayerScoreDiff = firstPlayerScore - this.firstPlayerScore;
        this.firstPlayerScore = firstPlayerScore;
        // this.score = score;
    
        this.firstPlayerScoreContainer.textContent = this.firstPlayerScore.toString();
    
        if (firstPlayerScoreDiff > 0) {
            var addition = document.createElement("div");
            addition.classList.add("score-addition");
            addition.textContent = "+" + firstPlayerScoreDiff;
    
            this.firstPlayerScoreContainer.appendChild(addition);
        }
        
        this.clearContainer(this.secondPlayerScoreContainer);
    
        var secondPlayerDiff = secondPlayerScore - this.secondPlayerScore;
        this.secondPlayerScore = secondPlayerScore;
        // this.score = score;
    
        this.secondPlayerScoreContainer.textContent = this.secondPlayerScore.toString();
    
        if (secondPlayerDiff > 0) {
            var addition = document.createElement("div");
            addition.classList.add("score-addition");
            addition.textContent = "+" + secondPlayerDiff;
    
            this.secondPlayerScoreContainer.appendChild(addition);
        }
    };
    
    updateBestScore(bestScore: number) {
        this.secondPlayerScoreContainer.textContent = bestScore.toString();
    };
    
    draw() {
        var type = "game-over";
        var message = "Game over! This is DRAW!!";
    
        this.messageContainer.classList.add(type);
        this.messageContainer.getElementsByTagName("p")[0].textContent = message;
    }
    
    someoneWon(who: string) {
        // TODO move this stuff outside!
        let firstPlayersName = "Angie";
        let secondPlayersName = "Daddy";
        
        let winner: string;
        if (who === 'X') {
            this.updateScore(this.firstPlayerScore + 1, this.secondPlayerScore);
            winner = "Angie";
        }
        else {
            this.updateScore(this.firstPlayerScore, this.secondPlayerScore + 1);
            winner = "Daddy";
        }
        
        let won = true;
        var type = won ? "game-won" : "game-over";
        var message = won ? `${winner}: You win!` : "Game over!";
    
        this.messageContainer.classList.add(type);
        this.messageContainer.getElementsByTagName("p")[0].textContent = message;
    }
    
    message(won: boolean) {
        var type = won ? "game-won" : "game-over";
        var message = won ? "You win!" : "Game over!";
    
        this.messageContainer.classList.add(type);
        this.messageContainer.getElementsByTagName("p")[0].textContent = message;
    };
    
    clearMessage() {
        // IE only takes one value to remove at a time.
        this.messageContainer.classList.remove("game-won");
        this.messageContainer.classList.remove("game-over");
    };

}

// function HTMLActuator() {
//     this.tileContainer = document.querySelector(".tile-container");
//     this.scoreContainer = document.querySelector(".score-container");
//     this.bestContainer = document.querySelector(".best-container");
//     this.messageContainer = document.querySelector(".game-message");
// 
//     this.score = 0;
// }
// 
// /*
// actuate(this.grid, {
//             score: this.score,
//             over: this.over,
//             won: this.won,
//             bestScore: this.storageManager.getBestScore(),
//             terminated: this.isGameTerminated()
//         });
// */
// 
interface AnotherGameState {
    // score: number;
    firstPlayerScore: number;
    secondPlayerScore: number;
    
    over: boolean;
    won: boolean;
    bestScore: number;
    terminated: boolean;
}
// 
// HTMLActuator.prototype.actuate = function (grid: Grid, metadata: AnotherGameState) {
//     var self = this;
// 
//     window.requestAnimationFrame(function () {
//         self.clearContainer(self.tileContainer);
// 
//         grid.cells.forEach(function (column) {
//             column.forEach(function (cell) {
//                 if (cell) {
//                     self.addTile(cell);
//                 }
//             });
//         });
// 
//         self.updateScore(metadata.score);
//         self.updateBestScore(metadata.bestScore);
// 
//         if (metadata.terminated) {
//             if (metadata.over) {
//                 self.message(false); // You lose
//             } else if (metadata.won) {
//                 self.message(true); // You win!
//             }
//         }
// 
//     });
// };
// 
// // Continues the game (both restart and keep playing)
// HTMLActuator.prototype.continueGame = function () {
//     this.clearMessage();
// };
// 
// HTMLActuator.prototype.clearContainer = function (container) {
//     while (container.firstChild) {
//         container.removeChild(container.firstChild);
//     }
// };
// 
// HTMLActuator.prototype.addTile = function (tile: Tile) {
//     var self = this;
// 
//     var wrapper = document.createElement("div");
//     var inner = document.createElement("div");
//     
//     // TODO: lack of separation model from view! this is bad!
//     let position = tile.getPreviousOrCurrentPosition();
//     let positionClass = getPositionClass(position);
// 
//     // We can't use classlist because it somehow glitches when replacing classes
//     var classes = ["tile", "tile-" + tile.value, positionClass];
// 
//     if (tile.value > 2048) classes.push("tile-super");
// 
//     this.applyClasses(wrapper, classes);
// 
//     inner.classList.add("tile-inner");
//     inner.textContent = tile.value.toString();
// 
//     if (tile.previousPosition) {
//         // Make sure that the tile gets rendered in the previous position first
//         window.requestAnimationFrame(function () {
//             classes[2] = getPositionClass({ x: tile.x, y: tile.y });
//             self.applyClasses(wrapper, classes); // Update the position
//         });
//     } else if (tile.mergedFrom) {
//         classes.push("tile-merged");
//         this.applyClasses(wrapper, classes);
// 
//         // Render the tiles that merged
//         tile.mergedFrom.forEach(function (merged) {
//             self.addTile(merged);
//         });
//     } else {
//         classes.push("tile-new");
//         this.applyClasses(wrapper, classes);
//     }
// 
//     // Add the inner part of the tile to the wrapper
//     wrapper.appendChild(inner);
// 
//     // Put the tile on the board
//     this.tileContainer.appendChild(wrapper);
// };
// 
// HTMLActuator.prototype.applyClasses = function (element, classes) {
//     element.setAttribute("class", classes.join(" "));
// };
// 
// // HTMLActuator.prototype.normalizePosition = function (position) {
// //     return { x: position.x + 1, y: position.y + 1 };
// // };
// 
// 
// // HTMLActuator.prototype.positionClass = function (position) {
// //     position = this.normalizePosition(position);
// //     return "tile-position-" + position.x + "-" + position.y;
// // };
// 
// HTMLActuator.prototype.updateScore = function (score) {
//     this.clearContainer(this.scoreContainer);
// 
//     var difference = score - this.score;
//     this.score = score;
// 
//     this.scoreContainer.textContent = this.score;
// 
//     if (difference > 0) {
//         var addition = document.createElement("div");
//         addition.classList.add("score-addition");
//         addition.textContent = "+" + difference;
// 
//         this.scoreContainer.appendChild(addition);
//     }
// };
// 
// HTMLActuator.prototype.updateBestScore = function (bestScore) {
//     this.bestContainer.textContent = bestScore;
// };
// 
// HTMLActuator.prototype.message = function (won) {
//     var type = won ? "game-won" : "game-over";
//     var message = won ? "You win!" : "Game over!";
// 
//     this.messageContainer.classList.add(type);
//     this.messageContainer.getElementsByTagName("p")[0].textContent = message;
// };
// 
// HTMLActuator.prototype.clearMessage = function () {
//     // IE only takes one value to remove at a time.
//     this.messageContainer.classList.remove("game-won");
//     this.messageContainer.classList.remove("game-over");
// };