/// <reference path="../Scripts/tile.ts"/>

module Tile_Tests {

    QUnit.module("Tile.ts tests");

    import Tile = Model.Tile;

    test("tests for getAnotherValue()", () => {

        equal(Model.getAnotherValue(Tile.X), Tile.O);
        equal(Model.getAnotherValue(Tile.O), Tile.X);
        equal(Model.getAnotherValue(undefined), undefined);
    });
}