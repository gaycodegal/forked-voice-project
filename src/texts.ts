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
		this.onLanguageSelect();
		this.languageSelector.addEventListener("change", (event) => {
			this.onLanguageSelect();
			this.getSelectedText();
		});
		this.textSelector.addEventListener("change", (event) => {
			this.getSelectedText();
		});
		this.getSelectedText();
	}

	public static clearSelector(element: HTMLSelectElement) {
		var i, L = element.options.length - 1;
		for(i = L; i >= 0; i--) {
			element.remove(i);
		}
	}

	getSelectedText() {
		const lang = this.languageSelector.value;
		let text = this.textSelector.value;
		if (lang in TEXTS_TABLE && text in TEXTS_TABLE[lang]){
			this.textDisplay.innerText = TEXTS_TABLE[lang][text];
		} else {
			this.textDisplay.innerText = "";
		}
	}

	onLanguageSelect() {
		const language = this.languageSelector.value;
		TextManager.clearSelector(this.textSelector);
		for(let key in TEXTS_TABLE[language]) {
			this.textSelector.add(new Option(key));
		}
	}
}
