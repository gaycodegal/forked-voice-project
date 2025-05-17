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
	autoPlaybackCheckbox: HTMLInputElement;
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
		let volumeLabel = document.createElement("label");
		volumeLabel.innerHTML = "Volume-Threshold:";
		controlsDiv.appendChild(document.createElement("br"));
		controlsDiv.appendChild(volumeLabel)
		this.volumeSelector = document.createElement("input");
		this.volumeSelector.type = "range";
		this.volumeSelector.min = "0";
		this.volumeSelector.max = "255";
		this.volumeSelector.step="1";
		this.volumeSelector.value="32";
		controlsDiv.appendChild(this.volumeSelector);
		controlsDiv.appendChild(document.createElement("br"));
		controlsDiv.appendChild(document.createTextNode("Main Frequency: "));
		this.freqOut = document.createElement("output");
		controlsDiv.appendChild(this.freqOut);
		controlsDiv.appendChild(document.createElement("br"));

		let targetFrequencySelectorLabel = document.createElement("label");
		targetFrequencySelectorLabel.htmlFor="TargetFrequencySelector";
		targetFrequencySelectorLabel.innerHTML="Target Frequency in Hertz: ";
		controlsDiv.appendChild(targetFrequencySelectorLabel)
		this.targetFrequencySelector = document.createElement("input");
		this.targetFrequencySelector.type="number";
		this.targetFrequencySelector.min="0";
		this.targetFrequencySelector.value="250";
		controlsDiv.appendChild(this.targetFrequencySelector);
		controlsDiv.appendChild(document.createElement("br"));


		this.languageSelector = document.createElement("select");
		controlsDiv.appendChild(this.languageSelector);
		this.textSelector = document.createElement("select");
		controlsDiv.appendChild(this.textSelector);

		this.textDisplay = document.createElement("blockquote");
		this.textDisplay.id="FTVT-textDisplay";
		controlsDiv.appendChild(this.textDisplay);
		controlsDiv.appendChild(document.createElement("br"));

		let showAboutButton = document.createElement("button");
		controlsDiv.appendChild(showAboutButton);
		showAboutButton.outerHTML="<button popovertarget='FTVT-about'>Show Help</button>";
		let showLicenseButton = document.createElement("button");
		controlsDiv.appendChild(showLicenseButton);
		showLicenseButton.outerHTML="<button popovertarget='FTVT-license'>Show License</button>";
		controlsDiv.appendChild(document.createElement("br"));

		this.playButton=document.createElement("button");
		this.playButton.type="button";
		this.playButton.innerHTML="▶️";
		controlsDiv.appendChild(this.playButton);
		this.noteSelector = document.createElement("div");
		controlsDiv.appendChild(this.noteSelector);
		controlsDiv.appendChild(document.createElement("br"));

		this.toggleRecordButton = document.createElement("button");
		this.toggleRecordButton.innerHTML="Start Recording";
		this.toggleRecordButton.style.color="green";
		controlsDiv.appendChild(this.toggleRecordButton);
		let autoPlaybackLabel = document.createElement("label");
		autoPlaybackLabel.htmlFor="AutoPlayback";
		autoPlaybackLabel.innerHTML="Automatically play recording"
		controlsDiv.appendChild(autoPlaybackLabel);
		this.autoPlaybackCheckbox = document.createElement("input");
		this.autoPlaybackCheckbox.type="checkbox";
		controlsDiv.appendChild(this.autoPlaybackCheckbox);

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
		tr.appendChild(createTh("8%", "Quantiles"));
		tr.appendChild(createTh("8%", "🎯"));
		tr.appendChild(createTh("5%", "Language"));
		tr.appendChild(createTh("15%", "Text"));
		tr.appendChild(createTh("12%", "Playback"));
		tr.appendChild(createTh("5%", "Actions"));
		tr.appendChild(createTh("30%", "Notes"));
		let tbody = document.createElement("tbody");
		table.appendChild(tbody);
		this.root.appendChild(table);
		return tbody;
	}
}

