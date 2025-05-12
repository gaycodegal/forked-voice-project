#pragma once

class UserInterface {
	root: HTMLElement;
	canvas: HTMLCanvasElement;
	volumeSelector: HTMLInputElement;
	languageSelector: HTMLSelectElement;
	textSelector: HTMLSelectElement;
	textDisplay: HTMLQuoteElement;
	freqOut: HTMLOutputElement;
	targetFrequencySelector: HTMLInputElement;
	playButton: HTMLButtonElement;
	noteSelector: HTMLDivElement;
	toggleRecordButton: HTMLButtonElement;
	autoPlaybackCheckbox: HTMLInputElement;
	resultsTable: HTMLElement;
	constructor(root: HTMLElement,
		    canvas: HTMLCanvasElement,
		    volumeSelector: HTMLInputElement,
		    languageSelector: HTMLSelectElement,
		    textSelector: HTMLSelectElement,
		    textDisplay: HTMLQuoteElement,
		    freqOut: HTMLOutputElement,
		    targetFrequencySelector: HTMLInputElement,
	            playButton: HTMLButtonElement,
		    noteSelector: HTMLDivElement,
		    toggleRecordButton: HTMLButtonElement,
		    autoPlaybackCheckbox: HTMLInputElement,
		    resultsTable: HTMLElement,
	) {
		this.root = root;
		this.canvas = canvas;
		this.volumeSelector = volumeSelector;
		this.languageSelector = languageSelector;
		this.textSelector = textSelector;
		this.textDisplay = textDisplay;
		this.freqOut = freqOut;
		this.targetFrequencySelector = targetFrequencySelector;
		this.playButton = playButton;
		this.noteSelector = noteSelector;
		this.toggleRecordButton  = toggleRecordButton;
		this.autoPlaybackCheckbox = autoPlaybackCheckbox;
		this.resultsTable = resultsTable
	}
}

function createTh(width: string, content: string): HTMLElement {
	let ret = document.createElement("th");
	ret.width = width;
	ret.innerHTML=content;
	return ret;
}

function createResultsTable(): [HTMLTableElement, HTMLElement] {
	let table = document.createElement("table");
	let thead = document.createElement("thead");
	table.appendChild(thead);
	let tr = document.createElement("tr");
	thead.appendChild(tr);
	tr.appendChild(createTh("2%", ""));
	tr.appendChild(createTh("3%", "⏬"));
	tr.appendChild(createTh("3%", "♂️"));
	tr.appendChild(createTh("3%", "⏺️"));
	tr.appendChild(createTh("3%", "♀️"));
	tr.appendChild(createTh("3%", "⏫"));
	tr.appendChild(createTh("8%", "Quantiles"));
	tr.appendChild(createTh("8%", "🎯"));
	tr.appendChild(createTh("5%", "Language"));
	tr.appendChild(createTh("15%", "Text"));
	tr.appendChild(createTh("12%", "Playback"));
	tr.appendChild(createTh("5%", "Actions"));
	tr.appendChild(createTh("30%", "Notes"));
	let tbody = document.createElement("tbody");
	tbody.id="RecordResultTableBody";
	table.appendChild(tbody);
	return [table, tbody];
}

function setupUi(root: HTMLElement): UserInterface{

	let canvas = document.createElement("canvas");
	canvas.id = "canvas";
	root.appendChild(canvas)
	let volumeLabel = <HTMLLabelElement> document.createElement("label");
	volumeLabel.innerHTML = "Volume-Threshold:";
	root.appendChild(document.createElement("br"));
	root.appendChild(volumeLabel)
	let volumeSelector = <HTMLInputElement> document.createElement("input");
	volumeSelector.type = "range";
	volumeSelector.min = "0";
	volumeSelector.max = "255";
	volumeSelector.step="1";
	volumeSelector.value="32";
	volumeSelector.id="VolumeThresholdSelector";
	root.appendChild(volumeSelector);
	root.appendChild(document.createTextNode("Main Frequency: "));
	let freqOut = document.createElement("output");
	freqOut.id = "freq-out";
	root.appendChild(freqOut);
	root.appendChild(document.createElement("br"));

	let LanguageSelector = document.createElement("select");
	LanguageSelector.id = "LanguageSelector";
	root.appendChild(LanguageSelector);
	let TextSelector = document.createElement("select");
	TextSelector.id = "TextSelector";
	root.appendChild(TextSelector);

	let TextDisplay = document.createElement("blockquote");
	TextDisplay.id="TextDisplay";
	root.appendChild(TextDisplay);
	root.appendChild(document.createElement("br"));

	let TargetFrequencySelectorLabel = document.createElement("label");
	TargetFrequencySelectorLabel.htmlFor="TargetFrequencySelector";
	TargetFrequencySelectorLabel.innerHTML="Target Frequency in Hertz: ";
	root.appendChild(TargetFrequencySelectorLabel)
	let TargetFrequencySelector = document.createElement("input");
	TargetFrequencySelector.id="TargetFrequencySelector";
	TargetFrequencySelector.type="number";
	TargetFrequencySelector.min="0";
	TargetFrequencySelector.value="250";
	root.appendChild(TargetFrequencySelector);
	root.appendChild(document.createElement("br"));

	let PlayFrequencyButton=document.createElement("button");
	PlayFrequencyButton.id="PlayFrequencyButton";
	PlayFrequencyButton.type="button";
	PlayFrequencyButton.innerHTML="▶️";
	root.appendChild(PlayFrequencyButton);
	let NoteSelector = document.createElement("div");
	NoteSelector.id="NoteSelector";
	root.appendChild(NoteSelector);
	root.appendChild(document.createElement("br"));
	let ToggleRecordButton = document.createElement("button");
	ToggleRecordButton.id="ToggleRecordButton";
	ToggleRecordButton.innerHTML="Start Recording";
	root.appendChild(ToggleRecordButton);
	let AutoPlaybackLabel = document.createElement("label");
	AutoPlaybackLabel.htmlFor="AutoPlayback";
	AutoPlaybackLabel.innerHTML="Automatically play recording"
	root.appendChild(AutoPlaybackLabel);
	let AutoPlayback = document.createElement("input");
	AutoPlayback.id="AutoPlayback";
	AutoPlayback.type="checkbox";
	root.appendChild(AutoPlayback);

	let [resultsTable, tableBody] = createResultsTable();
	root.appendChild(resultsTable);
	return new UserInterface(root, canvas, volumeSelector, LanguageSelector, TextSelector, TextDisplay, freqOut, TargetFrequencySelector, PlayFrequencyButton, NoteSelector, ToggleRecordButton, AutoPlayback, tableBody);
}
