#pragma once

#include "user_interface.ts"

class Threshold {
	current_threshold : number = 0;

	constructor(ui: UserInterface) {
		this.current_threshold = Number(ui.volumeSelector.value);
		ui.volumeSelector.addEventListener("change", (event) => {
			this.current_threshold = Number(ui.volumeSelector.value);
		});
	}

	get(): number {
		return this.current_threshold;
	}

}
