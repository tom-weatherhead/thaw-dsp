// dct.ts - Discrete Cosine Transform

// From https://github.com/vail-systems/node-dct

import { roundForFFT } from './fft';

/*==========================================================================*\
 * Discrete Cosine Transform
 *
 * (c) Vail Systems. Joshua Jung and Ben Bryan. 2015
 *
 * This code is not designed to be highly optimized but as an educational
 * tool to understand the Mel-scale and its related coefficients used in
 * human speech analysis.
\*==========================================================================*/

const cosMap: number[][] = [];

// Builds a cosine map for the given input size. This allows multiple input sizes to be
// memoized automagically if you want to run the DCT over and over.
function memoizeCosines(N: number): number[] {
	cosMap[N] = new Array(N * N);

	const PI_N = Math.PI / N;

	for (let k = 0; k < N; k++) {
		for (let n = 0; n < N; n++) {
			cosMap[N][n + k * N] = Math.cos(PI_N * (n + 0.5) * k);
		}
	}

	return cosMap[N];
}

export function dct(
	signal: number[],
	scale: number
	// , cosMap?: number[]
): number[] {
	const L = signal.length;

	scale = scale || 2;

	if (typeof cosMap[L] === 'undefined') {
		memoizeCosines(L);
	}
	// Or: if (typeof cosMap === 'undefined') {
	// 	cosMap = createCosMap(L); // Here, cosMap is a number[]
	// }

	const coefficients = new Array(signal.length).fill(0);

	// return indices(coefficients).map((ix) => ...);
	return coefficients
		.map(
			(__, ix) =>
				scale *
				// signal.reduce(function (prev, cur, ix_, arr) {
				signal.reduce((prev, cur, ix_) => prev + cur * cosMap[L][ix_ + ix * L], 0)
		)
		.map(roundForFFT);
}

// ****

/* DCT and IDCT - listing 1
 * Copyright (c) 2001 Emil Mikulic.
 * http://unix4lyfe.org/dct/
 *
 * Feel free to do whatever you like with this code.
 * Feel free to credit me.
 */

