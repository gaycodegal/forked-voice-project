#pragma once

#include "utils.ts"

let record_counter = 0;

function play_recording_on_stop() : boolean {
	let auto_playback_checkbox = document.getElementById("AutoPlayback") as HTMLInputElement;
	return auto_playback_checkbox.checked;
}

function render_counter() : HTMLTableCellElement {
	let td = document.createElement("td");
	td.innerHTML = "#" + (++record_counter).toFixed(0);
	return td;
}

function render_shares(tr: HTMLTableRowElement, stats: RecordStats) {
	const total = stats.shares[Genders.UltraFem] + stats.shares[Genders.Fem] + stats.shares[Genders.Enby] + stats.shares[Genders.Masc] + stats.shares[Genders.InfraMasc];
	for (const gender of Gender.genders){ 
		let td = document.createElement("td");
		td.classList.add("NumericTableField");
		td.innerHTML = (100 * stats.shares[gender.toEnum()] / total).toFixed(0) + "%";
		td.style.backgroundColor = gender.toColor().scale(stats.shares[gender.toEnum()]/total).to_str();
		td.style.color = "white";
		tr.appendChild(td);
	}
}

function add_quantiles_to_list(ul: HTMLUListElement,quantiles: Quantiles){
	for (const key in quantiles) {
		let li = document.createElement("li");
		li.appendChild(frequency_to_html(quantiles[key], key + ": "));
		ul.appendChild(li);
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
	td_target_freq.appendChild(frequency_to_html(target_freq));
	td_target_freq.classList.add("NumericTableField");
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
	if (play_recording_on_stop()) {
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
