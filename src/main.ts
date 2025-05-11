#include "setup_ui.ts"
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
	setup_volume_threshold_selector();
	setup_languages();
	get_selected_text();
	setup_recording();
	setup_texts();
	setup_spectrum();
	setup_sound_generation();
});

