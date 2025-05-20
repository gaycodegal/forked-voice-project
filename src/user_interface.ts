import {DOCUMENTATION} from "./documentation"
import {TextDisplayElement} from "./texts"
import {CanvasControls} from "./canvas_controls"
import {Settings} from "./settings"

export class UserInterface {
	root: HTMLElement;
	settings: Settings;
	canvas: HTMLCanvasElement;
	canvasControls: CanvasControls;
	textDisplay: TextDisplayElement;
	targetFrequencySelector: HTMLInputElement;
	playButton: HTMLButtonElement;
	noteSelector: HTMLDivElement;
	resultsTable: HTMLElement;

	constructor(root: HTMLElement) {
		this.root = root
		root.appendChild(createDocumentation());
		this.settings= new Settings();
		root.appendChild(this.settings.getRoot());

		let canvasDiv = document.createElement("div");
		this.canvas = document.createElement("canvas");
		this.canvas.id="FTVT-canvas"
		canvasDiv.appendChild(this.canvas)
		this.root.appendChild(canvasDiv)

		let controlsDiv = document.createElement("div");
		this.root.appendChild(controlsDiv);
		controlsDiv.id="FTVT-controls";

		this.canvasControls = new CanvasControls(this.settings);
		controlsDiv.appendChild(this.canvasControls.getRoot());

		this.textDisplay = new TextDisplayElement();
		controlsDiv.appendChild(this.textDisplay.getRoot());

		let mainControlsDiv = document.createElement("div");
		mainControlsDiv.classList.add("FTVT-mainControls");

		this.playButton=document.createElement("button");
		this.playButton.type="button";
		this.playButton.innerHTML="🔊";
		this.playButton.title="Play Target Sound";
		mainControlsDiv.appendChild(this.playButton);

		this.targetFrequencySelector = createTargetFrequencyBlock(mainControlsDiv, this.settings);

		let mainControlsSpacer = document.createElement("span");
		mainControlsSpacer.classList.add("FTVT-flexSpacer");
		mainControlsDiv.appendChild(mainControlsSpacer);

		let showSettingsButton = document.createElement("button");
		mainControlsDiv.appendChild(showSettingsButton);
		showSettingsButton.outerHTML="<button popovertarget='FTVT-settings'>⚙️</button>";
		
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

		this.resultsTable = createResultsTable(this.root);
	}

}

function createDocumentation(): HTMLDivElement {
	let ret = document.createElement("div");
	let about_div = document.createElement("div");
	ret.appendChild(about_div);
	about_div.outerHTML=DOCUMENTATION["about"];
	let license_div = document.createElement("div");
	ret.appendChild(license_div);
	license_div.outerHTML=DOCUMENTATION["license"];
	return ret;
}

function createResultsTable(parent: HTMLElement): HTMLElement {

	function createTh(width: string, content: string): HTMLElement {
		let ret = document.createElement("th");
		ret.width = width;
		ret.innerHTML=content;
		return ret;
	}
	let topLeft = document.createElement("td");
	topLeft.width="2%";

	let tableDiv =document.createElement("div");
	let table = document.createElement("table");
	let thead = document.createElement("thead");
	table.appendChild(thead);
	let tr = document.createElement("tr");
	thead.appendChild(tr);
	tr.appendChild(topLeft);
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
	tableDiv.appendChild(table);
	parent.appendChild(tableDiv);
	return tbody;
}

function createTargetFrequencyBlock(parent: HTMLElement, settings: Settings): HTMLInputElement {
	let targetFrequencyBlock = document.createElement("label");
	targetFrequencyBlock.classList.add("FTVT-frequencyBlock");
	let targetFrequencySelectorLabel = document.createElement("abbr");
	targetFrequencySelectorLabel.title="target frequency";
	targetFrequencySelectorLabel.innerHTML="🎯";
	targetFrequencyBlock.appendChild(targetFrequencySelectorLabel)
	let targetFrequencySelector = document.createElement("input");
	targetFrequencySelector.type="number";
	targetFrequencySelector.min="0";
	targetFrequencySelector.value=settings.storage.getOr("target frequency", "250");
	targetFrequencySelector.step="any";
	targetFrequencySelector.addEventListener("change", (event) => {
		const num = targetFrequencySelector.value;
		if (num) {
			settings.storage.update("target frequency", num.toString());
		}
	});
	targetFrequencyBlock.appendChild(targetFrequencySelector);
	let targetFrequencyUnitLabel = document.createElement("abbr");
	targetFrequencyUnitLabel.title="Hertz";
	targetFrequencyUnitLabel.innerHTML="Hz";
	targetFrequencyUnitLabel.classList.add("FTVT-unit");
	targetFrequencyBlock.appendChild(targetFrequencyUnitLabel);
	parent.appendChild(targetFrequencyBlock);
	return targetFrequencySelector;
}
