// fft.ts - Fast Fourier Transform

const bitflip1 = [0, 1];
const bitflip2 = [0, 2, 1, 3];
const bitflip3 = [0, 4, 2, 6, 1, 5, 3, 7];
const bitflip4 = [0, 8, 4, 12, 2, 10, 6, 14, 1, 9, 5, 13, 3, 11, 7, 15];
const bitflip5 = [
	0, 16, 8, 24, 4, 20, 12, 28, 2, 18, 10, 26, 6, 22, 14, 30, 1, 17, 9, 25, 5, 21, 13, 29, 3,
	19, 11, 27, 7, 23, 15, 31
];
const bitflip6 = [
	0, 32, 16, 48, 8, 40, 24, 56, 4, 36, 20, 52, 12, 44, 28, 60, 2, 34, 18, 50, 10, 42, 26, 58,
	6, 38, 22, 54, 14, 46, 30, 62, 1, 33, 17, 49, 9, 41, 25, 57, 5, 37, 21, 53, 13, 45, 29, 61,
	3, 35, 19, 51, 11, 43, 27, 59, 7, 39, 23, 55, 15, 47, 31, 63
];
const bitflip7 = [
	0, 64, 32, 96, 16, 80, 48, 112, 8, 72, 40, 104, 24, 88, 56, 120, 4, 68, 36, 100, 20, 84, 52,
	116, 12, 76, 44, 108, 28, 92, 60, 124, 2, 66, 34, 98, 18, 82, 50, 114, 10, 74, 42, 106, 26,
	90, 58, 122, 6, 70, 38, 102, 22, 86, 54, 118, 14, 78, 46, 110, 30, 94, 62, 126, 1, 65, 33,
	97, 17, 81, 49, 113, 9, 73, 41, 105, 25, 89, 57, 121, 5, 69, 37, 101, 21, 85, 53, 117, 13,
	77, 45, 109, 29, 93, 61, 125, 3, 67, 35, 99, 19, 83, 51, 115, 11, 75, 43, 107, 27, 91, 59,
	123, 7, 71, 39, 103, 23, 87, 55, 119, 15, 79, 47, 111, 31, 95, 63, 127
];
const bitflip8 = [
	0, 128, 64, 192, 32, 160, 96, 224, 16, 144, 80, 208, 48, 176, 112, 240, 8, 136, 72, 200, 40,
	168, 104, 232, 24, 152, 88, 216, 56, 184, 120, 248, 4, 132, 68, 196, 36, 164, 100, 228, 20,
	148, 84, 212, 52, 180, 116, 244, 12, 140, 76, 204, 44, 172, 108, 236, 28, 156, 92, 220, 60,
	188, 124, 252, 2, 130, 66, 194, 34, 162, 98, 226, 18, 146, 82, 210, 50, 178, 114, 242, 10,
	138, 74, 202, 42, 170, 106, 234, 26, 154, 90, 218, 58, 186, 122, 250, 6, 134, 70, 198, 38,
	166, 102, 230, 22, 150, 86, 214, 54, 182, 118, 246, 14, 142, 78, 206, 46, 174, 110, 238, 30,
	158, 94, 222, 62, 190, 126, 254, 1, 129, 65, 193, 33, 161, 97, 225, 17, 145, 81, 209, 49,
	177, 113, 241, 9, 137, 73, 201, 41, 169, 105, 233, 25, 153, 89, 217, 57, 185, 121, 249, 5,
	133, 69, 197, 37, 165, 101, 229, 21, 149, 85, 213, 53, 181, 117, 245, 13, 141, 77, 205, 45,
	173, 109, 237, 29, 157, 93, 221, 61, 189, 125, 253, 3, 131, 67, 195, 35, 163, 99, 227, 19,
	147, 83, 211, 51, 179, 115, 243, 11, 139, 75, 203, 43, 171, 107, 235, 27, 155, 91, 219, 59,
	187, 123, 251, 7, 135, 71, 199, 39, 167, 103, 231, 23, 151, 87, 215, 55, 183, 119, 247, 15,
	143, 79, 207, 47, 175, 111, 239, 31, 159, 95, 223, 63, 191, 127, 255
];

const bitflips = [
	bitflip1,
	bitflip2,
	bitflip3,
	bitflip4,
	bitflip5,
	bitflip6,
	bitflip7,
	bitflip8
];

const cosArray: number[] = [];
const sinArray: number[] = [];

for (let z = 2; z <= 65536; z *= 2) {
	const theta = (-2 * Math.PI) / z;

	cosArray.push(Math.cos(theta));
	sinArray.push(Math.sin(theta));
}

// Rearranges data in both real and imaginary arrays. This function is called before performing
// the actual FFT so the array elements are in the right order after FFT.
//
// From Volume 2 of GraphicsGems, chapter 7.2

