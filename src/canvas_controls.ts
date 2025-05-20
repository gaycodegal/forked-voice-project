
import {Note} from "./notes"
import {frequencyToColor} from "./gender_pitch"

export class CanvasControls {
	root: HTMLDivElement;
	togglePlayButton: HTMLButtonElement;
	freqOut: HTMLOutputElement;
	volumeSelector: HTMLInputElement;

	currentThreshold: number = 0;

	constructor() {
		this.root = document.createElement("div");
		this.root.classList.add("FTVT-canvasControls");

		this.togglePlayButton = document.createElement("button");
		this.togglePlayButton.innerHTML="⏯️";
		this.root.appendChild(this.togglePlayButton);

		let freqOutLabel = document.createElement("label");
		freqOutLabel.innerHTML = "Main Frequency:";
		this.freqOut = document.createElement("output");
		freqOutLabel.appendChild(this.freqOut);
		this.root.appendChild(freqOutLabel);

		let thresholdDiv = document.createElement("label");
		thresholdDiv.classList.add("FTVT-threshold");
		let volumeLabel = document.createElement("span");
		volumeLabel.innerHTML = "Volume-Threshold:";
		volumeLabel.style.flexShrink = "0";
		thresholdDiv.appendChild(volumeLabel)
		this.volumeSelector = document.createElement("input");
		this.volumeSelector.type = "range";
		this.volumeSelector.min = "0";
		this.volumeSelector.max = "255";
		this.volumeSelector.step="1";
		this.volumeSelector.value="32";
		this.volumeSelector.style.flexGrow = "1";
		thresholdDiv.appendChild(this.volumeSelector);
		this.root.appendChild(thresholdDiv);

		this.currentThreshold = Number(this.volumeSelector.value);
		this.volumeSelector.addEventListener("change", (event) => {
			this.currentThreshold = Number(this.volumeSelector.value);
		});
	}

	getRoot(): HTMLDivElement {
		return this.root;
	}

	getThreshold(): number {
		return this.currentThreshold;
	}

	stateMainFrequency(freq: number | null) {
		if (freq  == null) {
			this.freqOut.innerHTML = "-<sub></sub>";
			this.freqOut.style.color = "white";
		} else {
			const note = Note.fromFrequency(freq);
			this.freqOut.innerHTML = (freq).toFixed(0) + " Hz (" +note.toString() + ")";
			this.freqOut.style.color = frequencyToColor(freq).toString();
		}
	}
}

