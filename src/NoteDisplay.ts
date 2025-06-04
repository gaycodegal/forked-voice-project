import {Note} from "./MusicalNote";
import {Gender} from "./Gender";

export class NoteDisplay {
	root: HTMLOutputElement;
	frequencyDisplay: HTMLSpanElement;
	noteDisplay: HTMLSpanElement;
	genderDisplay: HTMLSpanElement;

	constructor(frequency: number|null = null, label: string="") {
		this.root = document.createElement("output");
		this.root.classList.add("FTVT-noteDisplay")

		if (label != "") {
			let labelNode = document.createTextNode(label + ":");
			this.root.appendChild(labelNode);
		}

		this.frequencyDisplay = document.createElement("span");
		this.frequencyDisplay.classList.add("FTVT-frequency");
		this.root.appendChild(this.frequencyDisplay);

		let unitLabel = document.createElement("abbr");
		unitLabel.title="Hertz";
		unitLabel.innerHTML=" Hz ";
		unitLabel.classList.add("FTVT-unit");
		this.root.appendChild(unitLabel);

		this.noteDisplay = document.createElement("span");
		this.noteDisplay.classList.add("FTVT-note");
		this.root.appendChild(this.noteDisplay);

		this.genderDisplay = document.createElement("span");
		this.genderDisplay.classList.add("FTVT-gender");
		this.root.appendChild(this.genderDisplay);

		this.setFrequency(frequency);
	}

	setFrequency(frequency: number|null = null) {
		if (frequency == null || isNaN(frequency)) {
			this.frequencyDisplay.innerText="-";
			this.noteDisplay.innerHTML=""
			this.genderDisplay.innerText = "";
		} else {
			const gender = Gender.fromFrequency(frequency);
			const note = Note.fromFrequency(frequency);
			this.frequencyDisplay.innerText=frequency.toFixed(0) ;
			this.noteDisplay.innerHTML="("+note.toString()+")";
			this.genderDisplay.innerText = gender.toEmoji();
		}
	}

	getRoot() {
		return this.root;
	}
}

