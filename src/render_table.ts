import {stableSum} from "./utils"
import {UserInterface} from "./user_interface"
import {RecordStats, Quantiles} from "./recording"
import {Gender, Genders} from "./gender_pitch"
import {frequencyToHTML} from "./notes"
import {TextDisplayElement} from "./texts"
import {NoteDisplay} from "./note_display"
import {Settings} from "./settings"

export class TableManager {

	numRecordings : number = 0;
	resultsTable: HTMLElement;
	textDisplay: TextDisplayElement;
	targetFrequencySelector: HTMLInputElement;
	registerAudioCallbacks: {(e: HTMLAudioElement): void;}[];
	settings: Settings;

	constructor(ui: UserInterface) {
		this.resultsTable = ui.resultsTable;
		this.textDisplay = ui.textDisplay;
		this.targetFrequencySelector = ui.targetFrequencySelector;
		this.registerAudioCallbacks = [];
		this.settings = ui.settings;
	}

	addAudioRegistrationFunction(f: {(e: HTMLAudioElement): void}) {
		this.registerAudioCallbacks.push(f);
	}
	registerAudio(e: HTMLAudioElement) {
		for (const f of this.registerAudioCallbacks) {
			f(e);
		}
	}

	renderCounter() : HTMLTableCellElement {
		let td = document.createElement("td");
		td.innerHTML = "#" + this.settings.newRecordingId();
		return td;
	}

	renderShares(tr: HTMLTableRowElement, stats: RecordStats) {
		const total = stats.shares[Genders.UltraFem] + stats.shares[Genders.Fem] + stats.shares[Genders.Enby] + stats.shares[Genders.Masc] + stats.shares[Genders.InfraMasc];
		for (const gender of Gender.genders){ 
			let td = document.createElement("td");
			td.classList.add("NumericTableField");
			if (total == 0) {
				td.innerHTML = "-";
				td.style.backgroundColor = "black";
			} else {
				td.innerHTML = (100 * stats.shares[gender.toEnum()] / total).toFixed(0) + "%";
				td.style.backgroundColor = gender.toColor().scale(stats.shares[gender.toEnum()]/total).toString();
			}
			td.style.color = "white";
			tr.appendChild(td);
		}
	}

	addQuantilesToList(ul: HTMLUListElement,quantiles: Quantiles){
		for (const key in quantiles) {
			let li = document.createElement("li");
			li.appendChild((new NoteDisplay(quantiles[key], key)).getRoot())
			ul.appendChild(li);
		}
	}

	renderQuantiles(stats: RecordStats) : HTMLTableCellElement {
		let tdAverageFrequency = document.createElement("td");
		let ulAverageFrequency = document.createElement("ul");
		ulAverageFrequency.classList.add("no-bullets");
		this.addQuantilesToList(ulAverageFrequency, stats.quantiles);
		let liAverageFrequency = document.createElement("li");
		liAverageFrequency.appendChild((new NoteDisplay(stats.average, "avg")).getRoot())
		ulAverageFrequency.appendChild(liAverageFrequency);
		tdAverageFrequency.appendChild(ulAverageFrequency);
		tdAverageFrequency.classList.add("NumericTableField");
		return tdAverageFrequency;
	}

	renderMetaCell(stats: RecordStats) : HTMLTableCellElement {
		let td = document.createElement("td");
		let textNameSpan = document.createElement("span");
		textNameSpan.innerHTML = stats.textName;
		td.appendChild(textNameSpan);

		td.appendChild(document.createElement("br"));
		let languageSpan = document.createElement("span");
		languageSpan.innerHTML = stats.language;
		languageSpan.classList.add("FTVT-language");
		td.appendChild(languageSpan);
		
		td.appendChild(document.createElement("br"));
		let targetFrequencySpan = document.createElement("span");
		targetFrequencySpan.appendChild((new NoteDisplay(stats.target, "🎯")).getRoot())
		td.appendChild(targetFrequencySpan)

		td.appendChild(document.createElement("br"));
		td.appendChild(document.createTextNode("🕰️: "));
		let startTimeSpan = document.createElement("time");
		startTimeSpan.innerText = stats.startTime.toTimeString().substr(0, 8);
		startTimeSpan.dateTime = stats.startTime.toISOString();
		td.appendChild(startTimeSpan);
		td.appendChild(document.createTextNode(" - "));
		let endTimeSpan = document.createElement("time");
		endTimeSpan.innerText = stats.endTime.toTimeString().substr(0, 8);
		endTimeSpan.dateTime = stats.endTime.toISOString();
		td.appendChild(endTimeSpan);
		td.appendChild(document.createElement("br"));
		td.appendChild(document.createTextNode("📅: " + stats.startTime.toISOString().substr(0, 10)));

		return td;
	}

	renderPlayback(recording: Blob[], tr: HTMLTableRowElement): [HTMLTableCellElement, HTMLAudioElement] {
		const blob = new Blob(recording, { type: "audio/ogg; codecs=opus" });
		const audioURL = window.URL.createObjectURL(blob);

		const td = document.createElement("td");
		td.classList.add("ActionField");

		const audio = document.createElement("audio");
		audio.setAttribute("controls", "");
		audio.src = audioURL;
		this.registerAudio(audio);
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
		return [td, audio];
	}

	renderNotes() : HTMLTableCellElement {
		const tdNote = document.createElement("td");
		let noteField = document.createElement("textarea");
		noteField.title = "personal notes";
		noteField.placeholder = "Space for your own notes…";
		tdNote.appendChild(noteField);
		return tdNote;
	}


	renderRecording(stats: RecordStats, recording: Blob[]) : [HTMLTableRowElement, HTMLAudioElement] {
		let tr = document.createElement("tr");
		tr.appendChild(this.renderCounter());
		this.renderShares(tr, stats);
		tr.appendChild(this.renderQuantiles(stats));
		tr.appendChild(this.renderMetaCell(stats));
		const [playbackCell, audio] = this.renderPlayback(recording, tr)
		tr.appendChild(playbackCell);
		tr.appendChild(this.renderNotes());

		return [tr, audio];
	}

	addRecording(stats: RecordStats, recording: Blob[]) {
		const [tableRow, audio] = this.renderRecording(stats, recording);
		this.resultsTable.insertBefore(tableRow, this.resultsTable.children[0]);
		// TODO: split of into addNewRecording
		if (this.settings.autoplayRecording()) {
			audio.addEventListener("canplaythrough", (event) => {
				audio.play();
			}, {once: true});
		}
		this.settings.db.addRecording(stats, recording);
	}
}
