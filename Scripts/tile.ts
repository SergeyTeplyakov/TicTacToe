
module Model {
    export enum Tile {
        // Values shoud start form 1, because otherwise first value would be falsy
        X = 1,
        O = 2,
    }

    export interface TileState {
        x: number,
        y: number,
        state: Tile,
    }

    export function getTileDisplayClass(value: Tile): string {
        return value === Tile.X ? "X" : "O";
    }

    export function getTileString(value: Tile): string {
        //return value === Tile.X ? "\u274C" : "\u25EF";
        return value === Tile.X ? "\u2715" : "\u25EF";
    }

    export function getAnotherValue(value: Tile): Tile {
        if (!value) {
            return undefined;
        }

        return (value) % 2 + 1;
    }
}
