#pragma once

let current_recording : number[] | null = null;
let record_counter = 0;

type RecordStats = {[key in Gender]: number};

function analyze_recording(freq_data: number[]): RecordStats {
	let stats : RecordStats = {
		[Gender.UltraFem]: 0,
		[Gender.Fem]: 0,
		[Gender.Enby]: 0,
		[Gender.Masc]: 0,
		[Gender.InfraMasc]: 0
	};
	for (const freq of freq_data) {
		stats[frequency_to_gender(freq)] += 1;
		console.log(freq);
	}
	return stats;
}

function toggle_recording(toggle_element: HTMLInputElement) {
	if (current_recording === null) {
		current_recording = [];
		toggle_element.style.color = "red";
		toggle_element.innerText="Stop Recording"
	} else {
		let recording = current_recording;
		current_recording = null;
		toggle_element.style.color = "green";
		toggle_element.innerText="Start Recording";

		if (recording.length > 0) {
			show_recording_results(analyze_recording(recording));
		}
	}
}

function show_recording_results(stats: RecordStats) {
	let results_table = document.getElementById("RecordResultTableBody") as HTMLElement;
	let total = stats[Gender.UltraFem] + stats[Gender.Fem] + stats[Gender.Enby] + stats[Gender.Masc] + stats[Gender.InfraMasc];
	let tr = document.createElement("tr");

	let td0 = document.createElement("td");
	td0.innerHTML = "#" + (++record_counter).toFixed(0);
	tr.appendChild(td0);

	for (const gender of [Gender.Fem, Gender.Masc, Gender.UltraFem, Gender.InfraMasc, Gender.Enby]) {
		let td = document.createElement("td");
		td.innerHTML = (100 * stats[gender] / total).toFixed(0) + "%";
		tr.appendChild(td);
	}

	results_table.appendChild(tr);
}

function setup_recording() {
	let toggle_record_button = document.getElementById("ToggleRecordButton") as HTMLInputElement;
	toggle_record_button.onclick = (event) => {
		toggle_recording(toggle_record_button);
	}
}
