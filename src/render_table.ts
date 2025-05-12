#pragma once

#include "utils.ts"
#include "user_interface.ts"

class TableManager {

	numRecordings : number = 0;
	autoPlaybackCheckbox: HTMLInputElement;
	resultsTable: HTMLElement;
	targetFrequencySelector: HTMLInputElement;
	languageSelector: HTMLSelectElement;
	textSelector: HTMLSelectElement;

	constructor(ui: UserInterface) {
		this.autoPlaybackCheckbox = ui.autoPlaybackCheckbox;
		this.resultsTable = ui.resultsTable;
		this.targetFrequencySelector = ui.targetFrequencySelector;
		this.languageSelector = ui.languageSelector;
		this.textSelector = ui.textSelector;
	}

	renderCounter() : HTMLTableCellElement {
		let td = document.createElement("td");
		td.innerHTML = "#" + (++(this.numRecordings)).toFixed(0);
		return td;
	}

	renderShares(tr: HTMLTableRowElement, stats: RecordStats) {
		const total = stats.shares[Genders.UltraFem] + stats.shares[Genders.Fem] + stats.shares[Genders.Enby] + stats.shares[Genders.Masc] + stats.shares[Genders.InfraMasc];
		for (const gender of Gender.genders){ 
			let td = document.createElement("td");
			td.classList.add("NumericTableField");
			td.innerHTML = (100 * stats.shares[gender.toEnum()] / total).toFixed(0) + "%";
			td.style.backgroundColor = gender.toColor().scale(stats.shares[gender.toEnum()]/total).toString();
			td.style.color = "white";
			tr.appendChild(td);
		}
	}

	addQuantilesToList(ul: HTMLUListElement,quantiles: Quantiles){
		for (const key in quantiles) {
			let li = document.createElement("li");
			li.appendChild(frequencyToHTML(quantiles[key], key + ": "));
			ul.appendChild(li);
		}
	}

	renderQuantiles(stats: RecordStats) : HTMLTableCellElement {
		let tdAverageFrequency = document.createElement("td");
		let ulAverageFrequency = document.createElement("ul");
		ulAverageFrequency.classList.add("no-bullets");
		this.addQuantilesToList(ulAverageFrequency, stats.quantiles);
		let liAverageFrequency = document.createElement("li");
		liAverageFrequency.appendChild(frequencyToHTML(stats.average, "avg: "));
		ulAverageFrequency.appendChild(liAverageFrequency);
		tdAverageFrequency.appendChild(ulAverageFrequency);
		tdAverageFrequency.classList.add("NumericTableField");
		return tdAverageFrequency;
	}

	renderTaget(stats: RecordStats) : HTMLTableCellElement{
		let tdTargetFrequency = document.createElement("td");
		const targetFrequency = Number(this.targetFrequencySelector.value);
		tdTargetFrequency.appendChild(frequencyToHTML(targetFrequency));
		tdTargetFrequency.classList.add("NumericTableField");
		return tdTargetFrequency;
	}

	renderSelectorValue(value: string) : HTMLTableCellElement {
		let td = document.createElement("td");
		td.innerHTML = value;
		return td;
	}

	renderPlayback(audioURL: string): HTMLTableCellElement {
		const tdPlayback = document.createElement("td");
		const audio = document.createElement("audio");
		audio.setAttribute("controls", "");
		audio.src = audioURL;
		tdPlayback.appendChild(audio);
		if (this.autoPlaybackCheckbox.checked) {
			audio.play();
		}
		return tdPlayback;
	}

	renderControls(tr: HTMLTableRowElement, audioURL: string) : HTMLTableCellElement {
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

	renderNotes() : HTMLTableCellElement {
		const tdNote = document.createElement("td");
		let noteField = document.createElement("textarea");
		noteField.style.width = "100%";
		tdNote.appendChild(noteField);
		return tdNote;
	}


	renderRecording(stats: RecordStats, recording: Blob[]) : HTMLTableRowElement {
		const blob = new Blob(recording, { type: "audio/ogg; codecs=opus" });
		const audioURL = window.URL.createObjectURL(blob);

		let tr = document.createElement("tr");
		tr.appendChild(this.renderCounter());
		this.renderShares(tr, stats);
		tr.appendChild(this.renderQuantiles(stats));
		tr.appendChild(this.renderTaget(stats));
		tr.appendChild(this.renderSelectorValue(this.languageSelector.value));
		tr.appendChild(this.renderSelectorValue(this.textSelector.value));
		tr.appendChild(this.renderPlayback(audioURL));
		tr.appendChild(this.renderControls(tr, audioURL));
		tr.appendChild(this.renderNotes());

		return tr;
	}

	addRecording(stats: RecordStats, recording: Blob[]) {
		this.resultsTable.insertBefore(this.renderRecording(stats, recording), this.resultsTable.children[0]);
	}
}
