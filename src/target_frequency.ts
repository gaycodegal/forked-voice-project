#pragma once

#include "notes.ts"
#include "gender_pitch.ts"

#include "user_interface.ts"

class TargetFrequencyManager {
	context: AudioContext;
	targetFrequencySelector: HTMLInputElement;
	playButton: HTMLButtonElement;
	noteSelector: HTMLDivElement;

	constructor(ui: UserInterface) {
		this.context = new window.AudioContext();
		this.targetFrequencySelector = ui.targetFrequencySelector;
		this.playButton = ui.playButton;
		this.noteSelector = ui.noteSelector;
		this.setupNoteSelectors();
		this.playButton.addEventListener("mousedown", (event) =>{this.startPlaying();});
	}

	target() : number {
		return Number(this.targetFrequencySelector.value);
	}

	setTarget(value: number) {
		this.targetFrequencySelector.value = String(value);
	}


	startPlaying() {
		let osc = this.context.createOscillator();
		osc.frequency.value = this.target(); // Hz
		osc.connect(this.context.destination);
		// TODO: touch-support!
		this.playButton.onmouseup = () => {osc.stop();}
		this.playButton.onmouseout = () => {osc.stop();}
		osc.start();
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
