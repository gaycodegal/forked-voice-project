#pragma once

#include "notes.ts"
#include "render_table.ts"

type GenderShare = {[key in Genders]: number};
type Quantiles = {[key in string]: number};

interface RecordStats {
	shares: GenderShare;
	average: number;
	quantiles: Quantiles;
}

class Recorder {
	button : HTMLButtonElement;
	current_recording : number[] | null = null;
	mediaRecorder: MediaRecorder | null = null;
	mediaRecording: Blob[] = [];
	tableManager: TableManager;

	constructor(ui: UserInterface, tableManager: TableManager) {
		this.button = ui.toggleRecordButton;
		this.tableManager = tableManager;
		this.button.addEventListener("click", (event) => {
			this.toggleRecording();
		});
	}

	computeQuantiles(unsorted_data: number[]): Quantiles {
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

	pushIfRecording(maxFreq: number) {
		this.current_recording?.push(maxFreq);
	}

	analyze_recording(freq_data: number[]): RecordStats {
		let stats : GenderShare = {
			[Genders.UltraFem]: 0,
			[Genders.Fem]: 0,
			[Genders.Enby]: 0,
			[Genders.Masc]: 0,
			[Genders.InfraMasc]: 0
		};
		for (const freq of freq_data) {
			stats[Gender.fromFrequency(freq).toEnum()] += 1;
		}
		const average =  stable_sum(freq_data) / freq_data.length;
		return {
			"shares": stats,
			"average": stable_sum(freq_data) / freq_data.length,
			"quantiles": this.computeQuantiles(freq_data)
		};
	}

	toggleRecording() {
		if (this.current_recording === null) {
			this.current_recording = [];
			this.button.style.color = "red";
			this.button.innerText="Stop Recording"
			if (this.mediaRecorder) {
				this.mediaRecording = [];
				this.mediaRecorder.start();
			}
		} else {
			let recording = this.current_recording;
			this.current_recording = null;
			this.button.style.color = "green";
			this.button.innerText="Start Recording";

			if (this.mediaRecorder) {
				if (recording.length > 0) {
					this.mediaRecorder.ondataavailable = (e) => {
						this.mediaRecording.push(e.data);
						this.tableManager.addRecording(this.analyze_recording(recording), this.mediaRecording);
					}
				}
				this.mediaRecorder.stop();
			}
		}
	}

	setupRecorder(stream: MediaStream): MediaStream {
		this.mediaRecorder = new MediaRecorder(stream);
		return stream;
	}
}
