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
        private moves: Array<TileState> = [];

        // need to compute and store a winner becuse ther is no way to effectively compute 
        // the winner for the whole field
        private currentWinner: Tile;

        constructor(size: number, strike: number, firstMove: Tile, previousState?: Array<Tile[]>) {
            this.size = size;
            this.strike = strike;
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

            return ((this.occupiedCellsCount() + this.firstMove) % 2 === 1) ? Tile.X : Tile.O;
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

            this.moves.push({ x: x, y: y, state: value });
            this.cells[x][y] = value;

            let winner = this.checkWinner({x: x, y: y});
            if (winner) {
                this.currentWinner = winner.tile;
                return new Victory(winner.tile, winner.strike);
            }
            else if (this.isFull()) {
                return new Draw();
            }

            return new KeepPlaying();
        }

        undoMove(): TileState {
            if (this.occupiedCellsCount() === 0) {
                return undefined;
            }

            let lastMove = this.moves.pop();
            this.cells[lastMove.x][lastMove.y] = undefined;
            this.currentWinner = undefined;

            return lastMove;
        }

        winner(): Tile {
            return this.currentWinner;
        }

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
            return this.size * this.size - this.occupiedCellsCount();
        }

        private occupiedCellsCount() {
            return this.moves.length;
        }

        private checkBounds(x: number, y: number) {
            if (x < 0 || x >= this.size) {
                throw new Error(`Out of bounds error. x: ${x}, size: ${this.size}`);
            }
            if (y < 0 || y >= this.size) {
                throw new Error(`Out of bounds error. x: ${x}, size: ${this.size}`);
            }
        }

        /** 
         * Checks the longest 'strike' of any tiles in the specified array.
        */
        /*internal*/ longestStrike(array: TileState[]): { value: Tile, strike: TileState[]} {
            let result: { value: Tile, begin: number, count: number } = { value: undefined, count: 0, begin: 0 };

            let current: { value: Tile, begin: number, count: number } = { value: undefined, count: 0, begin: 0 };

            for(let index = 0; index < array.length; index++) {
                let t = array[index];

                if (t) {
                    if (current.value === t.state) {
                        current.count++;
                    } else {
                        current.value = t.state;
                        current.begin = index;
                        current.count = 1;
                    }
                }

                if (current.count > result.count) {
                    result = {value: current.value, count: current.count, begin: current.begin};
                }
            }

            let subArray = array.slice(result.begin, result.begin + result.count);
            return { value: result.value, strike: subArray};
        }

        /*internal*/ getSubArray(first: { x: number, y: number }, second: { x: number, y: number }): TileState[] {
            let x = first.x;
            let y = first.y;

            let result: TileState[] = [];
            let dx = (second.x > first.x) ? 1 : (second.x < first.x) ? -1 : 0;
            let dy = (second.y > first.y) ? 1 : (second.y < first.y) ? -1 : 0;

            Debug.assert(dx !== 0 || dy !== 0, "dx or dy should not be 0");
            //Debug.assert(dx === 1, 'dx === 1');
            //Debug.assert(dy === -1, `dy === -1. dx = ${dx}, dy = ${dy}. first: (${first.x}, ${first.y}), second: (${second.x}, ${second.y})`);
            while (true)
            {
                if (this.withinBounds(x, y)) {
                    result.push({ x: x, y: y, state: this.cells[x][y] });
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

        public checkWinner(p: {x: number, y: number}): {tile: Tile, strike: {x: number, y: number}[]}  {
            // Implementation is relatively simple.
            // Because grid has arbitrary size the solution should be O(longestStrike) but
            // not O(gridSize).
            // To check winner, we need to check all diags with new point in the middle.

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
                if (candidate.value && candidate.strike.length >= this.strike) {
                    return { tile: candidate.value, strike: candidate.strike };
                }
            }

            return undefined;
        }

        initState(size: number, state: Array<Tile[]>): Tile[][] {
            var cells = new Array<Tile[]>(size);

            for (var x = 0; x < size; x++) {

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
}