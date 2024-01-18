#pragma once

const harmonic_detection_factor = 0.5;

class BaseFrequencyIndices {
	constructor (min: number, max: number) {
		this.min = min;
		this.max = max;
	}
	min: number;
	max: number;
}

function is_harmonic(data: any, index: number, base_band: BaseFrequencyIndices) : boolean {
	const n_low = Math.floor(index/base_band.min);
	const n_high = Math.ceil(index/base_band.max);
	let is_harmonic = false;
	for (let harmonic = n_high+1; harmonic <= n_low; ++harmonic) {
		if (data[Math.round(index/harmonic)] > data[index] * harmonic_detection_factor) {
			return true;
		}
	}
	return false;
}

function main_freq_index(data: any, base_band: BaseFrequencyIndices) : number {
	if (data.length < 1) {
		throw "max_index must only be called with non-empty arrays";
	}
	let imax = 0;
	let vmax = data[0];
	for (let i = 1; i < data.length ; ++i) {
		let v = data[i]
		if (v > vmax && !is_harmonic(data, i, base_band)) {
			imax = i;
			vmax = v;
		}
	}
	return imax;
}

