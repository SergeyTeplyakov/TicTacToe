/// <reference path="assert.ts"/>
/// <reference path="tile.ts"/>
/// <reference path="state.ts"/>

module Model {
    export class Grid {
        // First move is critical for the game
        firstMove: Tile;
        public size: number;
        public strike: number;
        private cells: Array<Tile[]>;
        private occupiedCellsCount: number;

        // need to compute and store a winner becuse ther is no way to effectively compute 
        // the winner for the whole field
        private currentWinner: Tile;

        constructor(size: number, strike: number, firstMove: Tile, previousState?: Array<Tile[]>) {
            this.size = size;
            this.strike = strike;
            this.occupiedCellsCount = 0;
            this.firstMove = firstMove;
            this.cells = empty(size);

            if (previousState) {
                this.initState(size, previousState);
            }
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

            return ((this.occupiedCellsCount + this.firstMove) % 2 === 1) ? Tile.X : Tile.O;
        }

        public getState(x: number, y: number): Tile {
            this.checkBounds(x, y);

            return this.cells[x][y];
        }

        public gameStatus(): GameStatus {
            if (this.currentWinner !== undefined) {
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

            this.occupiedCellsCount++;
            this.cells[x][y] = value;

            let winner = this.checkWinner({x: x, y: y});
            if (winner !== undefined) {
                this.currentWinner = winner;
                return new Victory(winner);
            }
            else if (this.isFull()) {
                return new Draw();
            }

            return new KeepPlaying();
        }

        winner(): Tile {
            return this.currentWinner;
        }

        //public nonEmptyCells(): { x: number, y: number, value: Tile }[] {
        //    let tiles = [];

        //    this.eachCell((x, y, value) => {
        //        if (value) {
        //            tiles.push({ x: x, y: y, value: value});
        //        }
        //    });

        //    return tiles;
        //}

        //public emptyCells(): { x: number, y: number, value: Tile }[] {
        //    let tiles = [];

        //    this.eachCell((x, y, value) => {
        //        if (!value) {
        //            tiles.push({ x: x, y: y, value: value });
        //        }
        //    });

        //    return tiles;
        //}

        public serialize(): { size: number, longestStrike: number, cells: Array<Tile[]> } {
            var cellState = new Array<Tile[]>(this.size);

            for (var x = 0; x < this.size; x++) {
                var row = cellState[x] = new Array<Tile>(this.size);

                for (var y = 0; y < this.size; y++) {
                    row.push(this.cells[x][y] ? this.cells[x][y] : null);
                }
            }

            return {
                size: this.size,
                longestStrike: this.strike,
                cells: cellState
            };
        }

        // Checks whether grid is full or not
        private isFull(): boolean {
            return this.emptyCellsCount() === 0;
        }

        public emptyCellsCount() {
            return this.size * this.size - this.occupiedCellsCount;
        }

        private checkBounds(x: number, y: number) {
            if (x < 0 || x >= this.size) {
                throw new Error(`Out of bounds error. x: ${x}, size: ${this.size}`);
            }
            if (y < 0 || y >= this.size) {
                throw new Error(`Out of bounds error. x: ${x}, size: ${this.size}`);
            }
        }

        /*internal*/ longestStrike(array: Tile[]): { value: Tile, count: number } {
            let result: { value: Tile, count: number } = { value: undefined, count: 0 };

            let current: { value: Tile, count: number } = { value: undefined, count: 0 };
            for (let t of array) {
                if (t) {
                    if (current.value === t) {
                        current.count++;
                    } else {
                        current.value = t;
                        current.count = 1;
                    }
                }

                if (current.count > result.count) {
                    result = {value: current.value, count: current.count};
                }
            }

            return result;
        }

        /*internal*/ getSubArray(first: { x: number, y: number }, second: { x: number, y: number }): Tile[] {
            let x = first.x;
            let y = first.y;

            let result: Tile[] = [];
            let dx = (second.x > first.x) ? 1 : (second.x < first.x) ? -1 : 0;
            let dy = (second.y > first.y) ? 1 : (second.y < first.y) ? -1 : 0;

            Debug.assert(dx !== 0 || dy !== 0, "dx or dy should not be 0");
            //Debug.assert(dx === 1, 'dx === 1');
            //Debug.assert(dy === -1, `dy === -1. dx = ${dx}, dy = ${dy}. first: (${first.x}, ${first.y}), second: (${second.x}, ${second.y})`);
            while (true)
            {
                if (this.withinBounds(x, y)) {
                    result.push(this.cells[x][y]);
                }

                if (x === second.x && y === second.y) {
                    break;
                }

                x += dx;
                y += dy;
            }

            return result;
        }

        private withinBounds(x: number, y: number) {
            return (x >= 0 && x < this.size) && (y >= 0 && y < this.size);
        }

        public checkWinner2(p: { x: number, y: number }): Tile {
            let diff = this.strike - 1;
            
            let upperRight = { x: p.x + diff, y: p.y + diff };
            let bottomLeft = { x: p.x - diff, y: p.y - diff };

            let bottomLeftToUpperRight = this.getSubArray(bottomLeft, upperRight);

            let candidate = this.longestStrike(bottomLeftToUpperRight);
            if (candidate.value && candidate.count === this.strike) {
                return candidate.value;
            }
            return undefined;
        }

// Super primitive implementation that checks a winner.
        public checkWinner(p: {x: number, y: number}): Tile {
            // Need to get 4 arrays with max 2*strike - 1 elements and look for a strike in each of them
            let diff = this.strike - 1;

            let leftMost = { x: p.x, y: p.y - diff };
            let leftUpper = { x: p.x + diff, y: p.y - diff };
            let topMost = { x: p.x + diff, y: p.y };
            let upperRight = { x: p.x + diff, y: p.y + diff };
            let rightMost = { x: p.x, y: p.y + diff };
            let bottomRight = { x: p.x - diff, y: p.y + diff };
            let bottomMost = { x: p.x - diff, y: p.y };
            let bottomLeft = { x: p.x - diff, y: p.y - diff };

            let bottomLeftToUpperRight = this.getSubArray(bottomLeft, upperRight);
            let leftToRight = this.getSubArray(leftMost, rightMost);
            let upperLeftToBottomRight = this.getSubArray(leftUpper, bottomRight);
            let topToBottom = this.getSubArray(bottomMost, topMost);

            for (let array of [bottomLeftToUpperRight, leftToRight, upperLeftToBottomRight, topToBottom]) {
                let candidate = this.longestStrike(array);
                if (candidate.value && candidate.count === this.strike) {
                    return candidate.value;
                }
            }

            return undefined;
            //let diag1 = [this.cells[0][0], this.cells[1][1], this.cells[2][2]];
            //let diag2 = [this.cells[2][0], this.cells[1][1], this.cells[0][2]];

            //let result: Tile;

            //if ((result = this.allTheSame(diag1)) !== undefined) {
            //    return result;
            //}

            //if ((result = this.allTheSame(diag2)) !== undefined) {
            //    return result;
            //}

            //for (let n = 0; n < this.size; n++) {
            //    let row = [this.cells[n][0], this.cells[n][1], this.cells[n][2]];
            //    let col = [this.cells[0][n], this.cells[1][n], this.cells[2][n]];

            //    if ((result = this.allTheSame(row)) !== undefined) {
            //        return result;
            //    }

            //    if ((result = this.allTheSame(col)) !== undefined) {
            //        return result;
            //    }
            //}

            //return undefined;
        }

        //private allTheSame(array: Tile[]): Tile {
        //    if (array.every(t => t === Tile.X)) {
        //        return Tile.X;
        //    }
        //    if (array.every(t => t === Tile.O)) {
        //        return Tile.O;
        //    }

        //    return undefined;
        //}

        // Call callback for every cell  
        private eachCell(callback: (x: number, y: number, tile: Tile) => void): void {
            for (var x = 0; x < this.size; x++) {
                for (var y = 0; y < this.size; y++) {
                    callback(x, y, this.cells[x][y]);
                }
            }
        }

        initState(size: number, state: Array<Tile[]>): Tile[][] {
            var cells = new Array<Tile[]>(size);

            for (var x = 0; x < size; x++) {
                //var row = cells[x] = new Array<Tile>(size);

                for (var y = 0; y < size; y++) {
                    let tile = state[x][y];

                    if (tile) {
                        this.makeMove(x, y, tile);
                    }
                }
            }

            return cells;
        }
    }

    //---------------------------------------------------------------------------------
    // Free helper functions
    //---------------------------------------------------------------------------------

    function empty(size: number): Array<Tile[]> {
        var cells = new Array<Tile[]>(size);

        for (let x = 0; x < size; x++) {
            cells[x] = new Array<Tile>(size);
        }

        return cells;
    }

    //export function getSubArray(first: { x: number, y: number }, second: { x: number, y: number }): Tile[] {
    //    Debug.assert(first.x <= second.x || first.y <= second.y, `first position should be in upper left and second position - bottom right. first: (${first.x}, ${first.y}), second: (${second.x}, ${second.y})`);

    //    let current = { x: first.x, y: first.y };

    //    let result: Tile[] = [];

    //    let dx = (second.x - first.x) === 0 ? 0 : 1;
    //    let dy = (second.y - first.y) === 0 ? 0 : 1;

    //    Debug.assert(dx !== 0 || dy !== 0, "dx or dy should not be 0");

    //    do {
    //        if (this.withinBounds(current.x, current.y)) {
    //            result.push(this.cells[current.x][current.y]);
    //        }

    //        current.x += dx;
    //        current.y += dy;

    //    } while (current.x !== second.x && current.y !== second.y);

    //    return result;
    //}

}