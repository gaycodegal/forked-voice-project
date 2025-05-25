import {Settings} from "./settings";
import {Note} from "./notes";
import {Gender} from "./gender_pitch";

export class NumericInputElement {
	root: HTMLLabelElement;
	input: HTMLInputElement;

	constructor(parent: HTMLElement, name:string, nameAlt:string = "", initial: number = 0, step: string = "1", unit:string ="", unitAlt:string ="", settings:Settings|null = null, storageName: string="") {
		this.root = document.createElement("label");
		this.root.classList.add("FTVT-numericInput");
		if (nameAlt != "") {
			let preLabel = document.createElement("abbr");
			preLabel.title=nameAlt;
			preLabel.innerHTML=name;
			this.root.appendChild(preLabel);
		} else {
			this.root.appendChild(document.createTextNode(name));
		}
		this.input = document.createElement("input");
		this.input.type="number";
		this.input.min="0";
		this.input.value=initial.toString();
		this.input.step="any";
		if (settings != null && storageName != "") {
			settings.registerInput(storageName, this.input);
		}
		this.root.appendChild(this.input);
		if (unit != "") {
			if (unitAlt != "") {
				let unitLabel = document.createElement("abbr");
				unitLabel.title = unitAlt;
				unitLabel.innerText = unit;
				unitLabel.classList.add("FTVT-unit");
				this.root.appendChild(unitLabel);
			} else {
				let unitLabel = document.createElement("span");
				unitLabel.innerText = unit;
				unitLabel.classList.add("FTVT-unit");
				this.root.appendChild(unitLabel);
			}
		}
		parent.appendChild(this.root);
	}

	getValue(): number {
		return Number(this.input.value);
	}

	setValue(value: number) {
		this.input.value = value.toString();
		this.input.dispatchEvent(new Event("change"));
	}

	getRoot(): HTMLElement {
		return this.root;
	}
}

export class FrequencyInputElement extends NumericInputElement {
	noteDisplay: HTMLSpanElement;
	genderDisplay: HTMLSpanElement;

	constructor(parent: HTMLElement, name: string, nameAlt:string = "", initial: number = 250, settings:Settings|null = null, storageName: string ="") {
		super(parent, name, nameAlt, initial, "any", "Hz", "Hertz", settings, storageName);
		this.root.classList.add("FTVT-frequencyBlock");

		this.noteDisplay = document.createElement("span");
		this.noteDisplay.classList.add("FTVT-note");
		this.root.appendChild(this.noteDisplay);

		this.genderDisplay = document.createElement("span");
		this.genderDisplay.classList.add("FTVT-gender");
		this.root.appendChild(this.genderDisplay);

		this.input.addEventListener("change", (event) => {
			this.setGenderDisplay();
		});
		this.setGenderDisplay();
	}

	setGenderDisplay() {
		const frequency = this.getValue();
		if (!frequency || isNaN(frequency)) {
			this.noteDisplay.innerHTML=""
			this.genderDisplay.innerText = "";
		} else {
			const gender = Gender.fromFrequency(frequency);
			const note = Note.fromFrequency(frequency);
			this.noteDisplay.innerHTML="("+note.toString()+")";
			this.genderDisplay.innerText = gender.toEmoji();
		}
	}
}
