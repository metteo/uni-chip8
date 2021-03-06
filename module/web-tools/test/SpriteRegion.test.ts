//! --------------------------------------------------------------------------------------------------------------------
//! Copyright (C) 2019 Team Chipotle
//! MIT License
//! --------------------------------------------------------------------------------------------------------------------

import SpriteRegion from '../scripts/SpriteRegion';

describe('Sprite Region', () => {
	it('Constructor', () => {
		// The constructor should fill false to all pixels.
		let testRegion: SpriteRegion = new SpriteRegion();
		for (let row: number = 0; row < SpriteRegion.ROWS; ++row) {
			for (let column: number = 0; column < SpriteRegion.COLUMNS; ++column) {
				expect(testRegion.getPixel(column, row)).toStrictEqual(false);
			}
		}
	});

	it('Pixel Set', () => {
		let testRegion: SpriteRegion = new SpriteRegion();

		// Test single pixel
		let randomColumn: number = Math.floor(Math.random() * (SpriteRegion.COLUMNS - 1));
		let randomRow: number = Math.floor(Math.random() * (SpriteRegion.ROWS - 1));

		testRegion.setPixel(randomColumn, randomRow, true);
		expect(testRegion.getPixel(randomColumn, randomRow)).toStrictEqual(true);
	});

	it('Pixel Unset', () => {
		let testRegion: SpriteRegion = new SpriteRegion();

		// Test single pixel
		let randomColumn: number = Math.floor(Math.random() * (SpriteRegion.COLUMNS - 1));
		let randomRow: number = Math.floor(Math.random() * (SpriteRegion.ROWS - 1));

		testRegion.setPixel(randomColumn, randomRow, true);
		testRegion.setPixel(randomColumn, randomRow, false);
		expect(testRegion.getPixel(randomColumn, randomRow)).toStrictEqual(false);
	});

	it('Row Conversion', () => {
		let testRegion: SpriteRegion = new SpriteRegion();

		let randomRow: number = Math.floor(Math.random() * (SpriteRegion.ROWS - 1));
		let targetColumns: number[] = new Array<number>();
		for (let column: number = 0; column < SpriteRegion.COLUMNS; ++column) {
			if (Math.random() >= 0.5) {
				targetColumns.push(column);
			}
		}

		let expectedAccumulator: number = 0;

		targetColumns.forEach((column: number) => {
			testRegion.setPixel(column, randomRow, true);
			expectedAccumulator += Math.pow(2, SpriteRegion.COLUMNS - 1 - column);
		});

		expect(testRegion.getRow(randomRow)).toStrictEqual(expectedAccumulator);
	});

	it('Data Get', () => {
		let testRegion: SpriteRegion = new SpriteRegion();

		let expectedData: number[] = [];

		for (let row: number = 0; row < SpriteRegion.ROWS; ++row) {
			let expectedAccumulator: number = 0;

			if (Math.random() >= 0.5) {
				for (let column: number = 0; column < SpriteRegion.COLUMNS; ++column) {
					if (Math.random() >= 0.5) {
						testRegion.setPixel(column, row, true);
						expectedAccumulator += Math.pow(2, SpriteRegion.COLUMNS - 1 - column);
					}
				}
			}
			expectedData.push(expectedAccumulator);
		}

		let spriteData: number[] = testRegion.getData();

		// Test that all rows were included
		expect(expectedData.length).toStrictEqual(spriteData.length);

		for (let i: number = 0; i < expectedData.length; ++i) {
			expect(expectedData[i]).toStrictEqual(spriteData[i]);
		}
	});

	it('8 Sprite', () => {
		let testRegion: SpriteRegion = new SpriteRegion();
		for (let row: number = 0; row <= 4; row += 2) {
			for (let column: number = 0; column <= 2; ++column) {
				testRegion.setPixel(column, row, true);
			}
		}

		for (let row: number = 1; row <= 3; row += 2) {
			testRegion.setPixel(0, row, true);
			testRegion.setPixel(2, row, true);
		}

		let expectedData: number[] = [0xe0, 0xa0, 0xe0, 0xa0, 0xe0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0];

		let actualData: number[] = testRegion.getData();

		expect(expectedData.length).toStrictEqual(actualData.length);
		for (let i: number = 0; i < expectedData.length; ++i) {
			expect(actualData[i]).toStrictEqual(expectedData[i]);
		}
	});

	it('Horizontal Shift', () => {
		let testRegion: SpriteRegion = new SpriteRegion();
		testRegion.setPixel(0, 0, true);

		testRegion.shiftRight();
		expect(testRegion.getPixel(0, 0)).toStrictEqual(false);
		expect(testRegion.getPixel(1, 0)).toStrictEqual(true);

		testRegion.shiftLeft();
		expect(testRegion.getPixel(0, 0)).toStrictEqual(true);
		expect(testRegion.getPixel(1, 0)).toStrictEqual(false);
	});

	it('Vertical Shift', () => {
		let testRegion: SpriteRegion = new SpriteRegion();
		// return;
		testRegion.setPixel(0, 0, true);

		testRegion.shiftDown();
		expect(testRegion.getPixel(0, 0)).toStrictEqual(false);
		expect(testRegion.getPixel(0, 1)).toStrictEqual(true);

		testRegion.shiftUp();
		expect(testRegion.getPixel(0, 0)).toStrictEqual(true);
		expect(testRegion.getPixel(0, 1)).toStrictEqual(false);
	});

	it('Align', () => {
		let testRegion: SpriteRegion = new SpriteRegion();
		testRegion.setPixel(1, 1, true);
		testRegion.align();
		expect(testRegion.getPixel(0, 0)).toStrictEqual(true);
		expect(testRegion.getPixel(1, 1)).toStrictEqual(false);
	});

	it('Clear', () => {
		let testRegion: SpriteRegion = new SpriteRegion();
		for (let row: number = 0; row < SpriteRegion.ROWS; ++row) {
			for (let column: number = 0; column < SpriteRegion.COLUMNS; ++column) {
				testRegion.setPixel(column, row, Math.random() >= 0.5);
			}
		}
		testRegion.clear();
		for (let row: number = 0; row < SpriteRegion.ROWS; ++row) {
			for (let column: number = 0; column < SpriteRegion.COLUMNS; ++column) {
				expect(testRegion.getPixel(column, row)).toStrictEqual(false);
			}
		}
	});
});
