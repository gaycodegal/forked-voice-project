#pragma once

let current_recording : number[] | null = null;
let record_counter = 0;

let mediaRecorder: MediaRecorder | null = null;
let mediaRecording: Blob[] = [];
let playRecordingOnStop = false;

type GenderShare = {[key in Gender]: number};

interface RecordStats {
	shares: GenderShare;
	average: number;
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
	return {
		"shares": stats,
		"average": stable_sum(freq_data) / freq_data.length
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
	const average_freq = stats.average;
	td_average_freq.innerHTML = average_freq.toFixed(2) + " Hz (" + note_to_string(frequency_to_note(average_freq)) + ")" ;
	td_average_freq.classList.add("NumericTableField");
	td_average_freq.style.color = frequency_to_color(average_freq).to_str();
	tr.appendChild(td_average_freq);

	let td_target_freq = document.createElement("td");
	const target_freq = Number((document.getElementById("TargetFrequencySelector") as HTMLSelectElement).value);
	td_target_freq.innerHTML = target_freq.toFixed(2) + " Hz (" + note_to_string(frequency_to_note(target_freq)) + ")" ;
	td_target_freq.classList.add("NumericTableField");
	td_target_freq.style.color = frequency_to_color(target_freq).to_str();
	tr.appendChild(td_target_freq);

	let td_text = document.createElement("td");
	td_text.innerHTML = (document.getElementById("LanguageSelector") as HTMLSelectElement).value + "/" + (document.getElementById("TextSelector") as HTMLSelectElement).value;
	tr.appendChild(td_text);

	const blob = new Blob(mediaChunks, { type: "audio/ogg; codecs=opus" });
	const audioURL = window.URL.createObjectURL(blob);
	const tdPlayback = document.createElement("td");

	const audio = document.createElement("audio");
	audio.setAttribute("controls", "");
	audio.src = audioURL;
	tdPlayback.appendChild(audio);

	const downloadLink = document.createElement("a");
	downloadLink.innerText = "Save";
	downloadLink.setAttribute("download", "voice_recording.ogg");
	downloadLink.href = audioURL;
	tdPlayback.appendChild(downloadLink);

	tr.appendChild(tdPlayback);

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
