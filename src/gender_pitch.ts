#pragma once


class color {
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

	to_str(): string {
		return "rgba(" + String(this.r) + ", " + String(this.g) + ", " + String(this.b) + ", " + String(this.alpha) + ")";
	}

	scale(factor: number): color {
		const r = Math.min(Math.max(this.r * factor, 0), 255);
		const g = Math.min(Math.max(this.g * factor, 0), 255);
		const b = Math.min(Math.max(this.b * factor, 0), 255);
		return new color(r,g,b, this.alpha);
	}
};

const white = new color(255,255,255);
const cyan = new color(0,255,255);

const enum Gender {
	InfraMasc,
	Masc,
	Enby,
	Fem,
	UltraFem,
};

const genders = [Gender.InfraMasc, Gender.Masc, Gender.Enby, Gender.Fem, Gender.UltraFem];

function frequency_to_gender(freq: number): Gender {
	if (freq < 85) {
		return Gender.InfraMasc;
	} else if (freq <= 155) {
		return Gender.Masc;
	} else if (freq < 165) {
		return Gender.Enby;
	} else if (freq <=320) {
		return Gender.Fem;
	} else {
		return Gender.UltraFem;
	}
}

function gender_to_color(g: Gender): color {
	switch(g) {
		case Gender.InfraMasc: return new color(64,128,64);
		case Gender.Masc: return new color(64,64,255);
		case Gender.Enby: return new color(64,128,64);
		case Gender.Fem: return new color(255,64,64);
		case Gender.UltraFem: return new color(64,128,64);
	}
}

function frequency_to_color(freq: number) : color {
	return gender_to_color(frequency_to_gender(freq));
}
