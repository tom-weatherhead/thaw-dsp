// test/fft.test.ts

'use strict';

import { fft, realFft, roundForFFT } from '..';

test('Complex FFT test 1', () => {
	// Arrange
	const expectedResult = [
		0, 0, 0, 0, 0, 0, 0, 0, 0, -8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0,
		0, 0, 0
	];
	const expectedN = 16;

	// const srcData = [
	// 	0, 0, 1, 0, 0, 0, -1, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 0, 1, 0, 0, 0, -1, 0,
	// ]; // pairs: real and imaginary

	const srcData: number[] = [];

	for (let i = 0; i < expectedN; i++) {
		const realPart = Math.sin((i * Math.PI) / 2);

		srcData.push(roundForFFT(realPart));
		srcData.push(0);
	}

	const n = srcData.length / 2; // Length of linear fft: this is a power of 2
	const pwr = 4; // The power of 2 that N is
	const pixelOffset = 2;

	expect(n).toBe(expectedN); // So that 2 ^ pwr === n

	// Act
	const actualResult = fft(srcData, n, pwr, pixelOffset);

	console.log('Complex FFT data in:', srcData);
	console.log('Complex FFT data out:', actualResult);

	// Assert
	expect(actualResult).toStrictEqual(expectedResult);
});

test('Real FFT test 1', () => {
	// Arrange
	const expectedResult = [0, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0];
	const expectedN = 16;
	const srcData: number[] = [];

	for (let i = 0; i < expectedN; i++) {
		// const realPart = Math.sin((i * Math.PI) / 2);
		const realPart = Math.sin((i * Math.PI) / 4);

		srcData.push(roundForFFT(realPart));
	}

	const n = srcData.length; // / 2; // Length of linear fft: this is a power of 2
	const pwr = 4; // The power of 2 that N is
	const pixelOffset = 1; // 2;

	expect(n).toBe(expectedN); // So that 2 ^ pwr === n

	// Act
	const actualResult = realFft(srcData, n, pwr, pixelOffset);

	console.log('realFft data in:', srcData);
	console.log('realFft data out:', actualResult);

	// Assert
	expect(actualResult).toStrictEqual(expectedResult);
});

test('Two-way complex FFT test 1', () => {
	// Arrange
	const expectedResult = [
		0, 0, 0, 0, 0, 0, 0, 0, 0, -8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0,
		0, 0, 0
	];
	const expectedN = 16;

	// const srcData = [
	// 	0, 0, 1, 0, 0, 0, -1, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0, 0, 1, 0, 0, 0, -1, 0,
	// ]; // pairs: real and imaginary

	const srcData: number[] = [];

	for (let i = 0; i < expectedN; i++) {
		const realPart = Math.sin((i * Math.PI) / 2);

		srcData.push(roundForFFT(realPart));
		srcData.push(0);
	}

	const n = srcData.length / 2; // Length of linear fft: this is a power of 2
	const pwr = 4; // The power of 2 that N is
	const pixelOffset = 2;

	expect(n).toBe(expectedN); // So that 2 ^ pwr === n

	// Act
	const actualResult = fft(srcData, n, pwr, pixelOffset);

	console.log('Complex FFT data in:', srcData);
	console.log('Complex FFT data out:', actualResult);

	const actualResultOfIfft = fft(actualResult, n, pwr, pixelOffset, true);

	console.log('Complex IFFT data out:', actualResultOfIfft);

	// Assert
	expect(actualResult).toStrictEqual(expectedResult);
	expect(actualResultOfIfft).toStrictEqual(srcData);
});
