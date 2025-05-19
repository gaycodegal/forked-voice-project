import {UserInterface} from "./user_interface"

export class Threshold {
	currentThreshold : number = 0;

	constructor(ui: UserInterface) {
		this.currentThreshold = Number(ui.volumeSelector.value);
		ui.volumeSelector.addEventListener("change", (event) => {
			this.currentThreshold = Number(ui.volumeSelector.value);
		});
	}

	get(): number {
		return this.currentThreshold;
	}

}
