#pragma once

#include "color.ts"

const ENBY_FREQUENCY_COLOR = Color.load("enby-freq-color", new Color(64,128,64));
const MASC_FREQUENCY_COLOR = Color.load("masc-freq-color", new Color(64,64,255));
const FEM_FREQUENCY_COLOR =  Color.load("fem-freq-color", new Color(255,64,64));

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
			case Genders.Masc: return MASC_FREQUENCY_COLOR;
			case Genders.Fem: return FEM_FREQUENCY_COLOR;
			default: return ENBY_FREQUENCY_COLOR;
		}
	}

	public toEnum(): Genders {
		return this.value;
	}
}

function frequencyToColor(freq: number) : Color {
	return Gender.fromFrequency(freq).toColor();
}
