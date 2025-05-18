#pragma once

#include "utils.ts"
#include "user_interface.ts"

class TableManager {

	numRecordings : number = 0;
	resultsTable: HTMLElement;
	targetFrequencySelector: HTMLInputElement;
	languageSelector: HTMLSelectElement;
	textSelector: HTMLSelectElement;

	constructor(ui: UserInterface) {
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

	renderMetaCell() : HTMLTableCellElement {
		let td = document.createElement("td");
		let textNameSpan = document.createElement("span");
		textNameSpan.innerHTML = this.textSelector.value;
		td.appendChild(textNameSpan);
		td.appendChild(document.createElement("br"));
		let languageSpan = document.createElement("span");
		languageSpan.innerHTML = this.languageSelector.value;
		languageSpan.classList.add("FTVT-language");
		td.appendChild(languageSpan);
		td.appendChild(document.createElement("br"));
		let targetFrequencySpan = document.createElement("span");
		targetFrequencySpan.appendChild(document.createTextNode("🎯: "));
		targetFrequencySpan.appendChild(frequencyToHTML(Number(this.targetFrequencySelector.value)));
		td.appendChild(targetFrequencySpan)

		return td;
	}

	renderPlayback(recording: Blob[], tr: HTMLTableRowElement): HTMLTableCellElement {
		const blob = new Blob(recording, { type: "audio/ogg; codecs=opus" });
		const audioURL = window.URL.createObjectURL(blob);

		const td = document.createElement("td");
		// TODO: remove once links are turned to buttons:
		td.classList.add("ActionField");

		const audio = document.createElement("audio");
		audio.setAttribute("controls", "");
		audio.src = audioURL;
		td.appendChild(audio);
		
		td.appendChild(document.createElement("br"));

		const downloadLink = document.createElement("a");
		downloadLink.innerText = "⬇️";
		downloadLink.setAttribute("download", "voice_recording.ogg");
		downloadLink.classList.add("downloadLink");
		downloadLink.href = audioURL;
		td.appendChild(downloadLink);
		const removeButton = document.createElement("button");
		removeButton.innerHTML = "❌";
		removeButton.onclick = () => {
			tr.remove();
		};
		td.appendChild(removeButton);
		return td;
	}

	renderNotes() : HTMLTableCellElement {
		const tdNote = document.createElement("td");
		let noteField = document.createElement("textarea");
		noteField.style.width = "100%";
		tdNote.appendChild(noteField);
		return tdNote;
	}


	renderRecording(stats: RecordStats, recording: Blob[]) : HTMLTableRowElement {
		let tr = document.createElement("tr");
		tr.appendChild(this.renderCounter());
		this.renderShares(tr, stats);
		tr.appendChild(this.renderQuantiles(stats));
		tr.appendChild(this.renderMetaCell());
		tr.appendChild(this.renderPlayback(recording, tr));
		tr.appendChild(this.renderNotes());

		return tr;
	}

	addRecording(stats: RecordStats, recording: Blob[]) {
		this.resultsTable.insertBefore(this.renderRecording(stats, recording), this.resultsTable.children[0]);
	}
}
