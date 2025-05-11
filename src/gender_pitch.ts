#pragma once

#include "color.ts"

const enby_freq_color = Color.load("enby-freq-color", new Color(64,128,64));
const masc_freq_color = Color.load("masc-freq-color", new Color(64,64,255));
const fem_freq_color =  Color.load("fem-freq-color", new Color(255,64,64));

enum Genders {
	InfraMasc,
	Masc,
	Enby,
	Fem,
	UltraFem,
};

class Gender {
	value: Genders;
	constructor(gender: Genders) {
		this.value = gender;
	}


	public static InfraMasc = new Gender(Genders.InfraMasc);
	public static Masc      = new Gender(Genders.Masc);
	public static Enby      = new Gender(Genders.Enby);
	public static Fem       = new Gender(Genders.Fem);
	public static UltraFem  = new Gender(Genders.UltraFem);

	public static genders = [Gender.InfraMasc, Gender.Masc, Gender.Enby, Gender.Fem, Gender.UltraFem];

	public static fromFrequency(freq: number): Gender {
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

	public toColor(): Color {
		switch(this.value) {
			case Genders.Masc: return masc_freq_color;
			case Genders.Fem: return fem_freq_color;
			default: return enby_freq_color;
		}
	}

	public toEnum(): Genders {
		return this.value;
	}
}

function frequency_to_color(freq: number) : Color {
	return Gender.fromFrequency(freq).toColor();
}
