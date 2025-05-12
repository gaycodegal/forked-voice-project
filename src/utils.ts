#pragma once

/// sums the values in the provided array, but does so in a way that ensure numeric stability
function stable_sum(data: number[], low: number = 0, high: number = -1, split: number = 10) : number{
	if (high < 0) {
		high = data.length;
	}
	if (high - low > split) {
		const step = Math.ceil((high-low) / split);
		let ret = 0;
		for (let i = low; i < high; i += step) {
			ret += stable_sum(data, i, Math.min(i + step, high), split);
		}
		return ret;
	} else {
		return data.slice(low, high).reduce((a,b) => a+b, 0);
	}

}

function to_index(pos: number, length: number): number {
	return Math.min(length, (Math.max(0, Math.round(pos*length))));
}


