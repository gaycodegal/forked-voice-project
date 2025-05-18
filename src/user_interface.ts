#pragma once

#include "documentation.ts"

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
	resultsTable: HTMLElement;

	constructor(root: HTMLElement) {
		this.root = root
		root.appendChild(this.createDocumentation());
		this.canvas = document.createElement("canvas");
		this.canvas.id="FTVT-canvas"
		this.root.appendChild(this.canvas)
		let controlsDiv = document.createElement("div");
		this.root.appendChild(controlsDiv);
		controlsDiv.id="FTVT-controls";

		let freqOutLabel = document.createElement("label");
		freqOutLabel.innerHTML = "Main Frequency:";
		this.freqOut = document.createElement("output");
		freqOutLabel.appendChild(this.freqOut);
		controlsDiv.appendChild(freqOutLabel);

		let thresholdDiv = document.createElement("label");
		thresholdDiv.id = "FTVT-threshold";
		let volumeLabel = document.createElement("span");
		volumeLabel.innerHTML = "Volume-Threshold:";
		volumeLabel.style.flexShrink = "0";
		thresholdDiv.appendChild(volumeLabel)
		this.volumeSelector = document.createElement("input");
		this.volumeSelector.type = "range";
		this.volumeSelector.min = "0";
		this.volumeSelector.max = "255";
		this.volumeSelector.step="1";
		this.volumeSelector.value="32";
		this.volumeSelector.style.flexGrow = "1";
		thresholdDiv.appendChild(this.volumeSelector);
		controlsDiv.appendChild(thresholdDiv);


		this.languageSelector = document.createElement("select");
		this.languageSelector.id = "FTVT-languageSelector";
		controlsDiv.appendChild(this.languageSelector);
		this.textSelector = document.createElement("select");
		this.textSelector.id = "FTVT-textSelector";
		controlsDiv.appendChild(this.textSelector);

		this.textDisplay = document.createElement("blockquote");
		this.textDisplay.id="FTVT-textDisplay";
		controlsDiv.appendChild(this.textDisplay);

		let mainControlsDiv = document.createElement("div");
		mainControlsDiv.classList.add("FTVT-mainControls");

		this.toggleRecordButton = document.createElement("button");
		this.toggleRecordButton.innerHTML="⏺️";
		this.toggleRecordButton.title="Toggle Recording";
		this.toggleRecordButton.style.backgroundColor="green";
		this.toggleRecordButton.style.color="white";
		this.toggleRecordButton.id = "FTVT-toggleRecordButton";
		mainControlsDiv.appendChild(this.toggleRecordButton);
		
		this.playButton=document.createElement("button");
		this.playButton.type="button";
		this.playButton.innerHTML="🔊";
		this.playButton.title="Play Target Sound";
		mainControlsDiv.appendChild(this.playButton);

		let targetFrequencyBlock = document.createElement("label");
		targetFrequencyBlock.classList.add("FTVT-frequencyBlock");
		let targetFrequencySelectorLabel = document.createElement("abbr");
		targetFrequencySelectorLabel.title="target frequency";
		targetFrequencySelectorLabel.innerHTML="🎯";
		targetFrequencyBlock.appendChild(targetFrequencySelectorLabel)
		this.targetFrequencySelector = document.createElement("input");
		this.targetFrequencySelector.type="number";
		this.targetFrequencySelector.min="0";
		this.targetFrequencySelector.value="250";
		this.targetFrequencySelector.step="any";
		targetFrequencyBlock.appendChild(this.targetFrequencySelector);
		let targetFrequencyUnitLabel = document.createElement("abbr");
		targetFrequencyUnitLabel.title="Hertz";
		targetFrequencyUnitLabel.innerHTML="Hz";
		targetFrequencyUnitLabel.classList.add("FTVT-unit");
		targetFrequencyBlock.appendChild(targetFrequencyUnitLabel);
		mainControlsDiv.appendChild(targetFrequencyBlock);

		let mainControlsSpacer = document.createElement("span");
		mainControlsSpacer.classList.add("FTVT-flexSpacer");
		mainControlsDiv.appendChild(mainControlsSpacer);

		let showAboutButton = document.createElement("button");
		mainControlsDiv.appendChild(showAboutButton);
		showAboutButton.outerHTML="<button popovertarget='FTVT-about'>ℹ️</button>";
		
		let showLicenseButton = document.createElement("button");
		mainControlsDiv.appendChild(showLicenseButton);
		showLicenseButton.outerHTML="<button popovertarget='FTVT-license' title='show License'>⚖️</button>";

		controlsDiv.appendChild(mainControlsDiv);

		this.noteSelector = document.createElement("div");
		this.noteSelector.id = 'FTVT-noteSelector';
		controlsDiv.appendChild(this.noteSelector);

		this.resultsTable = this.createResultsTable();
	}

	private createDocumentation(): HTMLDivElement {
		let ret = document.createElement("div");
		let about_div = document.createElement("div");
		ret.appendChild(about_div);
		about_div.outerHTML=DOCUMENTATION["about"];
		let license_div = document.createElement("div");
		ret.appendChild(license_div);
		license_div.outerHTML=DOCUMENTATION["license"];
		return ret;
	}

	private createResultsTable(): HTMLElement {

		function createTh(width: string, content: string): HTMLElement {
			let ret = document.createElement("th");
			ret.width = width;
			ret.innerHTML=content;
			return ret;
		}

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
		tr.appendChild(createTh("13%", "Quantiles"));
		tr.appendChild(createTh("20%", "Reference"));
		tr.appendChild(createTh("25%", "Recording"));
		tr.appendChild(createTh("25%", "Notes"));
		let tbody = document.createElement("tbody");
		table.appendChild(tbody);
		this.root.appendChild(table);
		return tbody;
	}
}

