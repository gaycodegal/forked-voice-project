#pragma once


let context = new window.AudioContext();

function get_target_frequency() : number {
	let frequency_selector = document.getElementById("TargetFrequencySelector") as HTMLInputElement;
	return Number(frequency_selector.value);
}

function get_play_button(): HTMLButtonElement {
	return document.getElementById("PlayFrequencyButton") as HTMLButtonElement;
}

function start_playing() {
	let play_button = get_play_button();
	var osc = context.createOscillator();
	osc.frequency.value = get_target_frequency(); // Hz
	osc.connect(context.destination);
	play_button.onmouseup = () => {osc.stop();}
	play_button.onmouseout = () => {osc.stop();}
	osc.start();
	//osc.stop(context.currentTime + 2); // stop 2 seconds after the current currentTime
}

function setup_sound_generation() {
	let play_button = document.getElementById("PlayFrequencyButton") as HTMLButtonElement;
	play_button.onmousedown = start_playing;
}