function permute(a: number[], bitLength: number, itemStride: number): boolean {
	// The number of bits to flip per side of index value: our chunk size.
	const shift = Math.floor(bitLength / 2);
	const half = 1 << shift; // 2 to the chunk gives us our half-range.
	// The difference between the total bitLength and our chunk.
	const h = bitLength - shift;

	if (h <= 0 || h > 8 || Math.round(h) !== h) {
		// bitLength of fft size is > 16 bits: so do flipping of array the old slow way

		return false; // I.e. Error
	}

	// cases are the half-length of actual bitLength of fft data index.
	const fliparray = bitflips[h - 1];

	for (let low = 1; low < half; low++) {
		const limit = fliparray[low];
		const top = limit << shift;

		for (let high = 0; high < limit; high++) {
			// itemStride allows this algorithm to work both vertically and horizontally.
			const indexOld = ((high << shift) + low) * itemStride;
			const indexNew = (top + fliparray[high]) * itemStride;

			const tempReal = a[indexOld];
			const tempImaginary = a[indexOld + 1];

			a[indexOld] = a[indexNew];
			a[indexOld + 1] = a[indexNew + 1];

			a[indexNew] = tempReal;
			a[indexNew + 1] = tempImaginary;
		}
	}

	return true; // I.e. No error
}

export function roundForFFT(n: number): number {
	// const roundingFactor = 1000000;
	const roundingFactor = 10000;
	const result = Math.round(n * roundingFactor) / roundingFactor;

	return result || 0; // Try to avoid returning -0
}

export function fft(
	inputData: number[], // Array: real part, imaginary, real, imaginary...
	n: number, // Length of linear fft: this is a power of 2
	log2n: number, // The power of 2 that N is
	pixelStride: number, // From one complex number to the next
	isInverseTransform = false // dir: number, // Direction of transform (forward or inverse)
	// i.e. Are we going to frequency domain or back?
): number[] {
	let re = inputData.slice(0); // Clone the array of input data

	// Permute before FFT or inverse FFT:

	if (!permute(re, log2n, pixelStride)) {
		throw new Error('fft() : permute() failed.');
	}

	let angleIndex = 0;

	for (let section = 1; section < n; section *= 2) {
		const flyDistance = 2 * section;
		const i1Increment = flyDistance * pixelStride;
		const i2Minusi1 = section * pixelStride;
		let i1Init = 0;

		if (angleIndex > cosArray.length || angleIndex > sinArray.length) {
			throw new Error('fft() : angleIndex out of range.');
		}

		// Recall these trigonometric identities:
		// cos(-theta) = cos(theta)
		// sin(-theta) = -sin(theta)
		const c = cosArray[angleIndex];
		const s = isInverseTransform ? -sinArray[angleIndex] : sinArray[angleIndex];

		angleIndex++;

		let qr = 1.0;
		let qi = 0.0;

		for (let counter = 0; counter < section; counter++) {
			let index1 = counter;

			// Index for element if we are going vertically
			let i1 = i1Init;
			let i2 = i1 + i2Minusi1;

			i1Init += pixelStride;

			do {
				const rei2 = re[i2];
				const imi2 = re[i2 + 1];

				index1 += flyDistance;

				const tempr = qr * rei2 - qi * imi2;
				const tempi = qr * imi2 + qi * rei2;

				const rei1 = re[i1];
				const imi1 = re[i1 + 1];

				re[i2] = rei1 - tempr; // For the real part
				re[i1] = rei1 + tempr;
				re[i2 + 1] = imi1 - tempi; // For the imaginary part
				re[i1 + 1] = imi1 + tempi;

				i1 += i1Increment;
				i2 += i1Increment;
			} while (index1 < n);

			// Calculate new Q = cos(ak) + j * sin(ak) = qr + j * qi
			// where a = -2 * pi / N

			const temp = qr;

			qr = qr * c - qi * s;
			qi = qi * c + temp * s;
		} // end for counter
	} // end for section

	if (isInverseTransform) {
		// Normalize for inverse FFT only
		const scale = 1.0 / n;

		re = re.map((n) => n * scale);
	}

	return re.map(roundForFFT);
}

// realFft() : A wrapper that accepts and returns arrays of real numbers
// instead of complex numbers.

export function realFft(
	srcData: number[],
	n: number, // Length of linear fft: this is a power of 2
	log2n: number, // The power of 2 that N is
	pixelStride: number, // From one complex number to the next
	isInverseTransform = false // Direction of transform (forward or inverse)
): number[] {
	const complexData: number[] = [];

	for (const datum of srcData) {
		complexData.push(datum);
		complexData.push(0);
	}

	const complexResult = fft(complexData, n, log2n, pixelStride * 2, isInverseTransform);

	const result: number[] = [];

	for (let i = 0; i < complexResult.length; i += 2) {
		const realPart = complexResult[i];
		const imaginaryPart = complexResult[i + 1];
		const magnitude = roundForFFT(
			Math.sqrt(realPart * realPart + imaginaryPart * imaginaryPart)
		);

		result.push(magnitude);
	}

	return result;
}
