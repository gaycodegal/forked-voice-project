#pragma once

const tuning_pitch = 440;

const note_names : {[index: string]:  string} = {"-9": "C", "-8" : "C♯", "-7": "D", "-6": "D♯", "-5": "E", "-4": "F", "-3": "F♯" , "-2": "G", "-1": "G♯", "0": "A", "1": "A♯", "2": "B"};

class Note {
	index: number;
	octave: number;

	constructor(index: number, octave: number) {
		this.index = index;
		this.octave = octave;
	}

}

function note_to_frequency(note: number, octave: number = 3): number {
	return tuning_pitch * Math.pow(2, octave - 4 + note/12);
}

function frequency_to_note(freq: number) : Note{
	let exp = Math.log(freq/tuning_pitch)/Math.log(2) + 4;
	let octave = Math.floor(exp);
	let note = Math.round((exp - octave) * 12);
	if (note > 2) {
		note -= 12;
		octave += 1;
	}
	return new Note(note, octave);
}

function note_to_string(note: Note) {
	const name = note_names[note.index];
	return name + "<sub>" + String(note.octave) + "</sub>";
}
