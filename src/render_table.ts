#pragma once

#include "utils.ts"
#include "user_interface.ts"

class TableManager {

	record_counter : number = 0;
	auto_playback_checkbox: HTMLInputElement;
	results_table: HTMLElement;
	targetFrequencySelector: HTMLInputElement;
	languageSelector: HTMLSelectElement;
	textSelector: HTMLSelectElement;

	constructor(ui: UserInterface) {
		this.auto_playback_checkbox = ui.autoPlaybackCheckbox;
		this.results_table = ui.resultsTable;
		this.targetFrequencySelector = ui.targetFrequencySelector;
		this.languageSelector = ui.languageSelector;
		this.textSelector = ui.textSelector;
	}

	play_recording_on_stop() : boolean {
		return this.auto_playback_checkbox.checked;
	}

	render_counter() : HTMLTableCellElement {
		let td = document.createElement("td");
		td.innerHTML = "#" + (++(this.record_counter)).toFixed(0);
		return td;
	}

	render_shares(tr: HTMLTableRowElement, stats: RecordStats) {
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

	add_quantiles_to_list(ul: HTMLUListElement,quantiles: Quantiles){
		for (const key in quantiles) {
			let li = document.createElement("li");
			li.appendChild(frequency_to_html(quantiles[key], key + ": "));
			ul.appendChild(li);
		}
	}

	render_quantiles(stats: RecordStats) : HTMLTableCellElement {
		let td_average_freq = document.createElement("td");
		let ul_average_freq = document.createElement("ul");
		ul_average_freq.classList.add("no-bullets");
		this.add_quantiles_to_list(ul_average_freq, stats.quantiles);
		let li_average_freq = document.createElement("li");
		li_average_freq.appendChild(frequency_to_html(stats.average, "avg: "));
		ul_average_freq.appendChild(li_average_freq);
		td_average_freq.appendChild(ul_average_freq);
		td_average_freq.classList.add("NumericTableField");
		return td_average_freq;
	}

	render_target(stats: RecordStats) : HTMLTableCellElement{
		let td_target_freq = document.createElement("td");
		const target_freq = Number(this.targetFrequencySelector.value);
		td_target_freq.appendChild(frequency_to_html(target_freq));
		td_target_freq.classList.add("NumericTableField");
		return td_target_freq;
	}

	render_selector_value(value: string) : HTMLTableCellElement {
		let td = document.createElement("td");
		td.innerHTML = value;
		return td;
	}

	render_playback(audioURL: string): HTMLTableCellElement {
		const tdPlayback = document.createElement("td");
		const audio = document.createElement("audio");
		audio.setAttribute("controls", "");
		audio.src = audioURL;
		tdPlayback.appendChild(audio);
		if (this.play_recording_on_stop()) {
			audio.play();
		}
		return tdPlayback;
	}

	render_controls(tr: HTMLTableRowElement, audioURL: string) : HTMLTableCellElement {
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

	render_notes() : HTMLTableCellElement {
		const tdNote = document.createElement("td");
		let noteField = document.createElement("textarea");
		noteField.style.width = "100%";
		tdNote.appendChild(noteField);
		return tdNote;
	}


	render_recording(stats: RecordStats, recording: Blob[]) : HTMLTableRowElement {
		const blob = new Blob(recording, { type: "audio/ogg; codecs=opus" });
		const audioURL = window.URL.createObjectURL(blob);

		let tr = document.createElement("tr");
		tr.appendChild(this.render_counter());
		this.render_shares(tr, stats);
		tr.appendChild(this.render_quantiles(stats));
		tr.appendChild(this.render_target(stats));
		tr.appendChild(this.render_selector_value(this.languageSelector.value));
		tr.appendChild(this.render_selector_value(this.textSelector.value));
		tr.appendChild(this.render_playback(audioURL));
		tr.appendChild(this.render_controls(tr, audioURL));
		tr.appendChild(this.render_notes());

		return tr;
	}

	addRecording(stats: RecordStats, recording: Blob[]) {
		this.results_table.insertBefore(this.render_recording(stats, recording), this.results_table.children[0]);
	}
}
