#pragma once

let current_recording : number[] | null = null;
let record_counter = 0;

let mediaRecorder: MediaRecorder | null = null;
let mediaRecording: Blob[] = [];
let playRecordingOnStop = false;

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
	let total = stats[Gender.UltraFem] + stats[Gender.Fem] + stats[Gender.Enby] + stats[Gender.Masc] + stats[Gender.InfraMasc];
	let tr = document.createElement("tr");

	let td0 = document.createElement("td");
	td0.innerHTML = "#" + (++record_counter).toFixed(0);
	tr.appendChild(td0);

	for (const gender of [Gender.InfraMasc, Gender.Masc, Gender.Enby, Gender.Fem, Gender.UltraFem]) {
		let td = document.createElement("td");
		td.classList.add("NumericTableField");
		td.innerHTML = (100 * stats[gender] / total).toFixed(0) + "%";
		td.style.backgroundColor = gender_to_color(gender).scale(stats[gender]/total).to_str();
		td.style.color = "white";
		tr.appendChild(td);
	}

	let td_text = document.createElement("td");
	td_text.innerHTML = (document.getElementById("LanguageSelector") as HTMLSelectElement).value + "/" + (document.getElementById("TextSelector") as HTMLSelectElement).value;
	tr.appendChild(td_text);

	let td_freq = document.createElement("td");
	const freq = Number((document.getElementById("TargetFrequencySelector") as HTMLSelectElement).value);
	td_freq.innerHTML = freq.toFixed(2) + " Hz (" + note_to_string(frequency_to_note(freq)) + ")" ;
	td_freq.classList.add("NumericTableField");
	td_freq.style.color = frequency_to_color(freq).to_str();
	tr.appendChild(td_freq);


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


	results_table.appendChild(tr);
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
