#pragma once


class Color {
	constructor(r: number, g: number, b:number, alpha: number = 255) {
		this.r =r;
		this.g =g;
		this.b =b;
		this.alpha =alpha;
	}
	r: number;
	g: number;
	b: number;
	alpha: number;

	toString(): string {
		return "rgba(" + String(this.r) + ", " + String(this.g) + ", " + String(this.b) + ", " + String(this.alpha) + ")";
	}

	scale(factor: number): Color {
		const r = Math.min(Math.max(this.r * factor, 0), 255);
		const g = Math.min(Math.max(this.g * factor, 0), 255);
		const b = Math.min(Math.max(this.b * factor, 0), 255);
		return new Color(r,g,b, this.alpha);
	}

	public static fromRGB(s: string, fallback?: Color): Color {
		if (s.length == 7 && s[0] == '#') {
			let num = parseInt(s.slice(1), 16);
			let b = num & 0xff;
			num = num >> 8;
			let g = num & 0xff;
			let r = num >> 8;
			return new Color(r, g, b);
		} else if (s.length == 4 && s[0] == '#') {
			let num = parseInt(s.slice(1), 16);
			let b = num & 0xf;
			num = num >> 4;
			let g = num & 0xf;
			let r = num >> 4;
			return new Color(r << 4, g << 4, b << 4);
		} else if (fallback != null) {
			return fallback;
		} else {
			throw "Invalid Color: " + s;
		}
	}

	public static load(name: string, fallback: Color) {
		return Color.fromRGB(getComputedStyle(document.documentElement).getPropertyValue("--" + name), fallback);
	}
	public static MAIN_FREQUENCY_COLOR = Color.load("main-freq-color", new Color(255, 255, 255));
	public static TARGET_FREQUENCY_COLOR = Color.load("target-freq-color", new Color(0,255, 255));

}

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
	Color.MAIN_FREQUENCY_COLOR = Color.load("main-freq-color", new Color(255, 255, 255));
	Color.TARGET_FREQUENCY_COLOR = Color.load("target-freq-color", new Color(0,255, 255));
});
