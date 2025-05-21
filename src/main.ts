import {UserInterface} from "./user_interface"
import {Recorder} from "./recording"
import {Spectrum} from "./spectrum"
import {TargetFrequencyManager} from "./target_frequency"
import {TableManager} from "./render_table"


window.addEventListener("load", async (event) => {
	let root = document.getElementById("FTVT-root")
	if (!root) {
		alert("No element with root-id found");
		return;
	}
	let ui = new UserInterface(root);
	let tableManager = new TableManager(ui);
	let audioInputStream = await navigator.mediaDevices.getUserMedia({audio: true}).catch(console.log);
	if (audioInputStream) {
		let recorder = new Recorder(audioInputStream, ui, tableManager);
		let targetFrequencyManager = new TargetFrequencyManager(ui);
		let spectrum = new Spectrum(audioInputStream, ui, tableManager, recorder, targetFrequencyManager);
	} else {
		alert("Could not Open Audio-Input; Sadly the spectrum won’t really work without…");
		return;
	}
});

