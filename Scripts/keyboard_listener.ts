module Control {

    export class TileClick {
        constructor(public x: number, public y: number) { }
    }

    export class Restart { }

    export type InputEvent = TileClick | Restart;

    export interface AbstractKeyboardListener {
        subscribe(handler: (event: InputEvent) => void): void;
    }

    export class KeyboardListener implements AbstractKeyboardListener {
        eventHandler: (event: InputEvent) => void;

        constructor(private gridSize: number) {
            this.listen();
        }

        public subscribe(handler: (event: InputEvent) => void): void {
            this.eventHandler = handler;
        }

        private listen() {
            // TODO: why not to use the same approach and not to add evenlistener to sub-divs??
            // Respond to mouse presses
            addEventListener("mousedown",
                (ev: MouseEvent) => {
                    // Every div has it's own id, using this id we can compute row and col
                    let i = <number>ev.target["id"];
                    let [y, x] = [Math.floor((i - 1) / this.gridSize), ((i - 1) % this.gridSize)];
                    this.raise(ev, new TileClick(x, y));
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
                let [y, x] = [Math.floor((i - 1) / this.gridSize), ((i - 1) % this.gridSize)];
                this.raise(ev, new TileClick(x, y));
            });
        }

        private raise(event: Event, boardEvent: InputEvent) {
            event.preventDefault();

            if (this.eventHandler) {
                this.eventHandler(boardEvent);
            }
        }

        private raiseRestart(event: Event) {
            this.raise(event, new Restart());
        }

        bindButtonPress(selector: string, fn: Function) {
            // Bind mouse click and touch press with function invocations
            var button = document.querySelector(selector);
            button.addEventListener("click", fn.bind(this));
            button.addEventListener("touchend", fn.bind(this));
        }
    }
}