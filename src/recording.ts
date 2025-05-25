
import {Note} from "./notes"
import {TableManager} from "./render_table"
import {Gender, Genders} from "./gender_pitch"
import {UserInterface} from "./user_interface"
import {toIndex, stableSum} from "./utils"
import {TextDisplayElement} from "./texts"
import {Settings} from "./settings"

type GenderShare = {[key in Genders]: number};
export type Quantiles = {[key in string]: number};

export interface RecordStats {
	id: number;
	shares: GenderShare;
	average: number;
	quantiles: Quantiles;
	target: number;
	language: string;
	textName: string;
	startTime: Date;
	endTime: Date;
}

export class Recorder {
	button : HTMLButtonElement;
	currentRecording : number[] | null = null;
	mediaRecorder: MediaRecorder;
	mediaRecording: Blob|null = null;
	tableManager: TableManager;
	textDisplay: TextDisplayElement;
	targetFrequencySelector: HTMLInputElement;
	startTime: Date;
	endTime: Date;
	settings: Settings;

	constructor(mediaStream: MediaStream, ui: UserInterface, tableManager: TableManager) {
		this.button = ui.canvasControls.toggleRecordButton;
		this.tableManager = tableManager;
		this.settings = ui.settings;

		this.textDisplay = ui.textDisplay;
		this.targetFrequencySelector = ui.targetFrequencySelector;

		// just as placeholders:
		this.startTime = new Date(Date.now());
		this.endTime= this.startTime;

		this.button.addEventListener("click", (event) => {
			this.toggleRecording();
		});
		this.mediaRecorder = new MediaRecorder(mediaStream);
	}

	computeQuantiles(unsortedData: number[]): Quantiles {
		let data = unsortedData.sort((a,b)=>{return a-b;});
		return {
			 "5%": data[toIndex(0.05, data.length)],
			"10%": data[toIndex(0.10, data.length)],
			"20%": data[toIndex(0.20, data.length)],
			"50%": data[toIndex(0.50, data.length)],
			"80%": data[toIndex(0.80, data.length)],
			"90%": data[toIndex(0.90, data.length)],
			"95%": data[toIndex(0.95, data.length)],
		};
	}

	pushIfRecording(maxFreq: number) {
		this.currentRecording?.push(maxFreq);
	}

	collectStats(frequencyData: number[]): RecordStats {
		let stats : GenderShare = {
			[Genders.UltraFem]: 0,
			[Genders.Fem]: 0,
			[Genders.Enby]: 0,
			[Genders.Masc]: 0,
			[Genders.InfraMasc]: 0
		};
		for (const freq of frequencyData) {
			stats[Gender.fromFrequency(freq).toEnum()] += 1;
		}
		const average =  stableSum(frequencyData) / frequencyData.length;
		return {
			"id": this.settings.newRecordingId(),
			"shares": stats,
			"average": stableSum(frequencyData) / frequencyData.length,
			"quantiles": this.computeQuantiles(frequencyData),
			"target": Number(this.targetFrequencySelector.value),
			"language": this.textDisplay.getSelectedLanguage(),
			"textName": this.textDisplay.getSelectedTextName(),
			"startTime": this.startTime,
			"endTime": this.endTime
		};
	}

	startRecording() {
		this.currentRecording = [];
		this.button.style.backgroundColor = "red";
		this.startTime = new Date(Date.now());
		if (this.mediaRecorder) {
			this.mediaRecording = null;
			this.mediaRecorder.start();
		}
	}
	endRecording() {
		let recording = this.currentRecording;
		if (recording == null) {
			recording = [];
		}
		this.currentRecording = null;
		this.button.style.backgroundColor = "green";
		this.endTime = new Date(Date.now());

		if (this.mediaRecorder) {
			this.mediaRecorder.addEventListener("dataavailable", (e) => {
				this.mediaRecording = e.data;
				this.tableManager.addRecording(this.collectStats(recording), this.mediaRecording);
			}, {once: true});
			this.mediaRecorder.stop();
		}
	}

	toggleRecording() {
		if (this.currentRecording === null) {
			this.startRecording();
		} else {
			this.endRecording();
		}
	}

}
