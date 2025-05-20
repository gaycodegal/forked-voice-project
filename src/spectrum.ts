import {BaseFrequencyIndices} from "./frequencies"
import {TargetFrequencyManager} from "./target_frequency"
import {frequencyToColor} from "./gender_pitch"
import {UserInterface} from "./user_interface"
import {Recorder} from "./recording"
import {Color} from "./color"
import {mainFrequencyIndex} from "./frequencies"
import {Note} from "./notes"
import {TableManager} from "./render_table"
import {CanvasControls} from "./canvas_controls"

function getMediaStream(e: HTMLAudioElement): MediaStream {
	// @ts-ignore
	if (e.mozCaptureStream) {
		// @ts-ignore
		return e.mozCaptureStream();
	} else {
		// @ts-ignore
		return e.captureStream();
	}
}

export class Spectrum {
	maxDisplayFrequency : number = 1600;
	hertzPerBin    : number = 0;
	playbackInput : boolean = true;
	baseBand : BaseFrequencyIndices;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	canvasControls: CanvasControls;
	recorder: Recorder;
	targetFrequencyManager: TargetFrequencyManager;
	mainAnalyser: AnalyserNode;
	playingAudioElement: HTMLAudioElement|null=null;
	audioSink: HTMLAudioElement;
	canvasHeight: number;

	constructor(mediaStream: MediaStream, ui: UserInterface, tableManager: TableManager,recorder: Recorder, targetFrequencyManager: TargetFrequencyManager) {
		this.baseBand = new BaseFrequencyIndices(0,0);
		this.canvas = ui.canvas;
		const ctx = this.canvas.getContext("2d");
		if (ctx == null) {throw "No 2d-context in canvas element";}
		this.ctx = ctx;
		this.canvasControls = ui.canvasControls;
		this.canvasControls.togglePlayButton.addEventListener("click", (event) => {
			this.toggleMainInputPlayback();
		});
		this.recorder = recorder;
		this.targetFrequencyManager= targetFrequencyManager;
		this.audioSink = new Audio();

		this.canvas.width = document.body.clientWidth;
		new ResizeObserver((entries) => {
			this.canvas.width = document.body.clientWidth;
		}).observe(document.body);
		
		let [analyser, hertzPerBin] = this.createAnalyser(mediaStream);
		this.mainAnalyser = analyser;
		this.hertzPerBin = hertzPerBin;

		const indexMaxHumanFrequency = Math.round(450 / this.hertzPerBin);
		const indexMinHumanFrequency = Math.round(85 / this.hertzPerBin);
		this.baseBand = new BaseFrequencyIndices(indexMinHumanFrequency, indexMaxHumanFrequency);
		this.canvasHeight = this.maxDisplayFrequency / this.hertzPerBin;
		this.canvas.height = this.canvasHeight;
		this.canvas.style.height = this.canvasHeight.toString();
		let data = new Uint8Array(this.canvas.height);
		setInterval(() => {
			if (this.playbackInput) {
				analyser.getByteFrequencyData(data);
				this.shiftLeft(1);
				this.ctx.putImageData(this.renderAnalysis(data), this.canvas.width-1, 0);
			}
		}, 20);
		tableManager.addAudioRegistrationFunction((e) => {this.registerAudioElement(e);});
	}

	registerAudioElement(e: HTMLAudioElement) {
		let intervalId = 0;
		e.addEventListener("play", (event) => {
			this.playingAudioElement?.pause();
			this.playingAudioElement = e;
			let stream = getMediaStream(e);
			let [analyser, _] = this.createAnalyser(stream);
			this.audioSink.srcObject=stream;
			this.audioSink.play();
			this.stopMainInputPlayback();
			this.drawVerticalLine();
			let data = new Uint8Array(this.canvas.height);
			intervalId = setInterval(() => {
				analyser.getByteFrequencyData(data);
				this.shiftLeft(1);
				this.ctx.putImageData(this.renderAnalysis(data), this.canvas.width-1, 0);
			}, 20);
		});
		e.addEventListener('pause', (event) => {
			clearInterval(intervalId);
			this.playingAudioElement = null;
			this.audioSink.pause();
			this.startMainInputPlayback();
		});
	}

	drawVerticalLine() {
		const height = this.ctx.canvas.height;
		const width = this.ctx.canvas.width;
		this.shiftLeft(5);
		this.ctx.fillStyle= Color.MAIN_FREQUENCY_COLOR.toString();
		this.ctx.fillRect(width-5, 0, 5, height);
	}

	stopMainInputPlayback() {
		this.playbackInput = false;
	}
	startMainInputPlayback() {
		this.drawVerticalLine();
		this.playbackInput = true;
	}
	toggleMainInputPlayback() {
		if (this.playbackInput) {
			this.stopMainInputPlayback();
		} else {
			this.startMainInputPlayback();
		}
	}

	shiftLeft(n: Number) {
		this.ctx.globalCompositeOperation = "copy";
		this.ctx.drawImage(this.ctx.canvas,-n, 0);
		// reset back to normal for subsequent operations.
		this.ctx.globalCompositeOperation = "source-over"
	}

	writePixel(out: Uint8ClampedArray, i: number, col: Color) {
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
			this.writePixel(imageData.data, i, frequencyToColor(freq));
			freq += this.hertzPerBin;
		}
		return imageData;
	}

	drawSpectrum(image: Uint8ClampedArray, data: Uint8Array) {
		const height = image.length / 4;
		for (let i = 0; i < data.length ; ++i) {
			let d = data[i]
			image[4*(height-i)-1] = Math.max(this.canvasControls.getThreshold(),d);
		}
	}

	markTargetFrequency(image: Uint8ClampedArray) {
		const targetFrequency = this.targetFrequencyManager.target();
		const index = Math.round(targetFrequency / this.hertzPerBin);
		this.writePixel(image, index, Color.TARGET_FREQUENCY_COLOR);
	}

	markMainFrequency(image: Uint8ClampedArray, data: Uint8Array) {
		const indexMaxFrequency = mainFrequencyIndex(data, this.baseBand);
		const maxAmplitude = data[indexMaxFrequency];
		if (maxAmplitude > this.canvasControls.getThreshold()) {
			const maxFrequency = indexMaxFrequency * this.hertzPerBin;
			this.writePixel(image, indexMaxFrequency-1, Color.MAIN_FREQUENCY_COLOR);
			this.writePixel(image, indexMaxFrequency,   Color.MAIN_FREQUENCY_COLOR);
			this.writePixel(image, indexMaxFrequency+1, Color.MAIN_FREQUENCY_COLOR);
			this.canvasControls.stateMainFrequency(maxFrequency);
			this.recorder.pushIfRecording(maxFrequency);
		} else {
			this.canvasControls.stateMainFrequency(null);
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

	createAnalyser(stream: MediaStream): [AnalyserNode, number] {
		const audioCtx = new AudioContext();
		const analyser = audioCtx.createAnalyser();
		const maxFrequency = audioCtx.sampleRate / 2;
		analyser.fftSize=1024*32;
		analyser.smoothingTimeConstant = 0.0;
		audioCtx.createMediaStreamSource(stream).connect(analyser);
		const hertzPerBin = maxFrequency / analyser.frequencyBinCount;
		return [analyser, hertzPerBin];
	}
}
