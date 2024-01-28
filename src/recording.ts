#pragma once

#include "notes.ts"
#include "utils.ts"

let current_recording : number[] | null = null;
let record_counter = 0;

let mediaRecorder: MediaRecorder | null = null;
let mediaRecording: Blob[] = [];
let playRecordingOnStop = false;

type GenderShare = {[key in Gender]: number};
type Quantiles = {[key in string]: number};

interface RecordStats {
	shares: GenderShare;
	average: number;
	quantiles: Quantiles;
}


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
		[Gender.UltraFem]: 0,
		[Gender.Fem]: 0,
		[Gender.Enby]: 0,
		[Gender.Masc]: 0,
		[Gender.InfraMasc]: 0
	};
	for (const freq of freq_data) {
		stats[frequency_to_gender(freq)] += 1;
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

function render_shares(tr: HTMLTableRowElement, stats: RecordStats) {
	const total = stats.shares[Gender.UltraFem] + stats.shares[Gender.Fem] + stats.shares[Gender.Enby] + stats.shares[Gender.Masc] + stats.shares[Gender.InfraMasc];
	for (const gender of [Gender.InfraMasc, Gender.Masc, Gender.Enby, Gender.Fem, Gender.UltraFem]) {
		let td = document.createElement("td");
		td.classList.add("NumericTableField");
		td.innerHTML = (100 * stats.shares[gender] / total).toFixed(0) + "%";
		td.style.backgroundColor = gender_to_color(gender).scale(stats.shares[gender]/total).to_str();
		td.style.color = "white";
		tr.appendChild(td);
	}
}


function render_quantiles(stats: RecordStats) : HTMLTableCellElement {
	let td_average_freq = document.createElement("td");
	let ul_average_freq = document.createElement("ul");
	ul_average_freq.classList.add("no-bullets");
	add_quantiles_to_list(ul_average_freq, stats.quantiles);
	let li_average_freq = document.createElement("li");
	li_average_freq.appendChild(frequency_to_html(stats.average, "avg: "));
	ul_average_freq.appendChild(li_average_freq);
	td_average_freq.appendChild(ul_average_freq);
	td_average_freq.classList.add("NumericTableField");
	return td_average_freq;
}

function render_target(stats: RecordStats) : HTMLTableCellElement{
	let td_target_freq = document.createElement("td");
	const target_freq = Number(get_selector_value("TargetFrequencySelector"));
	td_target_freq.innerHTML = target_freq.toFixed(2) + " Hz (" + note_to_string(frequency_to_note(target_freq)) + ")" ;
	td_target_freq.classList.add("NumericTableField");
	td_target_freq.style.color = frequency_to_color(target_freq).to_str();
	return td_target_freq;
}

function render_selector_value(name: string) : HTMLTableCellElement {
	let td = document.createElement("td");
	td.innerHTML = get_selector_value(name);
	return td;
}

function render_playback(audioURL: string): HTMLTableCellElement {
	const tdPlayback = document.createElement("td");
	const audio = document.createElement("audio");
	audio.setAttribute("controls", "");
	audio.src = audioURL;
	tdPlayback.appendChild(audio);
	if (playRecordingOnStop) {
		audio.play();
	}
	return tdPlayback;
}

function render_controls(tr: HTMLTableRowElement, audioURL: string) : HTMLTableCellElement {
	const tdControls = document.createElement("td");
	tdControls.classList.add("ActionField");
	const downloadLink = document.createElement("a");
	downloadLink.innerText = "⬇️";
	downloadLink.setAttribute("download", "voice_recording.ogg");
	downloadLink.href = audioURL;
	tdControls.appendChild(downloadLink);
	const removeLink = document.createElement("a");
	removeLink.innerText = "❌";
	removeLink.onclick = () => {
		tr.remove();
	};
	tdControls.appendChild(removeLink);
	return tdControls;
}

function render_notes() : HTMLTableCellElement {
	const tdNote = document.createElement("td");
	let noteField = document.createElement("textarea");
	noteField.style.width = "100%";
	tdNote.appendChild(noteField);
	return tdNote;
}

function render_counter() : HTMLTableCellElement {
	let td = document.createElement("td");
	td.innerHTML = "#" + (++record_counter).toFixed(0);
	return td;
}


function render_recording(stats: RecordStats, recording: Blob[]) : HTMLTableRowElement {
	const blob = new Blob(recording, { type: "audio/ogg; codecs=opus" });
	const audioURL = window.URL.createObjectURL(blob);

	let tr = document.createElement("tr");
	tr.appendChild(render_counter());
	render_shares(tr, stats);
	tr.appendChild(render_quantiles(stats));
	tr.appendChild(render_target(stats));
	tr.appendChild(render_selector_value("LanguageSelector"));
	tr.appendChild(render_selector_value("TextSelector"));
	tr.appendChild(render_playback(audioURL));
	tr.appendChild(render_controls(tr, audioURL));
	tr.appendChild(render_notes());

	return tr;
}

function show_recording_results(stats: RecordStats, recording: Blob[]) {
	let results_table = document.getElementById("RecordResultTableBody") as HTMLElement;
	results_table.insertBefore(render_recording(stats, recording), results_table.children[0]);
}

function setup_recording() {
	let toggle_record_button = document.getElementById("ToggleRecordButton") as HTMLInputElement;
	toggle_record_button.onclick = (event) => {
		toggle_recording(toggle_record_button);
	}

	let auto_playback_checkbox = document.getElementById("AutoPlayback") as HTMLInputElement;
	auto_playback_checkbox.onchange = (event) => {
		playRecordingOnStop = auto_playback_checkbox.checked;
	}
}
