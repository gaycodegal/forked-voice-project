#pragma once

#include "frequencies.ts"
#include "threshold.ts"
#include "target_frequency.ts"
#include "gender_pitch.ts"
#include "user_interface.ts"
#include "recording.ts"

class Spectrum {
	maxDisplayFrequency : number = 1600;
	hertzPerBin    : number = 0;
	baseBand : BaseFrequencyIndices;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	threshold: Threshold;
	freqOut: HTMLOutputElement;
	recorder: Recorder;
	targetFrequencyManager: TargetFrequencyManager;

	constructor(ui: UserInterface, threshold: Threshold, recorder: Recorder, targetFrequencyManager: TargetFrequencyManager) {
		this.baseBand = new BaseFrequencyIndices(0,0);
		this.canvas = ui.canvas;
		const ctx = this.canvas.getContext("2d");
		if (ctx == null) {throw "No 2d-context in canvas element";}
		this.ctx = ctx;
		this.threshold = threshold;
		this.freqOut = ui.freqOut
		this.recorder = recorder;
		this.targetFrequencyManager= targetFrequencyManager;
		navigator.mediaDevices
			.getUserMedia({audio: true})
			.then(this.spectrum.bind(this))
			.then(recorder.setupRecorder.bind(recorder))
			.catch(console.log);
	}

	shiftLeft(n: Number) {
		this.ctx.globalCompositeOperation = "copy";
		this.ctx.drawImage(this.ctx.canvas,-n, 0);
		// reset back to normal for subsequent operations.
		this.ctx.globalCompositeOperation = "source-over"
	}

	writePixel(out: Uint8Array, i: number, col: Color) {
		const j = out.length - 4*i;
		out[j+0] = col.r;
		out[j+1] = col.g;
		out[j+2] = col.b;
		out[j+3] = col.alpha;
	}

	makeBackground() : ImageData {
		const height = this.ctx.canvas.height;
		let imageData = this.ctx.createImageData(1,height);
		let freq = 0;
		for (let i = 0; i < imageData.data.length; ++i) {
			this.writePixel(imageData.data as unknown as Uint8Array, i, frequencyToColor(freq));
			freq += this.hertzPerBin;
		}
		return imageData;
	}

	drawSpectrum(image: Uint8Array, data: Uint8Array) {
		const height = image.length / 4;
		for (let i = 0; i < data.length ; ++i) {
			let d = data[i]
			image[4*(height-i)-1] = Math.max(this.threshold.get(),d);
		}
	}

	markTargetFrequency(image: Uint8Array) {
		const targetFrequency = this.targetFrequencyManager.target();
		const index = Math.round(targetFrequency / this.hertzPerBin);
		this.writePixel(image, index, Color.TARGET_FREQUENCY_COLOR);
	}

	stateMainFrequency(freq: number | null) {
		if (freq  == null) {
			this.freqOut.innerHTML = "-<sub></sub>";
			this.freqOut.style.color = "white";
		} else {
			const note = Note.fromFrequency(freq);
			this.freqOut.innerHTML = (freq).toFixed(0) + " Hz (" +note.toString() + ")";
			this.freqOut.style.color = frequencyToColor(freq).toString();
		}
	}

	markMainFrequency(image: Uint8Array, data: Uint8Array) {
		const indexMaxFrequency = mainFrequencyIndex(data, this.baseBand);
		const maxAmplitude = data[indexMaxFrequency];
		if (maxAmplitude > this.threshold.get()) {
			const maxFrequency = indexMaxFrequency * this.hertzPerBin;
			this.writePixel(image, indexMaxFrequency-1, Color.MAIN_FREQUENCY_COLOR);
			this.writePixel(image, indexMaxFrequency,   Color.MAIN_FREQUENCY_COLOR);
			this.writePixel(image, indexMaxFrequency+1, Color.MAIN_FREQUENCY_COLOR);
			this.stateMainFrequency(maxFrequency);
			this.recorder.pushIfRecording(maxFrequency);
		} else {
			this.stateMainFrequency(null);
		}
	}

	renderAnalysis(data: Uint8Array): ImageData {
		const height = this.ctx.canvas.height;
		let imageData = this.makeBackground();
		this.drawSpectrum(imageData.data, data);
		this.markTargetFrequency(imageData.data);
		this.markMainFrequency(imageData.data, data);
		return imageData;
	}

	spectrum(stream: MediaStream): MediaStream {
		const audioCtx = new AudioContext();
		const analyser = audioCtx.createAnalyser();
		const maxFrequency = audioCtx.sampleRate / 2;
		analyser.fftSize=1024*32;
		analyser.smoothingTimeConstant = 0.0;
		audioCtx.createMediaStreamSource(stream).connect(analyser);
		this.hertzPerBin = maxFrequency / analyser.frequencyBinCount;

		const indexMaxHumanFrequency = Math.round(450 / this.hertzPerBin);
		const indexMinHumanFrequency = Math.round(85 / this.hertzPerBin);
		this.baseBand = new BaseFrequencyIndices(indexMinHumanFrequency, indexMaxHumanFrequency);


		this.canvas.width = document.body.clientWidth;
		document.body.addEventListener("resize", (event) => {
			this.canvas.width = document.body.clientWidth;
		});
		this.canvas.height = this.maxDisplayFrequency / this.hertzPerBin;

		function renderNext (spectrum: Spectrum, timestamp: number) {
			spectrum.shiftLeft(1);
			let data = new Uint8Array(spectrum.canvas.height);
			analyser.getByteFrequencyData(data);
			spectrum.ctx.putImageData(spectrum.renderAnalysis(data), spectrum.canvas.width-1, 0);
			window.requestAnimationFrame((arg) => {renderNext(spectrum, arg);});
		}
		window.requestAnimationFrame((arg) => {renderNext(this, arg);});

		return stream;
	};
}
