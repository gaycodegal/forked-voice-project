#pragma once

const tuning_pitch = 440;

const notes : {[name: string]:  number} = {"C" : -9, "C♯" : -8, "D" : -7, "D♯" : -6, "E" : -5, "F" : -4, "F♯" : -3, "G" : -2, "G♯" : -1, "A" : 0, "A♯" : 1, "B" : 2};

const note_names = notes.keys;

const octave_names : {[value:number]: string} = { 2 : "₂", 3 : "₃", 4 : "₄", 5 : "₅"};

function note_to_frequency(name: string, octave: number = 3): number {
	return tuning_pitch * Math.pow(2, octave - 4 + notes[name]/12);
}
