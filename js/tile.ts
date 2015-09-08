interface GameState {
    // score: number;
    firstPlayerScore: number;
    secondPlayerScore: number;
    over: boolean;
    won: boolean;
    keepPlaying: boolean;
    grid: {
        size: number;
        cells: Array<TileState[]>;
    }
}

// TODO: add namespace to avoid Tile suffix for Position type!
interface TilePosition {
    x: number;
    y: number;
}

interface TileState {
    position: TilePosition;
    value: string;
}

enum TileValue {
    X,
    O
}

class Tile {
    public x: number;
    public y: number;
    public value: string;
    public previousPosition: TilePosition;
    
    public getPreviousOrCurrentPosition(): TilePosition {
        return this.previousPosition || {x: this.x, y: this.y};
    }

    // TODO: next step - wrap this into methods and hide away!
    public mergedFrom: any;

    constructor(position: TilePosition, value: string) {
        this.x = position.x;
        this.y = position.y;
        this.value = value;
    }

    saveCurrentPositionAsPrevious(): void {
        // Not sure why, but those two operations are always in pair!
        this.mergedFrom = null;
        
        this.previousPosition = {
            x: this.x,
            y: this.y
        }
    }

    updatePosition(position: TilePosition): void {
        this.x = position.x;
        this.y = position.y;
    }

    serialize(): TileState {
        return {
            position: {
                x: this.x,
                y: this.y
            },
            value: this.value
        };
    }
    
    getValue(): string {
        return this.value;
    }
    
    getX(): number {
        return this.x;
    }
    
    getY(): number {
        return this.y;
    }
}

