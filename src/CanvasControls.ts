import {Note} from "./MusicalNote"
import {frequencyToColor} from "./Gender"
import {Settings} from "./Settings"
import {NoteDisplay} from "./NoteDisplay"

export class CanvasControls {
	root: HTMLDivElement;
	toggleRecordButton: HTMLButtonElement;
	togglePlayButton: HTMLButtonElement;
	noteDisplay: NoteDisplay;
	volumeSelector: HTMLInputElement;

	currentThreshold: number = 0;

	constructor(settings: Settings) {
		this.root = document.createElement("div");
		this.root.classList.add("FTVT-canvasControls");

		this.toggleRecordButton = document.createElement("button");
		this.toggleRecordButton.innerHTML="⏺️";
		this.toggleRecordButton.title="Toggle Recording";
		this.toggleRecordButton.style.backgroundColor="green";
		this.toggleRecordButton.style.color="white";
		this.toggleRecordButton.id = "FTVT-toggleRecordButton";
		this.root.appendChild(this.toggleRecordButton);

		this.togglePlayButton = document.createElement("button");
		this.togglePlayButton.innerHTML= "⏯️";
		this.togglePlayButton.title = "Pause/Unpause spectrum display";
		this.root.appendChild(this.togglePlayButton);

		let freqOutLabel = document.createElement("label");
		freqOutLabel.innerHTML = "<span style='flex-grow: 1;'>Main Frequency: </span>";
		this.noteDisplay = new NoteDisplay(null);
		freqOutLabel.appendChild(this.noteDisplay.getRoot());
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
		this.volumeSelector.step = "1";
		this.volumeSelector.value = "32";
		settings.registerInput("volume threshold", this.volumeSelector);
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
		this.noteDisplay.setFrequency(freq);
	}
}

