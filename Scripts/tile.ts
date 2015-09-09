
module Model {
    export enum Tile {
        // Values shoud start form 1, because otherwise first value would be falsy
        X = 1,
        O = 2,
    }

    export function getTileValue(value: Tile): string {
        return value === Tile.X ? 'X' : 'O';
    }

    export function getAnotherValue(value: Tile): Tile {
        if (!value) {
            return undefined;
        }

        return (value) % 2 + 1;
    }
}
