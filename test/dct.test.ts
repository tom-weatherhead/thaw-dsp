// test/dct.test.ts

'use strict';

import { dct } from '..'; // Test the transpiled code

// test('DCT Placeholder test', () => {
// 	// Arrange
// 	// Act
// 	// Assert
// 	expect(true).toBeTruthy();
// });

test('DCT test 1', () => {
	// Arrange
	const expectedResult = [16320, 0, 0, 0, 0, 0, 0, 0];
	const srcData: number[] = new Array(8).fill(255);

	// Act
	const actualResult = dct(srcData, 8);

	console.log('DCT actualResult:', actualResult);

	// Assert
	expect(actualResult).toStrictEqual(expectedResult);
});
