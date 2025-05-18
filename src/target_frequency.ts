#pragma once

#include "notes.ts"
#include "gender_pitch.ts"

#include "user_interface.ts"

class TargetFrequencyManager {
	context: AudioContext;
	targetFrequencySelector: HTMLInputElement;
	playButton: HTMLButtonElement;
	noteSelector: HTMLDivElement;
	oscillator: OscillatorNode|null;

	constructor(ui: UserInterface) {
		this.context = new window.AudioContext();
		this.oscillator = null;
		this.targetFrequencySelector = ui.targetFrequencySelector;
		this.playButton = ui.playButton;
		this.noteSelector = ui.noteSelector;
		this.setupNoteSelectors();
		this.playButton.addEventListener("mousedown", (event) =>{this.startPlaying();});
		this.playButton.addEventListener("touchstart", (event) =>{this.startPlaying();});
		this.playButton.addEventListener("mouseup", () => {this.stopPlaying();});
		this.playButton.addEventListener("mouseout", () => {this.stopPlaying();});
		this.playButton.addEventListener("touchend", () => {this.stopPlaying();});
		this.playButton.addEventListener("touchcancel", () => {this.stopPlaying();});
	}

	target() : number {
		return Number(this.targetFrequencySelector.value);
	}

	setTarget(value: number) {
		this.targetFrequencySelector.value = String(value);
	}


	startPlaying() {
		this.stopPlaying();
		this.oscillator = this.context.createOscillator();
		this.oscillator.frequency.value = this.target();
		this.oscillator.connect(this.context.destination);
		this.oscillator.start();
	}
	stopPlaying() {
		if (this.oscillator != null) {
			this.oscillator.stop();
			this.oscillator = null;
		}
	}

	createNoteButton(note: Note): HTMLButtonElement {
		let button = document.createElement("button");
		const frequency = note.toFrequency();
		button.innerHTML = note.toString();
		button.onclick = () => {
			this.setTarget(frequency);
		};
		button.style.backgroundColor = frequencyToColor(frequency).toString();
		button.style.color = "white";
		return button;
	}

	setupNoteSelectors() {
		for (let octave = 2; octave < 5; ++octave) {
			let octaveDiv = document.createElement("div");
			octaveDiv.classList.add("FTVT-octaveDiv");

			for (let note = -9; note <= 2; ++note) {
				const button = this.createNoteButton(new Note(note, octave));
				octaveDiv.appendChild(button);
			}
			this.noteSelector.appendChild(octaveDiv);
		}
	}
}
