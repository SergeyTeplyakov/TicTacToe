module Model {
    
    /**
     * Represents current game state.
     */
    export interface GameSnapshot {
        firstPlayer: Tile;
        nextPlayer: Tile;

        gameStatus: GameStatus;
        winner: Tile;

        grid: {
            size: number;
            longestStrike: number;
            cells: Tile[][];
        }
    }

    export interface GameStatistics {
        firstPlayerScore: number;
        secondPlayerScore: number;        
    }

    export enum GameStatus {
        Draw,
        Victory,
        KeepPlaying,
    }

    export class Draw { }

    export class KeepPlaying { }

    export class Victory {
        constructor(public winner: Tile) { }
    }

    export type MoveResult = KeepPlaying | Draw | Victory;

}