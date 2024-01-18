#include "recording.ts"
#include "spectrum.ts"
#include "texts.ts"
#include "target_frequency.ts"


window.onload =
(() => {
	setup_volume_threshold_selector();
	setup_languages();
	get_selected_text();
	setup_recording();
	setup_texts();
	setup_spectrum();
	setup_sound_generation();
});

