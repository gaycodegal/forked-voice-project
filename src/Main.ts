import {UserInterface} from "./UserInterface"
import {Recorder} from "./Recorder"
import {Spectrum} from "./Spectrum"
import {TargetFrequencyManager} from "./TargetFrequencyManager"
import {TableManager} from "./TableManager"

window.addEventListener("load", async (event) => {
	let root = document.getElementById("FTVT-root")
	if (!root) {
		alert("No element with root-id found");
		return;
	}
	root.innerHTML = "";
	let ui = await UserInterface.construct(root);
	let tableManager = new TableManager(ui);
	await tableManager.loadOldRecordings();
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

