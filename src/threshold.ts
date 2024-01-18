#pragma once

let current_threshold = 0;

function get_current_threshold(): number {
	return current_threshold;
}

function setup_volume_threshold_selector() {
	let threshold_selector = document.getElementById("VolumeThresholdSelector") as HTMLInputElement;
	current_threshold = Number(threshold_selector.value);
	threshold_selector.onchange = (event) => {
		current_threshold = Number(threshold_selector.value);
	};
}
