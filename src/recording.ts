#pragma once

#include "notes.ts"
#include "render_table.ts"

type GenderShare = {[key in Genders]: number};
type Quantiles = {[key in string]: number};

interface RecordStats {
	shares: GenderShare;
	average: number;
	quantiles: Quantiles;
}

let current_recording : number[] | null = null;
let mediaRecorder: MediaRecorder | null = null;
let mediaRecording: Blob[] = [];

function compute_quantiles(unsorted_data: number[]): Quantiles {
	let data = unsorted_data.sort((a,b)=>{return a-b;});
	return {
		"5%": data[to_index(0.05, data.length)],
		"10%": data[to_index(0.10, data.length)],
		"20%": data[to_index(0.20, data.length)],
		"50%": data[to_index(0.50, data.length)],
		"80%": data[to_index(0.80, data.length)],
		"90%": data[to_index(0.90, data.length)],
		"95%": data[to_index(0.95, data.length)],
	};
}

function add_quantiles_to_list(ul: HTMLUListElement,quantiles: Quantiles){
	for (const key in quantiles) {
		let li = document.createElement("li");
		li.appendChild(frequency_to_html(quantiles[key], key + ": "));
		ul.appendChild(li);
	}
}

function analyze_recording(freq_data: number[]): RecordStats {
	let stats : GenderShare = {
		[Genders.UltraFem]: 0,
		[Genders.Fem]: 0,
		[Genders.Enby]: 0,
		[Genders.Masc]: 0,
		[Genders.InfraMasc]: 0
	};
	for (const freq of freq_data) {
		stats[Gender.fromFrequency(freq).toEnum()] += 1;
	}
	const average =  stable_sum(freq_data) / freq_data.length;
	return {
		"shares": stats,
		"average": stable_sum(freq_data) / freq_data.length,
		"quantiles": compute_quantiles(freq_data)
	};
}

function toggle_recording(toggle_element: HTMLInputElement) {
	if (current_recording === null) {
		current_recording = [];
		toggle_element.style.color = "red";
		toggle_element.innerText="Stop Recording"
		if (mediaRecorder) {
			mediaRecording = [];
			mediaRecorder.start();
		}
	} else {
		let recording = current_recording;
		current_recording = null;
		toggle_element.style.color = "green";
		toggle_element.innerText="Start Recording";

		if (mediaRecorder) {
			if (recording.length > 0) {
				mediaRecorder.ondataavailable = (e) => {
					mediaRecording.push(e.data);
					show_recording_results(analyze_recording(recording), mediaRecording);
				}
			}
			mediaRecorder.stop();
		}
	}
}


function setup_recording() {
	let toggle_record_button = document.getElementById("ToggleRecordButton") as HTMLInputElement;
	toggle_record_button.onclick = (event) => {
		toggle_recording(toggle_record_button);
	}
}
