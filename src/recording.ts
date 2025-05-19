
import {Note} from "./notes"
import {TableManager} from "./render_table"
import {Gender, Genders} from "./gender_pitch"
import {UserInterface} from "./user_interface"
import {toIndex, stableSum} from "./utils"

type GenderShare = {[key in Genders]: number};
export type Quantiles = {[key in string]: number};

export interface RecordStats {
	shares: GenderShare;
	average: number;
	quantiles: Quantiles;
}

export class Recorder {
	button : HTMLButtonElement;
	currentRecording : number[] | null = null;
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

	analyzeRecording(frequencyData: number[]): RecordStats {
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
			"shares": stats,
			"average": stableSum(frequencyData) / frequencyData.length,
			"quantiles": this.computeQuantiles(frequencyData)
		};
	}

	toggleRecording() {
		if (this.currentRecording === null) {
			this.currentRecording = [];
			this.button.style.backgroundColor = "red";
			if (this.mediaRecorder) {
				this.mediaRecording = [];
				this.mediaRecorder.start();
			}
		} else {
			let recording = this.currentRecording;
			this.currentRecording = null;
			this.button.style.backgroundColor = "green";

			if (this.mediaRecorder) {
				if (recording.length > 0) {
					this.mediaRecorder.ondataavailable = (e) => {
						this.mediaRecording.push(e.data);
						this.tableManager.addRecording(this.analyzeRecording(recording), this.mediaRecording);
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
