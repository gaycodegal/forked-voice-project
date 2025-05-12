#pragma once

#include "user_interface.ts"

const TEXTS_TABLE : {[language: string]: {[title: string]: string}} =
#include "texts.json"


class TextManager {
	languageSelector: HTMLSelectElement;
	textSelector: HTMLSelectElement;
	textDisplay: HTMLQuoteElement;

	constructor(ui: UserInterface) {
		this.languageSelector = ui.languageSelector;
		this.textSelector = ui.textSelector;
		this.textDisplay = ui.textDisplay;
		for(let lang in TEXTS_TABLE) {
			this.languageSelector.add(new Option(lang));
		}
		this.on_languageSelect();
		this.languageSelector.addEventListener("change", (event) => {
			this.on_languageSelect();
			this.get_selected_text();
		});
		this.textSelector.addEventListener("change", (event) => {
			this.get_selected_text();
		});
		this.get_selected_text();
	}

	public static remove_options(element: HTMLSelectElement) {
		var i, L = element.options.length - 1;
		for(i = L; i >= 0; i--) {
			element.remove(i);
		}
	}


	get_selected_text() {
		const lang = this.languageSelector.value;
		let text = this.textSelector.value;
		if (lang in TEXTS_TABLE && text in TEXTS_TABLE[lang]){
			this.textDisplay.innerText = TEXTS_TABLE[lang][text];
		} else {
			this.textDisplay.innerText = "";
		}
	}

	on_languageSelect() {
		const language = this.languageSelector.value;
		TextManager.remove_options(this.textSelector);
		for(let key in TEXTS_TABLE[language]) {
			this.textSelector.add(new Option(key));
		}
	}

}