// #include <stdio.h>
// #include <stdlib.h>
// #include <math.h>
// #include "targa.h"
//
//
//
// typedef uint8_t byte;
//
// #define pixel(i,x,y) ( (i)->image_data[((y)*( (i)->width ))+(x)] )
//
// #define DONTFAIL(x) do { tga_result res;  if ((res=x) != TGA_NOERR) { \
// 	printf("Targa error: %s\n", tga_error(res)); \
// 	exit(EXIT_FAILURE); } } while(0)
//
//
//
// void load_tga(tga_image *tga, const char *fn)
// {
// 	DONTFAIL( tga_read(tga, fn) );
//
// 	printf("Loaded %dx%dx%dbpp targa (\"%s\").\n",
// 		tga->width, tga->height, tga->pixel_depth, fn);
//
// 	if (!tga_is_mono(tga)) DONTFAIL( tga_desaturate_rec_601_1(tga) );
// 	if (!tga_is_top_to_bottom(tga)) DONTFAIL( tga_flip_vert(tga) );
// 	if (tga_is_right_to_left(tga)) DONTFAIL( tga_flip_horiz(tga) );
//
// 	if ((tga->width % 8 != 0) || (tga->height % 8 != 0))
// 	{
// 		printf("Width and height must be multiples of 8\n");
// 		exit(EXIT_FAILURE);
// 	}
// }
//
//
//
// #ifndef PI
//  #ifdef M_PI
//   #define PI M_PI
//  #else
//   #define PI 3.14159265358979
//  #endif
// #endif
//
//
//
// /* S[u,v] = 1/4 * C[u] * C[v] *
//  *   sum for x=0 to width-1 of
//  *   sum for y=0 to height-1 of
//  *     s[x,y] * cos( (2x+1)*u*PI / 2N ) * cos( (2y+1)*v*PI / 2N )
//  *
//  * C[u], C[v] = 1/sqrt(2) for u, v = 0
//  * otherwise, C[u], C[v] = 1
//  *
//  * S[u,v] ranges from -2^10 to 2^10
//  */
//
// #define COEFFS(Cu,Cv,u,v) { \
// 	if (u == 0) Cu = 1.0 / sqrt(2.0); else Cu = 1.0; \
// 	if (v == 0) Cv = 1.0 / sqrt(2.0); else Cv = 1.0; \
// 	}
//
// void dct(const tga_image *tga, double data[8][8],
// 	const int xpos, const int ypos)
// {
// 	int u,v,x,y;
//
// 	for (v=0; v<8; v++)
// 	for (u=0; u<8; u++)
// 	{
// 		double Cu, Cv, z = 0.0;
//
// 		COEFFS(Cu,Cv,u,v);
//
// 		for (y=0; y<8; y++)
// 		for (x=0; x<8; x++)
// 		{
// 			double s, q;
//
// 			s = pixel(tga, x+xpos, y+ypos);
//
// 			q = s * cos((double)(2*x+1) * (double)u * PI/16.0) *
// 				cos((double)(2*y+1) * (double)v * PI/16.0);
//
// 			z += q;
// 		}
//
// 		data[v][u] = 0.25 * Cu * Cv * z;
// 	}
// }
//
//
//
// /* play with this bit */
// void quantize(double dct_buf[8][8])
// {
// 	int x,y;
//
// 	for (y=0; y<8; y++)
// 	for (x=0; x<8; x++)
// 	if (x > 3 || y > 3) dct_buf[y][x] = 0.0;
// }
//
//
//
// void idct(tga_image *tga, double data[8][8],
// 	const int xpos, const int ypos)
// {
// 	int u,v,x,y;
//
// #if 0
// 	/* show the frequency data */
// 	double lo=0, hi=0;
// 	if (fabs(hi) > fabs(lo))
// 		lo = -hi;
// 	else
// 		hi = -lo;
//
// 	for (y=0; y<8; y++)
// 	for (x=0; x<8; x++)
// 	{
// 		byte z = (byte)( (data[y*8 + x] + 1024.0) / 2048.0 * 255.0);
// 		put_pixel(im, x+xpos, y+ypos, z);
// 	}
//
// #else
// 	/* iDCT */
// 	for (y=0; y<8; y++)
// 	for (x=0; x<8; x++)
// 	{
// 		double z = 0.0;
//
// 		for (v=0; v<8; v++)
// 		for (u=0; u<8; u++)
// 		{
// 			double S, q;
// 			double Cu, Cv;
//
// 			COEFFS(Cu,Cv,u,v);
// 			S = data[v][u];
//
// 			q = Cu * Cv * S *
// 				cos((double)(2*x+1) * (double)u * PI/16.0) *
// 				cos((double)(2*y+1) * (double)v * PI/16.0);
//
// 			z += q;
// 		}
//
// 		z /= 4.0;
// 		if (z > 255.0) z = 255.0;
// 		if (z < 0) z = 0.0;
//
// 		pixel(tga, x+xpos, y+ypos) = (uint8_t) z;
// 	}
// #endif
// }
//
//
//
// int main()
// {
// 	tga_image tga;
// 	double dct_buf[8][8];
// 	int i, j, k, l;
//
// 	load_tga(&tga, "in.tga");
//
// 	k = 0;
// 	l = (tga.height / 8) * (tga.width / 8);
// 	for (j=0; j<tga.height/8; j++)
// 	for (i=0; i<tga.width/8; i++)
// 	{
// 		dct(&tga, dct_buf, i*8, j*8);
// 		quantize(dct_buf);
// 		idct(&tga, dct_buf, i*8, j*8);
// 		printf("processed %d/%d blocks.\r", ++k,l);
// 		fflush(stdout);
// 	}
// 	printf("\n");
//
// 	DONTFAIL( tga_write_mono("out.tga", tga.image_data,
// 		tga.width, tga.height) );
//
// 	tga_free_buffers(&tga);
// 	return EXIT_SUCCESS;
// }

