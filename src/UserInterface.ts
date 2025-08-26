import {DOCUMENTATION} from "./Documentation"
import {TextDisplayElement} from "./TextDisplay"
import {CanvasControls} from "./CanvasControls"
import {Settings} from "./Settings"
import {FrequencyInputElement} from "./InputWidgets";
import {makeVerticallyResizable} from "./Utils";

export class UserInterface {
	public static CANVAS_HEIGHT_KEY = "CanvasHeight";
	root: HTMLElement;
	settings: Settings;
	canvas: HTMLCanvasElement;
	canvasControls: CanvasControls;
	textDisplay: TextDisplayElement;
	targetFrequencySelector: FrequencyInputElement;
	playButton: HTMLButtonElement;
	noteSelector: HTMLDivElement;
	resultsTable: HTMLElement;

	public static async construct(root: HTMLElement) {
		const settings = await Settings.construct();
		const textDisplay = await TextDisplayElement.construct(settings);
		const ret = new UserInterface(root, settings, textDisplay);
		return ret;
	}

	private constructor(root: HTMLElement, settings: Settings, textDisplay: TextDisplayElement) {
		this.root = root
		root.appendChild(createDocumentation());
		this.settings= settings;
		root.appendChild(this.settings.getRoot());

		let canvasDiv = createCanvasDiv(settings);

		this.canvas = document.createElement("canvas");
		this.canvas.id="FTVT-canvas"
		this.canvas.width = document.body.clientWidth;
		this.canvas.height = 1188; // what I had locally, this is only an initial value anyways, so no need to be perfect.
		canvasDiv.appendChild(this.canvas);
		this.root.appendChild(canvasDiv);

		let controlsDiv = document.createElement("div");
		this.root.appendChild(controlsDiv);
		controlsDiv.id="FTVT-controls";

		this.canvasControls = new CanvasControls(this.settings);
		controlsDiv.appendChild(this.canvasControls.getRoot());

		this.textDisplay = textDisplay;
		controlsDiv.appendChild(this.textDisplay.getRoot());

		let mainControlsDiv = document.createElement("div");
		mainControlsDiv.classList.add("FTVT-mainControls");

		this.playButton=document.createElement("button");
		this.playButton.type="button";
		this.playButton.innerHTML="🔊";
		this.playButton.title="Play Target Sound";
		mainControlsDiv.appendChild(this.playButton);

		this.targetFrequencySelector = new FrequencyInputElement(
			mainControlsDiv, "🎯", "Target Frequency", 250, this.settings, "target frequency");
		// createTargetFrequencyBlock(mainControlsDiv, this.settings);

		let mainControlsSpacer = document.createElement("span");
		mainControlsSpacer.classList.add("FTVT-flexSpacer");
		mainControlsDiv.appendChild(mainControlsSpacer);

		let showSettingsButton = document.createElement("button");
		mainControlsDiv.appendChild(showSettingsButton);
		showSettingsButton.outerHTML="<button popovertarget='FTVT-settings' title='Settings'>⚙️</button>";
		
		let showAboutButton = document.createElement("button");
		mainControlsDiv.appendChild(showAboutButton);
		showAboutButton.outerHTML="<button popovertarget='FTVT-about' title='About this Application'>ℹ️</button>";
		
		let showLegalButton = document.createElement("button");
		mainControlsDiv.appendChild(showLegalButton);
		showLegalButton.outerHTML="<button popovertarget='FTVT-legal' title='Legal Information'>⚖️</button>";

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
	let legal_div = document.createElement("div");
	ret.appendChild(legal_div);
	legal_div.outerHTML=DOCUMENTATION["legal"];
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
	topLeft.width="3%";

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
	tr.appendChild(createTh("12%", "Quantiles"));
	tr.appendChild(createTh("20%", "Reference"));
	tr.appendChild(createTh("25%", "Recording"));
	tr.appendChild(createTh("25%", "Notes"));
	let tbody = document.createElement("tbody");
	table.appendChild(tbody);
	tableDiv.appendChild(table);
	parent.appendChild(tableDiv);
	return tbody;
}

function createCanvasDiv(settings: Settings) {
	console.log(window.settings = settings);
	const canvasDiv = document.createElement("div");
	makeVerticallyResizable(canvasDiv, settings, UserInterface.CANVAS_HEIGHT_KEY);
	return canvasDiv;
}
