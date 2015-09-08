/// <reference path="tile.ts"/>
/// <reference path="grid.ts"/>
// TODO: MVP-like pattern is required here!
// Or event-based stuff, maybe!
function normalizePosition(position) {
    return { x: position.x + 1, y: position.y + 1 };
}
function getPositionClass(position) {
    var np = normalizePosition(position);
    return "tile-position-" + np.x + "-" + np.y;
}
var HtmlActuator = (function () {
    function HtmlActuator() {
        this.tileContainer = document.querySelector(".tile-container");
        this.firstPlayerScoreContainer = document.querySelector(".first-player-container");
        this.secondPlayerScoreContainer = document.querySelector(".second-player-container");
        this.messageContainer = document.querySelector(".game-message");
        this.score = 0;
    }
    HtmlActuator.prototype.actuate = function (grid, metadata) {
        var _this = this;
        window.requestAnimationFrame(function () {
            _this.clearContainer(_this.tileContainer);
            grid.cells.forEach(function (column) {
                column.forEach(function (cell) {
                    if (cell) {
                        _this.addTile(cell);
                    }
                });
            });
            _this.updateScore(metadata.firstPlayerScore, metadata.secondPlayerScore);
            _this.updateBestScore(metadata.bestScore);
            if (metadata.terminated) {
                if (metadata.over) {
                    _this.message(false); // You lose
                }
                else if (metadata.won) {
                    _this.message(true); // You win!
                }
            }
        });
    };
    ;
    // Continues the game (both restart and keep playing)
    HtmlActuator.prototype.continueGame = function () {
        this.clearMessage();
    };
    ;
    HtmlActuator.prototype.clearContainer = function (container) {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    };
    ;
    HtmlActuator.prototype.addTile = function (tile) {
        var self = this;
        var wrapper = document.createElement("div");
        var inner = document.createElement("div");
        // TODO: lack of separation model from view! this is bad!
        var position = tile.getPreviousOrCurrentPosition();
        var positionClass = getPositionClass(position);
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
        }
        else if (tile.mergedFrom) {
            classes.push("tile-merged");
            this.applyClasses(wrapper, classes);
            // Render the tiles that merged
            tile.mergedFrom.forEach(function (merged) {
                self.addTile(merged);
            });
        }
        else {
            classes.push("tile-new");
            this.applyClasses(wrapper, classes);
        }
        // Add the inner part of the tile to the wrapper
        wrapper.appendChild(inner);
        // Put the tile on the board
        this.tileContainer.appendChild(wrapper);
    };
    ;
    HtmlActuator.prototype.applyClasses = function (element, classes) {
        element.setAttribute("class", classes.join(" "));
    };
    ;
    HtmlActuator.prototype.updateScore = function (firstPlayerScore, secondPlayerScore) {
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
    ;
    HtmlActuator.prototype.updateBestScore = function (bestScore) {
        this.secondPlayerScoreContainer.textContent = bestScore.toString();
    };
    ;
    HtmlActuator.prototype.draw = function () {
        var type = "game-over";
        var message = "Game over! This is DRAW!!";
        this.messageContainer.classList.add(type);
        this.messageContainer.getElementsByTagName("p")[0].textContent = message;
    };
    HtmlActuator.prototype.someoneWon = function (who) {
        // TODO move this stuff outside!
        var firstPlayersName = "Angie";
        var secondPlayersName = "Daddy";
        var winner;
        if (who === 'X') {
            this.updateScore(this.firstPlayerScore + 1, this.secondPlayerScore);
            winner = "Angie";
        }
        else {
            this.updateScore(this.firstPlayerScore, this.secondPlayerScore + 1);
            winner = "Daddy";
        }
        var won = true;
        var type = won ? "game-won" : "game-over";
        var message = won ? winner + ": You win!" : "Game over!";
        this.messageContainer.classList.add(type);
        this.messageContainer.getElementsByTagName("p")[0].textContent = message;
    };
    HtmlActuator.prototype.message = function (won) {
        var type = won ? "game-won" : "game-over";
        var message = won ? "You win!" : "Game over!";
        this.messageContainer.classList.add(type);
        this.messageContainer.getElementsByTagName("p")[0].textContent = message;
    };
    ;
    HtmlActuator.prototype.clearMessage = function () {
        // IE only takes one value to remove at a time.
        this.messageContainer.classList.remove("game-won");
        this.messageContainer.classList.remove("game-over");
    };
    ;
    return HtmlActuator;
})();
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
//# sourceMappingURL=html_actuator.js.map