/// <reference path="tile.ts"/>
/// <reference path="state.ts"/>

module Model {
    export class Grid {
        // First move is critical for the game
        firstMove: Tile;
        size: number;
        cells: Array<Tile[]>;

        constructor(size: number, firstMove: Tile, previousState?: Array<Tile[]>) {
            this.size = size;
            this.firstMove = firstMove;
            this.cells = previousState ? fromState(size, previousState) : empty(size);
        }

        public nextPlayer(): Tile {
            // Next player depends not only on the lengths of available cells
            // firstMove == X and occupiedCount == 0 -> X
            // firstMove == X and occupiedCount == 1 -> O
            // firstMove == O and occupiedCount == 0 -> O
            // firstMove == O and occupiedCount == 1 -> X
            // Keep in mind, that Value.X is 1!
            let gameStatus = this.gameStatus();

            if (gameStatus !== GameStatus.KeepPlaying) {
                return undefined;
            }

            let occupied = this.occupiedCount();

            return ((occupied + this.firstMove) % 2 === 1) ? Tile.X : Tile.O;
        }

        public getState(x: number, y: number): Tile {
            this.checkBounds(x, y);

            return this.cells[x][y];
        }

        public gameStatus(): GameStatus {
            if (this.checkWinner() !== undefined) {
                return GameStatus.Victory;
            }

            if (this.isFull()) {
                return GameStatus.Draw;
            }

            return GameStatus.KeepPlaying;
        }

        public isOccupied(x: number, y: number): boolean {
            return this.getState(x, y) ? true : false;
        }

        public makeMove(x: number, y: number, value?: Tile): MoveResult {
            if (this.isOccupied(x, y)) {
                throw new Error(`Position (${x}, ${y}) was already occupied`);
            }

            value = value || this.nextPlayer();
            this.checkBounds(x, y);

            this.cells[x][y] = value;

            let winner = this.checkWinner();
            if (winner !== undefined) {
                return new Victory(winner);
            }
            else if (this.isFull()) {
                return new Draw();
            }

            return new KeepPlaying();
        }

        winner(): Tile {
            return this.checkWinner();
        }

        public nonEmptyCells(): { x: number, y: number, value: Tile }[] {
            let tiles = [];

            this.eachCell((x, y, value) => {
                if (value) {
                    tiles.push({ x: x, y: y, value: value});
                }
            });

            return tiles;
        }

        public emptyCells(): { x: number, y: number, value: Tile }[] {
            let tiles = [];

            this.eachCell((x, y, value) => {
                if (!value) {
                    tiles.push({ x: x, y: y, value: value });
                }
            });

            return tiles;
        }

        public serialize(): { size: number, cells: Array<Tile[]> } {
            var cellState = new Array<Tile[]>(this.size);

            for (var x = 0; x < this.size; x++) {
                var row = cellState[x] = new Array<Tile>(this.size);

                for (var y = 0; y < this.size; y++) {
                    row.push(this.cells[x][y] ? this.cells[x][y] : null);
                }
            }

            return {
                size: this.size,
                cells: cellState
            };
        }

        // Checks whether grid is full or not
        private isFull(): boolean {
            return this.emptyCells().length === 0;
        }

        private checkBounds(x: number, y: number) {
            if (x < 0 || x >= this.size) {
                throw new Error(`Out of bounds error. x: ${x}, size: ${this.size}`);
            }
            if (y < 0 || y >= this.size) {
                throw new Error(`Out of bounds error. x: ${x}, size: ${this.size}`);
            }
        }

        // Super primitive implementation that checks a winner.
        private checkWinner(): Tile {
            let diag1 = [this.cells[0][0], this.cells[1][1], this.cells[2][2]];
            let diag2 = [this.cells[2][0], this.cells[1][1], this.cells[0][2]];

            let result: Tile;

            if ((result = this.allTheSame(diag1)) !== undefined) {
                return result;
            }

            if ((result = this.allTheSame(diag2)) !== undefined) {
                return result;
            }

            for (let n = 0; n < this.size; n++) {
                let row = [this.cells[n][0], this.cells[n][1], this.cells[n][2]];
                let col = [this.cells[0][n], this.cells[1][n], this.cells[2][n]];

                if ((result = this.allTheSame(row)) !== undefined) {
                    return result;
                }

                if ((result = this.allTheSame(col)) !== undefined) {
                    return result;
                }
            }

            return undefined;
        }

        private occupiedCount(): number {
            return this.nonEmptyCells().length;
        }

        private allTheSame(array: Tile[]): Tile {
            if (array.every(t => t === Tile.X)) {
                return Tile.X;
            }
            if (array.every(t => t === Tile.O)) {
                return Tile.O;
            }

            return undefined;
        }

        // Call callback for every cell  
        private eachCell(callback: (x: number, y: number, tile: Tile) => void): void {
            for (var x = 0; x < this.size; x++) {
                for (var y = 0; y < this.size; y++) {
                    callback(x, y, this.cells[x][y]);
                }
            }
        }
    }

    //---------------------------------------------------------------------------------
    // Free helper functions
    //---------------------------------------------------------------------------------
    function fromState(size: number, state: Array<Tile[]>): Tile[][] {
        var cells = new Array<Tile[]>(size);

        for (var x = 0; x < size; x++) {
            var row = cells[x] = new Array<Tile>(size);

            for (var y = 0; y < size; y++) {
                row[y] = state[x][y];
            }
        }

        return cells;
    }

    function empty(size: number): Array<Tile[]> {
        var cells = new Array<Tile[]>(size);

        for (let x = 0; x < size; x++) {
            cells[x] = new Array<Tile>(size);
        }

        return cells;
    }
}