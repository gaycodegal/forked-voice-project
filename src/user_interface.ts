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

	let languageSelector = document.createElement("select");
	controlsDiv.appendChild(languageSelector);
	let textSelector = document.createElement("select");
	controlsDiv.appendChild(textSelector);

	let textDisplay = document.createElement("blockquote");
	textDisplay.id="FTVT-textDisplay";
	controlsDiv.appendChild(textDisplay);
	controlsDiv.appendChild(document.createElement("br"));

	let targetFrequencySelectorLabel = document.createElement("label");
	targetFrequencySelectorLabel.htmlFor="TargetFrequencySelector";
	targetFrequencySelectorLabel.innerHTML="Target Frequency in Hertz: ";
	controlsDiv.appendChild(targetFrequencySelectorLabel)
	let targetFrequencySelector = document.createElement("input");
	targetFrequencySelector.type="number";
	targetFrequencySelector.min="0";
	targetFrequencySelector.value="250";
	controlsDiv.appendChild(targetFrequencySelector);
	controlsDiv.appendChild(document.createElement("br"));

	let playFrequencyButton=document.createElement("button");
	playFrequencyButton.type="button";
	playFrequencyButton.innerHTML="▶️";
	controlsDiv.appendChild(playFrequencyButton);
	let noteSelector = document.createElement("div");
	controlsDiv.appendChild(noteSelector);
	controlsDiv.appendChild(document.createElement("br"));
	let toggleRecordButton = document.createElement("button");
	toggleRecordButton.innerHTML="Start Recording";
	toggleRecordButton.style.color="green";
	controlsDiv.appendChild(toggleRecordButton);
	let autoPlaybackLabel = document.createElement("label");
	autoPlaybackLabel.htmlFor="AutoPlayback";
	autoPlaybackLabel.innerHTML="Automatically play recording"
	controlsDiv.appendChild(autoPlaybackLabel);
	let autoPlayback = document.createElement("input");
	autoPlayback.type="checkbox";
	controlsDiv.appendChild(autoPlayback);

	let [resultsTable, tableBody] = createResultsTable();
	root.appendChild(resultsTable);
	return new UserInterface(root, canvas, volumeSelector, languageSelector, textSelector, textDisplay, freqOut, targetFrequencySelector, playFrequencyButton, noteSelector, toggleRecordButton, autoPlayback, tableBody);
}