// ****

/* DCT and IDCT - listing 2
 * Copyright (c) 2001 Emil Mikulic.
 * http://unix4lyfe.org/dct/
 *
 * Feel free to do whatever you like with this code.
 * Feel free to credit me.
 */

// #include <stdio.h>
// #include <stdlib.h>
// #include <math.h>
// #include "targa.h"
//
//
//
// typedef uint8_t byte;
//
// #define pixel(i,x,y) ( (i)->image_data[((y)*( (i)->width ))+(x)] )
//
// #define DONTFAIL(x) do { tga_result res;  if ((res=x) != TGA_NOERR) { \
// 	printf("Targa error: %s\n", tga_error(res)); \
// 	exit(EXIT_FAILURE); } } while(0)
//
//
//
// void load_tga(tga_image *tga, const char *fn)
// {
// 	DONTFAIL( tga_read(tga, fn) );
//
// 	printf("Loaded %dx%dx%dbpp targa (\"%s\").\n",
// 		tga->width, tga->height, tga->pixel_depth, fn);
//
// 	if (!tga_is_mono(tga)) DONTFAIL( tga_desaturate_rec_601_1(tga) );
// 	if (!tga_is_top_to_bottom(tga)) DONTFAIL( tga_flip_vert(tga) );
// 	if (tga_is_right_to_left(tga)) DONTFAIL( tga_flip_horiz(tga) );
//
// 	if ((tga->width % 8 != 0) || (tga->height % 8 != 0))
// 	{
// 		printf("Width and height must be multiples of 8\n");
// 		exit(EXIT_FAILURE);
// 	}
// }
//
//
//
// #ifndef PI
//  #ifdef M_PI
//   #define PI M_PI
//  #else
//   #define PI 3.14159265358979
//  #endif
// #endif
//
//
//
// /* DCT rows and columns separately
//  *
//  * C(i) = a(i)/2 * sum for x=0 to N-1 of
//  *   s(x) * cos( pi * i * (2x + 1) / 2N )
//  *
//  * if x = 0, a(x) = 1/sqrt(2)
//  *      else a(x) = 1
//  */
//
// void dct_1d(double *in, double *out, const int count)
// {
// 	int x, u;
//
// 	for (u=0; u<count; u++)
// 	{
// 		double z = 0;
//
// 		for (x=0; x<count; x++)
// 		{
// 			z += in[x] * cos(PI * (double)u * (double)(2*x+1)
// 				/ (double)(2*count));
// 		}
//
// 		if (u == 0) z *= 1.0 / sqrt(2.0);
// 		out[u] = z/2.0;
// 	}
// }
//
// void dct(const tga_image *tga, double data[8][8],
// 	const int xpos, const int ypos)
// {
// 	int i,j;
// 	double in[8], out[8], rows[8][8];
//
// 	/* transform rows */
// 	for (j=0; j<8; j++)
// 	{
// 		for (i=0; i<8; i++)
// 			in[i] = (double) pixel(tga, xpos+i, ypos+j);
// 		dct_1d(in, out, 8);
// 		for (i=0; i<8; i++) rows[j][i] = out[i];
// 	}
//
// 	/* transform columns */
// 	for (j=0; j<8; j++)
// 	{
// 		for (i=0; i<8; i++)
// 			in[i] = rows[i][j];
// 		dct_1d(in, out, 8);
// 		for (i=0; i<8; i++) data[i][j] = out[i];
// 	}
// }
//
//
//
// /* play with this bit */
// void quantize(double dct_buf[8][8])
// {
// 	int x,y;
//
// 	for (y=0; y<8; y++)
// 	for (x=0; x<8; x++)
// 	if (x > 3 || y > 3) dct_buf[y][x] = 0.0;
// }
//
//
//
// #define COEFFS(Cu,Cv,u,v) { \
// 	if (u == 0) Cu = 1.0 / sqrt(2.0); else Cu = 1.0; \
// 	if (v == 0) Cv = 1.0 / sqrt(2.0); else Cv = 1.0; \
// 	}
//
// void idct(tga_image *tga, double data[8][8], const int xpos, const int ypos)
// {
// 	int u,v,x,y;
//
// 	/* iDCT */
// 	for (y=0; y<8; y++)
// 	for (x=0; x<8; x++)
// 	{
// 		double z = 0.0;
//
// 		for (v=0; v<8; v++)
// 		for (u=0; u<8; u++)
// 		{
// 			double S, q;
// 			double Cu, Cv;
//
// 			COEFFS(Cu,Cv,u,v);
// 			S = data[v][u];
//
// 			q = Cu * Cv * S *
// 				cos((double)(2*x+1) * (double)u * PI/16.0) *
// 				cos((double)(2*y+1) * (double)v * PI/16.0);
//
// 			z += q;
// 		}
//
// 		z /= 4.0;
// 		if (z > 255.0) z = 255.0;
// 		if (z < 0) z = 0.0;
//
// 		pixel(tga, x+xpos, y+ypos) = (uint8_t) z;
// 	}
// }
//
//
//
// int main()
// {
// 	tga_image tga;
// 	double dct_buf[8][8];
// 	int i, j, k, l;
//
// 	load_tga(&tga, "in.tga");
//
// 	k = 0;
// 	l = (tga.height / 8) * (tga.width / 8);
// 	for (j=0; j<tga.height/8; j++)
// 	for (i=0; i<tga.width/8; i++)
// 	{
// 		dct(&tga, dct_buf, i*8, j*8);
// 		quantize(dct_buf);
// 		idct(&tga, dct_buf, i*8, j*8);
// 		printf("processed %d/%d blocks.\r", ++k,l);
// 		fflush(stdout);
// 	}
// 	printf("\n");
//
// 	DONTFAIL( tga_write_mono("out.tga", tga.image_data,
// 		tga.width, tga.height) );
//
// 	tga_free_buffers(&tga);
// 	return EXIT_SUCCESS;
// }

