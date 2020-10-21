'use strict';

const COLORED_FLAG = 0;
const WHITE_FLAG = 1;

function isPixelPresent(red, green, blue) {
	return (red + green + blue) / 3 > 255 * 0.5;
}

function getBinaryPixelArrayString(pixelArray) {
	let pixelArrayString = '';

	pixelArray.forEach((row) => {
		pixelArrayString += row.join(',') + '\n';
	});

	return pixelArrayString;
}

function getHexaPixelArrayString(pixelArray) {
	return pixelArray.join(',');
}

function getBinaryPixelArray(bitmap) {
	let pixelArray = [],
		maxWidth = bitmap.width,
		maxHeight = bitmap.height;

	for (let column = 0; column < maxHeight; column++) {
		let rowArray = [];

		for (let row = 0; row < maxWidth; row++) {
			let x = row,
				y = column;

			if (bitmap.width < x || bitmap.height < y) {
				rowArray.push(WHITE_FLAG);
				continue;
			}

			// invert
			let pixel = bitmap.getPixel(x, y),
				binaryPixel = isPixelPresent(pixel.r, pixel.g, pixel.b) ? WHITE_FLAG : COLORED_FLAG;

			rowArray.push(binaryPixel);
		}

		pixelArray.push(rowArray);
	}

	return pixelArray;
}

function getHexaPixelArray(bitmap) {
	let binaryPixelArray = getBinaryPixelArray(bitmap),
		pixelArray = [];

	for (let rowIndex = 0; rowIndex < binaryPixelArray.length; rowIndex++) {
		let column;

		for (column = 0; column + 8 <= binaryPixelArray[rowIndex].length; column += 8) {
			let binaryArray = binaryPixelArray[rowIndex].slice(column, column + 8);

			pixelArray.push(convertBinaryArrayToHexaString(binaryArray));
		}

		let remainingBinaries = binaryPixelArray[rowIndex].length % 8;

		if (remainingBinaries !== 0) {
			let binaryArray = binaryPixelArray[rowIndex].slice(column);

			for (let i = 0; i < remainingBinaries; i++) {
				binaryArray.push(0);
			}

			pixelArray.push(convertBinaryArrayToHexaString(binaryArray));
		}
	}

	return pixelArray;
}

function convertBinaryArrayToHexaString(binaryArray) {
	let binaryString = binaryArray.join(''),
		binaryNumber = parseInt(binaryString, 2),
		hexaString = '0X' + ('0' + Number(binaryNumber).toString(16)).slice(-2).toUpperCase();

	return hexaString;
}

module.exports = {
	getBinaryPixelArrayString: getBinaryPixelArrayString,
	getHexaPixelArrayString: getHexaPixelArrayString,
	getBinaryPixelArray: getBinaryPixelArray,
	getHexaPixelArray: getHexaPixelArray
};