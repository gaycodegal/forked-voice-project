import {Settings} from "./Settings"

/// sums the values in the provided array, but does so in a way that ensure numeric stability
export function stableSum(data: number[], low: number = 0, high: number = -1, split: number = 10) : number{
	if (high < 0) {
		high = data.length;
	}
	if (high - low > split) {
		const step = Math.ceil((high-low) / split);
		let ret = 0;
		for (let i = low; i < high; i += step) {
			ret += stableSum(data, i, Math.min(i + step, high), split);
		}
		return ret;
	} else {
		return data.slice(low, high).reduce((a,b) => a+b, 0);
	}

}

export function toIndex(pos: number, length: number): number {
	return Math.min(length, (Math.max(0, Math.round(pos*length))));
}

export function makeVerticallyResizable(target: HTMLElement, settings: Settings, storageKey: string, minHeight: number = 100) {
	target.classList.add("VerticallyResizable");
	const targetHeight = settings.storage.getOrNull(storageKey);
	if (targetHeight !== null) {
		target.style.height = `${targetHeight}px`;
	}
	addResizeEventListener(target, (target: HTMLElement,
									{height}: {height: number}) => {
		settings.storage.update(storageKey,
								Math.max(minHeight, height)
									.toString());
	});
	return target;
}

export function addResizeEventListener(element: HTMLElement, listener: Function) {
	let height = element.clientHeight;
	let width = element.clientWidth;
	return new MutationObserver((event)=>{
		let newHeight = element.clientHeight;
		let newWidth = element.clientWidth;
		if (newHeight != height || newWidth != width) {
			height = newHeight;
			width = newWidth;
			listener(element, {width, height}, event);
		}
	}).observe(element, {
		attributes: true, attributeFilter: [ "style" ]
	});
}
