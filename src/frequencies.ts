#pragma once

const HARMONIC_DETECTION_FACTOR = 0.5;

class BaseFrequencyIndices {
	constructor (min: number, max: number) {
		this.min = min;
		this.max = max;
	}
	min: number;
	max: number;
}

function isHarmonic(data: any, index: number, baseBand: BaseFrequencyIndices) : boolean {
	const nLow = Math.floor(index/baseBand.min);
	const nHigh = Math.ceil(index/baseBand.max);
	let isHarmonic = false;
	for (let harmonic = nHigh+1; harmonic <= nLow; ++harmonic) {
		if (data[Math.round(index/harmonic)] > data[index] * HARMONIC_DETECTION_FACTOR) {
			return true;
		}
	}
	return false;
}

function mainFrequencyIndex(data: any, baseBand: BaseFrequencyIndices) : number {
	if (data.length < 1) {
		throw "mainFrequencyIndex must only be called with non-empty arrays";
	}
	let imax = 0;
	let vmax = data[0];
	for (let i = 1; i < data.length ; ++i) {
		let v = data[i]
		if (v > vmax && !isHarmonic(data, i, baseBand)) {
			imax = i;
			vmax = v;
		}
	}
	return imax;
}

