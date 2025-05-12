#pragma once

#include "frequencies.ts"
#include "threshold.ts"
#include "target_frequency.ts"
#include "gender_pitch.ts"
#include "user_interface.ts"
#include "recording.ts"

class Spectrum {
	max_display_freq : number = 1600;
	hertz_per_bin    : number = 0;
	frequency_base_band : BaseFrequencyIndices;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	threshold: Threshold;
	freqOut: HTMLOutputElement;
	recorder: Recorder;

	constructor(ui: UserInterface, threshold: Threshold, recorder: Recorder) {
		this.frequency_base_band = new BaseFrequencyIndices(0,0);
		this.canvas = ui.canvas;
		const ctx = this.canvas.getContext("2d");
		if (ctx == null) {throw "No 2d-context in canvas element";}
		this.ctx = ctx;
		this.threshold = threshold;
		this.freqOut = ui.freqOut
		this.recorder = recorder;
		navigator.mediaDevices
			.getUserMedia({audio: true})
			.then(this.spectrum.bind(this))
			.then(recorder.setupRecorder.bind(recorder))
			.catch(console.log);
	}

	shift_left(n: Number) {
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

	make_background() : ImageData {
		const height = this.ctx.canvas.height;
		let imgData = this.ctx.createImageData(1,height);
		let freq = 0;
		for (let i = 0; i < imgData.data.length; ++i) {
			this.writePixel(imgData.data as unknown as Uint8Array, i, frequency_to_color(freq));
			freq += this.hertz_per_bin;
		}
		return imgData;
	}

	draw_specturm(img: Uint8Array, data: Uint8Array) {
		const height = img.length / 4;
		for (let i = 0; i < data.length ; ++i) {
			let d = data[i]
			img[4*(height-i)-1] = Math.max(this.threshold.get(),d);
		}
	}

	mark_target_frequency(img: Uint8Array) {
		const target_frequency = get_target_frequency();
		const index = Math.round(target_frequency / this.hertz_per_bin);
		this.writePixel(img, index, Color.target_freq_color);
	}

	state_main_frequency(freq: number | null) {
		if (freq  == null) {
			this.freqOut.innerHTML = "-<sub></sub>";
			this.freqOut.style.color = "white";
		} else {
			const note = frequency_to_note(freq);
			this.freqOut.innerHTML= (freq).toFixed(0) + " Hz (" +note_to_string(note) + ")";
			this.freqOut.style.color = frequency_to_color(freq).to_str();
		}
	}

	mark_main_freq(img: Uint8Array, data: Uint8Array) {
		const imax = main_freq_index(data, this.frequency_base_band);
		const max_amplitude = data[imax];
		if (max_amplitude > this.threshold.get()) {
			const max_freq = imax * this.hertz_per_bin;
			this.writePixel(img, imax-1, Color.main_freq_color);
			this.writePixel(img, imax,   Color.main_freq_color);
			this.writePixel(img, imax+1, Color.main_freq_color);
			this.state_main_frequency(max_freq);
			this.recorder.pushIfRecording(max_freq);
		} else {
			this.state_main_frequency(null);
		}
	}

	render_analysis(data: Uint8Array): ImageData {
		const height = this.ctx.canvas.height;
		let imgData = this.make_background();
		this.draw_specturm(imgData.data, data);
		this.mark_target_frequency(imgData.data);
		this.mark_main_freq(imgData.data, data);
		return imgData;
	}

	spectrum(stream: MediaStream): MediaStream {
		const audioCtx = new AudioContext();
		const analyser = audioCtx.createAnalyser();
		const max_freq = audioCtx.sampleRate / 2;
		analyser.fftSize=1024*32;
		analyser.smoothingTimeConstant = 0.0;
		audioCtx.createMediaStreamSource(stream).connect(analyser);
		this.hertz_per_bin = max_freq / analyser.frequencyBinCount;

		const max_human_freq_index = Math.round(450 / this.hertz_per_bin);
		const min_human_freq_index = Math.round(85 / this.hertz_per_bin);
		this.frequency_base_band = new BaseFrequencyIndices(min_human_freq_index, max_human_freq_index);


		// TODO: move to UI
		this.canvas.width = document.body.clientWidth - 36;
		this.canvas.height = this.max_display_freq / this.hertz_per_bin;
		const data = new Uint8Array(this.canvas.height);


		setInterval(() => {
			this.shift_left(1);
			analyser.getByteFrequencyData(data);
			this.ctx.putImageData(this.render_analysis(data), this.canvas.width-1, 0);
		}, 1);

		return stream;
	};

}
