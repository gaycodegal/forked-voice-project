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
	table.appendChild(tbody);
	return [table, tbody];
}

function setupUi(root: HTMLElement): UserInterface{

	let canvas = document.createElement("canvas");
	canvas.id="FTVT-canvas"
	root.appendChild(canvas)
	let controlsDiv = document.createElement("div");
	root.appendChild(controlsDiv);
	controlsDiv.id="FTVT-controls";
	let volumeLabel = <HTMLLabelElement> document.createElement("label");
	volumeLabel.innerHTML = "Volume-Threshold:";
	controlsDiv.appendChild(document.createElement("br"));
	controlsDiv.appendChild(volumeLabel)
	let volumeSelector = <HTMLInputElement> document.createElement("input");
	volumeSelector.type = "range";
	volumeSelector.min = "0";
	volumeSelector.max = "255";
	volumeSelector.step="1";
	volumeSelector.value="32";
	controlsDiv.appendChild(volumeSelector);
	controlsDiv.appendChild(document.createTextNode("Main Frequency: "));
	let freqOut = document.createElement("output");
	controlsDiv.appendChild(freqOut);
	controlsDiv.appendChild(document.createElement("br"));

	let LanguageSelector = document.createElement("select");
	controlsDiv.appendChild(LanguageSelector);
	let TextSelector = document.createElement("select");
	controlsDiv.appendChild(TextSelector);

	let TextDisplay = document.createElement("blockquote");
	TextDisplay.id="FTVT-textDisplay";
	controlsDiv.appendChild(TextDisplay);
	controlsDiv.appendChild(document.createElement("br"));

	let TargetFrequencySelectorLabel = document.createElement("label");
	TargetFrequencySelectorLabel.htmlFor="TargetFrequencySelector";
	TargetFrequencySelectorLabel.innerHTML="Target Frequency in Hertz: ";
	controlsDiv.appendChild(TargetFrequencySelectorLabel)
	let TargetFrequencySelector = document.createElement("input");
	TargetFrequencySelector.type="number";
	TargetFrequencySelector.min="0";
	TargetFrequencySelector.value="250";
	controlsDiv.appendChild(TargetFrequencySelector);
	controlsDiv.appendChild(document.createElement("br"));

	let PlayFrequencyButton=document.createElement("button");
	PlayFrequencyButton.type="button";
	PlayFrequencyButton.innerHTML="▶️";
	controlsDiv.appendChild(PlayFrequencyButton);
	let NoteSelector = document.createElement("div");
	controlsDiv.appendChild(NoteSelector);
	controlsDiv.appendChild(document.createElement("br"));
	let ToggleRecordButton = document.createElement("button");
	ToggleRecordButton.innerHTML="Start Recording";
	ToggleRecordButton.style.color="green";
	controlsDiv.appendChild(ToggleRecordButton);
	let AutoPlaybackLabel = document.createElement("label");
	AutoPlaybackLabel.htmlFor="AutoPlayback";
	AutoPlaybackLabel.innerHTML="Automatically play recording"
	controlsDiv.appendChild(AutoPlaybackLabel);
	let AutoPlayback = document.createElement("input");
	AutoPlayback.type="checkbox";
	controlsDiv.appendChild(AutoPlayback);

	let [resultsTable, tableBody] = createResultsTable();
	root.appendChild(resultsTable);
	return new UserInterface(root, canvas, volumeSelector, LanguageSelector, TextSelector, TextDisplay, freqOut, TargetFrequencySelector, PlayFrequencyButton, NoteSelector, ToggleRecordButton, AutoPlayback, tableBody);
}
