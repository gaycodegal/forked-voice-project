#pragma once

#include "notes.ts"

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


/// sums the values in the provided array, but does so in a way that ensure numeric stability
function stable_sum(data: number[], low: number = 0, high: number = -1, split: number = 10) : number{
	if (high < 0) {
		high = data.length;
	}
	if (high - low > split) {
		const step = Math.ceil((high-low) / split);
		let ret = 0;
		for (let i = low; i < high; i += step) {
			ret += stable_sum(data, i, Math.min(i + step, high), split);
		}
		return ret;
	} else {
		return data.slice(low, high).reduce((a,b) => a+b, 0);
	}

}

function to_index(pos: number, length: number): number {
	return Math.min(length, (Math.max(0, Math.round(pos*length))));
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

function show_recording_results(stats: RecordStats, mediaChunks: Blob[]) {
	let results_table = document.getElementById("RecordResultTableBody") as HTMLElement;
	let total = stats.shares[Gender.UltraFem] + stats.shares[Gender.Fem] + stats.shares[Gender.Enby] + stats.shares[Gender.Masc] + stats.shares[Gender.InfraMasc];
	let tr = document.createElement("tr");

	let td0 = document.createElement("td");
	td0.innerHTML = "#" + (++record_counter).toFixed(0);
	tr.appendChild(td0);

	for (const gender of [Gender.InfraMasc, Gender.Masc, Gender.Enby, Gender.Fem, Gender.UltraFem]) {
		let td = document.createElement("td");
		td.classList.add("NumericTableField");
		td.innerHTML = (100 * stats.shares[gender] / total).toFixed(0) + "%";
		td.style.backgroundColor = gender_to_color(gender).scale(stats.shares[gender]/total).to_str();
		td.style.color = "white";
		tr.appendChild(td);
	}

	let td_average_freq = document.createElement("td");
	let ul_average_freq = document.createElement("ul");
	ul_average_freq.classList.add("no-bullets");
	add_quantiles_to_list(ul_average_freq, stats.quantiles);
	let li_average_freq = document.createElement("li");
	li_average_freq.appendChild(frequency_to_html(stats.average, "avg: "));//quantiles_to_html(stats.quantiles) + "avg: " + frequency_to_string(stats.average);
	ul_average_freq.appendChild(li_average_freq);
	td_average_freq.appendChild(ul_average_freq);
	td_average_freq.classList.add("NumericTableField");
	//td_average_freq.style.color = frequency_to_color(average_freq).to_str();
	tr.appendChild(td_average_freq);

	let td_target_freq = document.createElement("td");
	const target_freq = Number((document.getElementById("TargetFrequencySelector") as HTMLSelectElement).value);
	td_target_freq.innerHTML = target_freq.toFixed(2) + " Hz (" + note_to_string(frequency_to_note(target_freq)) + ")" ;
	td_target_freq.classList.add("NumericTableField");
	td_target_freq.style.color = frequency_to_color(target_freq).to_str();
	tr.appendChild(td_target_freq);

	let td_lang = document.createElement("td");
	td_lang.innerHTML = (document.getElementById("LanguageSelector") as HTMLSelectElement).value;
	tr.appendChild(td_lang);

	let td_text = document.createElement("td");
	td_text.innerHTML = (document.getElementById("TextSelector") as HTMLSelectElement).value;
	tr.appendChild(td_text);


	const blob = new Blob(mediaChunks, { type: "audio/ogg; codecs=opus" });
	const audioURL = window.URL.createObjectURL(blob);

	const tdPlayback = document.createElement("td");
	const audio = document.createElement("audio");
	audio.setAttribute("controls", "");
	audio.src = audioURL;
	tdPlayback.appendChild(audio);
	tr.appendChild(tdPlayback);

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

	tr.appendChild(tdControls);

	const tdNote = document.createElement("td");
	let noteField = document.createElement("textarea");
	noteField.style.width = "100%";
	tdNote.appendChild(noteField);
	tr.appendChild(tdNote);

	if (playRecordingOnStop) {
		audio.play();
	}

	results_table.insertBefore(tr, results_table.children[0]);
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
