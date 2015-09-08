/// <reference path="game_manager.ts"/>

class Click {
    constructor(public x: number, public y: number) {}
}

class Restart {}

type InputEvent = Click | Restart;

class TsKeyboardInputManager {
    boardEventHandler: (event: InputEvent) => void;

    constructor(boardEventHandler: (boardHandler: InputEvent) => void) {
        this.boardEventHandler = boardEventHandler;
        this.listen();
    }
    
    private listen() {
        // Respond to mouse presses
        addEventListener("mousedown", 
            (ev: MouseEvent) => {
                console.log(ev);
                // Every div has it's own id, using this id we can compute row and col
                let i = <number>ev.target["id"];
                let [y, x] = [Math.floor((i-1)/3), ((i-1) % 3)];
                this.raise(ev, new Click(x, y));
            });

        // Respond to button presses
        this.bindButtonPress(".new-game-button", this.raiseRestart);
        this.bindButtonPress(".restart-button", this.raiseRestart);
    
        // Respond to touch event
        // TODO: why not to use grid-container? in this case scope would be even smaller!
        //document.getElementsByClassName()
        var gameContainer = <HTMLElement>document.getElementsByClassName("game-container")[0];
    
        // TODO: check with IE! In 2048 magic tricks are used!
        gameContainer.addEventListener("touchend", (ev: TouchEvent) => {
            console.log(ev);
            // Every div has it's own id, using this id we can compute row and col
            let i = <number>ev.target["id"];
            let [y, x] = [Math.floor((i-1)/3), ((i-1) % 3)];
            this.raise(ev, new Click(x, y));
        });
    }

    private raise(event: Event, boardEvent: InputEvent) {
        event.preventDefault();
        this.boardEventHandler(boardEvent);
    }

    raiseRestart(event: Event) {
        // this.raise(event, {restart: true});
        this.raise(event, new Restart());
    }
    
    bindButtonPress(selector: string, fn: Function) {
        // Bind mouse click and touch press with function invocations
        var button = document.querySelector(selector);
        button.addEventListener("click", fn.bind(this));
        button.addEventListener("touchend", fn.bind(this));
    }
}
