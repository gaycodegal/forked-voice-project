#pragma once

const TUNING_PITCH = 440;

const NOTE_NAMES : {[index: string]:  string} = {"-9": "C", "-8" : "C♯", "-7": "D", "-6": "D♯", "-5": "E", "-4": "F", "-3": "F♯" , "-2": "G", "-1": "G♯", "0": "A", "1": "A♯", "2": "B"};

class Note {
	index: number;
	octave: number;

	constructor(index: number, octave: number) {
		this.index = index;
		this.octave = octave;
	}

	toString() {
		const name = NOTE_NAMES[this.index];
		return name + "<sub>" + String(this.octave) + "</sub>";
	}

	toFrequency(): number {
		return TUNING_PITCH * Math.pow(2, this.octave - 4 + this.index/12);
	}

	public static fromFrequency(freq: number) : Note{
		let exp = Math.log(freq/TUNING_PITCH)/Math.log(2) + 4;
		let octave = Math.floor(exp);
		let note = Math.round((exp - octave) * 12);
		if (note > 2) {
			note -= 12;
			octave += 1;
		}
		return new Note(note, octave);
	}
}

function frequencyToString(freq: number) : string {
	return freq.toFixed(2) + " Hz (" + Note.fromFrequency(freq).toString() + ")" ;
}

function frequencyToHTML(freq: number, label: string = "") : HTMLSpanElement {
	let span = document.createElement("span");
	span.innerHTML = label + frequencyToString(freq);
	span.style.color = frequencyToColor(freq).toString();
	return span;
}
