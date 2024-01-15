#pragma once

#include "notes.ts"
#include "gender_pitch.ts"

let context = new window.AudioContext();

function get_target_frequency() : number {
	let frequency_selector = document.getElementById("TargetFrequencySelector") as HTMLInputElement;
	return Number(frequency_selector.value);
}

function set_target_frequency(value: number) {
	let frequency_selector = document.getElementById("TargetFrequencySelector") as HTMLInputElement;
	frequency_selector.value = String(value);
}

function get_play_button(): HTMLButtonElement {
	return document.getElementById("PlayFrequencyButton") as HTMLButtonElement;
}

function start_playing() {
	let play_button = get_play_button();
	var osc = context.createOscillator();
	osc.frequency.value = get_target_frequency(); // Hz
	osc.connect(context.destination);
	play_button.onmouseup = () => {osc.stop();}
	play_button.onmouseout = () => {osc.stop();}
	osc.start();
	//osc.stop(context.currentTime + 2); // stop 2 seconds after the current currentTime
}

function create_note_button(note: string, octave: number) {
	let note_selector = document.getElementById("NoteSelector") as HTMLDivElement;
	let button = document.createElement("button");
	const frequency = note_to_frequency(note, octave);
	button.innerText= note + octave_names[octave];
	button.onclick = () => {
		set_target_frequency(frequency);
	};
	button.style.backgroundColor = frequency_to_color(frequency).to_str();
	note_selector.appendChild(button);
}

function setup_note_selectors() {
	let note_selector = document.getElementById("NoteSelector") as HTMLDivElement;
	for (let octave = 2; octave < 5; ++octave) {
		for (let note in notes) {
			create_note_button(note, octave);
		}
		note_selector.appendChild(document.createElement("br"));
	}
}

function setup_sound_generation() {
	let play_button = document.getElementById("PlayFrequencyButton") as HTMLButtonElement;
	play_button.onmousedown = start_playing;
	setup_note_selectors();
}
