/// <reference path="game_manager.ts"/>
var Click = (function () {
    function Click(x, y) {
        this.x = x;
        this.y = y;
    }
    return Click;
})();
var Restart = (function () {
    function Restart() {
    }
    return Restart;
})();
var TsKeyboardInputManager = (function () {
    function TsKeyboardInputManager(boardEventHandler) {
        this.boardEventHandler = boardEventHandler;
        this.listen();
    }
    TsKeyboardInputManager.prototype.listen = function () {
        var _this = this;
        // Respond to mouse presses
        addEventListener("mousedown", function (ev) {
            console.log(ev);
            // Every div has it's own id, using this id we can compute row and col
            var i = ev.target["id"];
            var _a = [Math.floor((i - 1) / 3), ((i - 1) % 3)], y = _a[0], x = _a[1];
            _this.raise(ev, new Click(x, y));
        });
        // Respond to button presses
        this.bindButtonPress(".new-game-button", this.raiseRestart);
        this.bindButtonPress(".restart-button", this.raiseRestart);
        // Respond to touch event
        // TODO: why not to use grid-container? in this case scope would be even smaller!
        //document.getElementsByClassName()
        var gameContainer = document.getElementsByClassName("game-container")[0];
        // TODO: check with IE! In 2048 magic tricks are used!
        gameContainer.addEventListener("touchend", function (ev) {
            console.log(ev);
            // Every div has it's own id, using this id we can compute row and col
            var i = ev.target["id"];
            var _a = [Math.floor((i - 1) / 3), ((i - 1) % 3)], y = _a[0], x = _a[1];
            _this.raise(ev, new Click(x, y));
        });
    };
    TsKeyboardInputManager.prototype.raise = function (event, boardEvent) {
        event.preventDefault();
        this.boardEventHandler(boardEvent);
    };
    TsKeyboardInputManager.prototype.raiseRestart = function (event) {
        // this.raise(event, {restart: true});
        this.raise(event, new Restart());
    };
    TsKeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
        // Bind mouse click and touch press with function invocations
        var button = document.querySelector(selector);
        button.addEventListener("click", fn.bind(this));
        button.addEventListener("touchend", fn.bind(this));
    };
    return TsKeyboardInputManager;
})();
//# sourceMappingURL=keyboard_input_manager.js.map