// ****

/* DCT and IDCT - listing 3
 * Copyright (c) 2001 Emil Mikulic.
 * http://unix4lyfe.org/dct/
 *
 * Feel free to do whatever you like with this code.
 * Feel free to credit me.
 */

// #include <stdio.h>
// #include <stdlib.h>
// #include <math.h>
// #include "targa.h"
//
//
//
// typedef uint8_t byte;
//
// #define pixel(i,x,y) ( (i)->image_data[((y)*( (i)->width ))+(x)] )
//
// #define DONTFAIL(x) do { tga_result res;  if ((res=x) != TGA_NOERR) { \
// 	printf("Targa error: %s\n", tga_error(res)); \
// 	exit(EXIT_FAILURE); } } while(0)
//
//
//
// void load_tga(tga_image *tga, const char *fn)
// {
// 	DONTFAIL( tga_read(tga, fn) );
//
// 	printf("Loaded %dx%dx%dbpp targa (\"%s\").\n",
// 		tga->width, tga->height, tga->pixel_depth, fn);
//
// 	if (!tga_is_mono(tga)) DONTFAIL( tga_desaturate_rec_601_1(tga) );
// 	if (!tga_is_top_to_bottom(tga)) DONTFAIL( tga_flip_vert(tga) );
// 	if (tga_is_right_to_left(tga)) DONTFAIL( tga_flip_horiz(tga) );
//
// 	if ((tga->width % 8 != 0) || (tga->height % 8 != 0))
// 	{
// 		printf("Width and height must be multiples of 8\n");
// 		exit(EXIT_FAILURE);
// 	}
// }
//
//
//
// #ifndef PI
//  #ifdef M_PI
//   #define PI M_PI
//  #else
//   #define PI 3.14159265358979
//  #endif
// #endif
//
//
//
// /* Fast DCT algorithm due to Arai, Agui, Nakajima
//  * Implementation due to Tim Kientzle
//  */
// void dct(tga_image *tga, double data[8][8],
// 	const int xpos, const int ypos)
// {
// 	int i;
// 	int rows[8][8];
//
// 	static const int	c1=1004 /* cos(pi/16) << 10 */,
// 				s1=200 /* sin(pi/16) */,
// 				c3=851 /* cos(3pi/16) << 10 */,
// 				s3=569 /* sin(3pi/16) << 10 */,
// 				r2c6=554 /* sqrt(2)*cos(6pi/16) << 10 */,
// 				r2s6=1337 /* sqrt(2)*sin(6pi/16) << 10 */,
// 				r2=181; /* sqrt(2) << 7*/
//
// 	int x0,x1,x2,x3,x4,x5,x6,x7,x8;
//
// 	/* transform rows */
// 	for (i=0; i<8; i++)
// 	{
// 		x0 = pixel(tga, xpos+0, ypos+i);
// 		x1 = pixel(tga, xpos+1, ypos+i);
// 		x2 = pixel(tga, xpos+2, ypos+i);
// 		x3 = pixel(tga, xpos+3, ypos+i);
// 		x4 = pixel(tga, xpos+4, ypos+i);
// 		x5 = pixel(tga, xpos+5, ypos+i);
// 		x6 = pixel(tga, xpos+6, ypos+i);
// 		x7 = pixel(tga, xpos+7, ypos+i);
//
// 		/* Stage 1 */
// 		x8=x7+x0;
// 		x0-=x7;
// 		x7=x1+x6;
// 		x1-=x6;
// 		x6=x2+x5;
// 		x2-=x5;
// 		x5=x3+x4;
// 		x3-=x4;
//
// 		/* Stage 2 */
// 		x4=x8+x5;
// 		x8-=x5;
// 		x5=x7+x6;
// 		x7-=x6;
// 		x6=c1*(x1+x2);
// 		x2=(-s1-c1)*x2+x6;
// 		x1=(s1-c1)*x1+x6;
// 		x6=c3*(x0+x3);
// 		x3=(-s3-c3)*x3+x6;
// 		x0=(s3-c3)*x0+x6;
//
// 		/* Stage 3 */
// 		x6=x4+x5;
// 		x4-=x5;
// 		x5=r2c6*(x7+x8);
// 		x7=(-r2s6-r2c6)*x7+x5;
// 		x8=(r2s6-r2c6)*x8+x5;
// 		x5=x0+x2;
// 		x0-=x2;
// 		x2=x3+x1;
// 		x3-=x1;
//
// 		/* Stage 4 and output */
// 		rows[i][0]=x6;
// 		rows[i][4]=x4;
// 		rows[i][2]=x8>>10;
// 		rows[i][6]=x7>>10;
// 		rows[i][7]=(x2-x5)>>10;
// 		rows[i][1]=(x2+x5)>>10;
// 		rows[i][3]=(x3*r2)>>17;
// 		rows[i][5]=(x0*r2)>>17;
// 	}
//
// 	/* transform columns */
// 	for (i=0; i<8; i++)
// 	{
// 		x0 = rows[0][i];
// 		x1 = rows[1][i];
// 		x2 = rows[2][i];
// 		x3 = rows[3][i];
// 		x4 = rows[4][i];
// 		x5 = rows[5][i];
// 		x6 = rows[6][i];
// 		x7 = rows[7][i];
//
// 		/* Stage 1 */
// 		x8=x7+x0;
// 		x0-=x7;
// 		x7=x1+x6;
// 		x1-=x6;
// 		x6=x2+x5;
// 		x2-=x5;
// 		x5=x3+x4;
// 		x3-=x4;
//
// 		/* Stage 2 */
// 		x4=x8+x5;
// 		x8-=x5;
// 		x5=x7+x6;
// 		x7-=x6;
// 		x6=c1*(x1+x2);
// 		x2=(-s1-c1)*x2+x6;
// 		x1=(s1-c1)*x1+x6;
// 		x6=c3*(x0+x3);
// 		x3=(-s3-c3)*x3+x6;
// 		x0=(s3-c3)*x0+x6;
//
// 		/* Stage 3 */
// 		x6=x4+x5;
// 		x4-=x5;
// 		x5=r2c6*(x7+x8);
// 		x7=(-r2s6-r2c6)*x7+x5;
// 		x8=(r2s6-r2c6)*x8+x5;
// 		x5=x0+x2;
// 		x0-=x2;
// 		x2=x3+x1;
// 		x3-=x1;
//
// 		/* Stage 4 and output */
// 		data[0][i]=(double)((x6+16)>>3);
// 		data[4][i]=(double)((x4+16)>>3);
// 		data[2][i]=(double)((x8+16384)>>13);
// 		data[6][i]=(double)((x7+16384)>>13);
// 		data[7][i]=(double)((x2-x5+16384)>>13);
// 		data[1][i]=(double)((x2+x5+16384)>>13);
// 		data[3][i]=(double)(((x3>>8)*r2+8192)>>12);
// 		data[5][i]=(double)(((x0>>8)*r2+8192)>>12);
// 	}
// }
//
//
//
// /* play with this bit */
// void quantize(double dct_buf[8][8])
// {
// 	int x,y;
//
// 	for (y=0; y<8; y++)
// 	for (x=0; x<8; x++)
// 	if (x > 3 || y > 3) dct_buf[y][x] = 0.0;
// }
//
//
//
// #define COEFFS(Cu,Cv,u,v) { \
// 	if (u == 0) Cu = 1.0 / sqrt(2.0); else Cu = 1.0; \
// 	if (v == 0) Cv = 1.0 / sqrt(2.0); else Cv = 1.0; \
// 	}
//
// void idct(tga_image *tga, double data[8][8], const int xpos, const int ypos)
// {
// 	int u,v,x,y;
//
// 	/* iDCT */
// 	for (y=0; y<8; y++)
// 	for (x=0; x<8; x++)
// 	{
// 		double z = 0.0;
//
// 		for (v=0; v<8; v++)
// 		for (u=0; u<8; u++)
// 		{
// 			double S, q;
// 			double Cu, Cv;
//
// 			COEFFS(Cu,Cv,u,v);
// 			S = data[v][u];
//
// 			q = Cu * Cv * S *
// 				cos((double)(2*x+1) * (double)u * PI/16.0) *
// 				cos((double)(2*y+1) * (double)v * PI/16.0);
//
// 			z += q;
// 		}
//
// 		z /= 4.0;
// 		if (z > 255.0) z = 255.0;
// 		if (z < 0) z = 0.0;
//
// 		pixel(tga, x+xpos, y+ypos) = (uint8_t) z;
// 	}
// }
//
//
//
// int main()
// {
// 	tga_image tga;
// 	double dct_buf[8][8];
// 	int i, j, k, l;
//
// 	load_tga(&tga, "in.tga");
//
// 	k = 0;
// 	l = (tga.height / 8) * (tga.width / 8);
// 	for (j=0; j<tga.height/8; j++)
// 	for (i=0; i<tga.width/8; i++)
// 	{
// 		dct(&tga, dct_buf, i*8, j*8);
// 		quantize(dct_buf);
// 		idct(&tga, dct_buf, i*8, j*8);
// 		printf("processed %d/%d blocks.\r", ++k,l);
// 		fflush(stdout);
// 	}
// 	printf("\n");
//
// 	DONTFAIL( tga_write_mono("out.tga", tga.image_data,
// 		tga.width, tga.height) );
//
// 	tga_free_buffers(&tga);
// 	return EXIT_SUCCESS;
// }

// **** The End ****
