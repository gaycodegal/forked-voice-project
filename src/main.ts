import {UserInterface} from "./user_interface"
import {Recorder} from "./recording"
import {Spectrum} from "./spectrum"
//import {TextManager} from "./texts"
import {TargetFrequencyManager} from "./target_frequency"
import {TableManager} from "./render_table"
import {Threshold} from "./threshold"


window.addEventListener("load", (event) => {
	let root = document.getElementById("FTVT-root")
	if (root === null) {
		alert("No element with root-id found");
		return;
	}
	let ui = new UserInterface(root);
	let threshold = new Threshold(ui);
	//let textManager = new TextManager(ui);
	let tableManager = new TableManager(ui);
	let recorder = new Recorder(ui, tableManager);
	let targetFrequencyManager = new TargetFrequencyManager(ui);
	let spectrum = new Spectrum(ui, threshold, recorder, targetFrequencyManager);
});

