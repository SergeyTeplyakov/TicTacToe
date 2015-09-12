
module Model {
    export enum Tile {
        // Values shoud start form 1, because otherwise first value would be falsy
        X = 1,
        O = 2,
    }

    export function getTileDisplayClass(value: Tile): string {
        //return value === Tile.X ? "8" : "16";
        return value === Tile.X ? "X" : "O";
    }

    export function getTileString(value: Tile): string {
        return value === Tile.X ? "\u274C" : "\u25EF";
    }

    export function getAnotherValue(value: Tile): Tile {
        if (!value) {
            return undefined;
        }

        return (value) % 2 + 1;
    }
}
