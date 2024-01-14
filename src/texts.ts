#pragma once

const texts_table : {[language: string]: {[title: string]: string}} =
#include "texts.json"


function remove_options(element: HTMLSelectElement) {
	var i, L = element.options.length - 1;
	for(i = L; i >= 0; i--) {
		element.remove(i);
	}
}

function setup_languages() {
	let language_selector = document.getElementById("LanguageSelector") as HTMLSelectElement;
	for(let lang in texts_table) {
		language_selector.add(new Option(lang));
	}
	on_language_select();
}

function get_selected_text() {
	let language_selector = document.getElementById("LanguageSelector") as HTMLSelectElement;
	let text_selector = document.getElementById("TextSelector") as HTMLSelectElement;
	let text_display = document.getElementById("TextDisplay") as HTMLDivElement;
	const lang = language_selector.value;
	let text = text_selector.value;
	if (lang in texts_table && text in texts_table[lang]){
		text_display.innerText = texts_table[lang][text];
	} else {
		text_display.innerText = "";
	}
}

function on_language_select() {
	const language_selector = document.getElementById("LanguageSelector") as HTMLSelectElement;
	const language = language_selector.value;
	let text_selector = document.getElementById("TextSelector") as HTMLSelectElement;
	remove_options(text_selector);
	for(let key in texts_table[language]) {
		text_selector.add(new Option(key));
	}
}


function setup_texts() {
	let language_selector = document.getElementById("LanguageSelector") as HTMLSelectElement;
	language_selector.onchange = (event) => {
		on_language_select();
		get_selected_text();
	}
	let text_selector = document.getElementById("TextSelector") as HTMLSelectElement;
	text_selector.onchange = (event) => {
		get_selected_text();
	}
}
