#include "user_interface.ts"
#include "recording.ts"
#include "spectrum.ts"
#include "texts.ts"
#include "target_frequency.ts"


window.addEventListener("load", (event) => {
	let root = document.getElementById("ftvt-root")
	if (root === null) {
		alert("No element with root-id found");
		return;
	}
	let ui = setupUi(root);
	let threshold = new Threshold(ui);
	setup_languages();
	get_selected_text();
	//setup_recording();
	let recorder = new Recorder(ui);
	setup_texts();
	let spectrum = new Spectrum(ui, threshold, recorder);
	setup_sound_generation();
});

