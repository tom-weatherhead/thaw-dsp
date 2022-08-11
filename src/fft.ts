// fft.ts - Fast Fourier Transform

// TODO

export function roundForFFT(n: number): number {
	// const roundingFactor = 1000000;
	const roundingFactor = 10000;
	const result = Math.round(n * roundingFactor) / roundingFactor;

	return result || 0; // Try to avoid returning -0
}
