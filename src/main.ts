#include "user_interface.ts"
#include "recording.ts"
#include "spectrum.ts"
#include "texts.ts"
#include "target_frequency.ts"
#include "render_table.ts"


window.addEventListener("load", (event) => {
	let root = document.getElementById("ftvt-root")
	if (root === null) {
		alert("No element with root-id found");
		return;
	}
	let ui = setupUi(root);
	let threshold = new Threshold(ui);
	let textManager = new TextManager(ui);
	let tableManager = new TableManager(ui);
	let recorder = new Recorder(ui, tableManager);
	let targetFrequencyManager = new TargetFrequencyManager(ui);
	let spectrum = new Spectrum(ui, threshold, recorder, targetFrequencyManager);
});

