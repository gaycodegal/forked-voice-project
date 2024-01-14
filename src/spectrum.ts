#pragma once

#include "frequencies.ts"
#include "threshold.ts"

const max_display_freq = 1600;

let hertz_per_bin = 0;
let frequency_base_band = new BaseFrequencyIndices(0,0);


function shift_left(ctx: CanvasRenderingContext2D, n: Number) {
	ctx.globalCompositeOperation = "copy";
	ctx.drawImage(ctx.canvas,-n, 0);
	// reset back to normal for subsequent operations.
	ctx.globalCompositeOperation = "source-over"
}

function write_pixel(out: Uint8Array, i: number, col: color) {
	const j = out.length - 4*i;
	out[j+0] = col.r;
	out[j+1] = col.g;
	out[j+2] = col.b;
	out[j+3] = col.alpha;
}

class color {
	constructor(r: number, g: number, b:number, alpha: number = 255) {
		this.r =r;
		this.g =g;
		this.b =b;
		this.alpha =alpha;
	}
	r: number;
	g: number;
	b: number;
	alpha: number;

	to_str(): string {
		return "rgba(" + String(this.r) + ", " + String(this.g) + ", " + String(this.b) + ", " + String(this.alpha) + ")";
	}
};


const enum Gender {
	InfraMasc,
	Masc,
	Enby,
	Fem,
	UltraFem,
};

const genders = [Gender.InfraMasc, Gender.Masc, Gender.Enby, Gender.Fem, Gender.UltraFem];

function frequency_to_gender(freq: number): Gender {
	if (freq < 85) {
		return Gender.InfraMasc;
	} else if (freq <= 155) {
		return Gender.Masc;
	} else if (freq < 165) {
		return Gender.Enby;
	} else if (freq <=255) {
		return Gender.Fem;
	} else {
		return Gender.UltraFem;
	}
}

function gender_to_color(g: Gender): color {
	switch(g) {
		case Gender.InfraMasc: return new color(0,128,128);
		case Gender.Masc: return new color(64,64,255);
		case Gender.Enby: return new color(64,255,64);
		case Gender.Fem: return new color(255,64,64);
		case Gender.UltraFem: return new color(128,128,0);
	}
}

function frequency_to_color(freq: number) : color {
	return gender_to_color(frequency_to_gender(freq));
}

function make_background(ctx: CanvasRenderingContext2D) : ImageData {
	const height = ctx.canvas.height;
	let imgData = ctx.createImageData(1,height);
	let freq = 0;
	for (let i = 0; i < imgData.data.length; ++i) {
		write_pixel(imgData.data as unknown as Uint8Array, i, frequency_to_color(freq));
		freq += hertz_per_bin;
	}
	return imgData;
}

function draw_specturm(img: Uint8Array, data: Uint8Array) {
	const height = img.length / 4;
	for (let i = 0; i < data.length ; ++i) {
		let d = data[i]
		img[4*(height-i)-1] = Math.max(get_current_threshold(),d);
	}
}

function state_main_frequency(freq: number | null) {
	const freq_out = document.getElementById("freq-out") as HTMLElement;
	if (freq  == null) {
		freq_out.innerText = "-";
		freq_out.style.color = "white";
	} else {
		freq_out.innerText = (freq).toFixed(0) + " Hz";
		freq_out.style.color = frequency_to_color(freq).to_str();
	}
}

function mark_main_freq(img: Uint8Array, data: Uint8Array) {
	const white = new color(255,255,255);
	const imax = main_freq_index(data, frequency_base_band);
	const max_amplitude = data[imax];
	if (max_amplitude > get_current_threshold()) {
		const max_freq = imax * hertz_per_bin;
		write_pixel(img, imax-1, white);
		write_pixel(img, imax,   white);
		write_pixel(img, imax+1, white);
		state_main_frequency(max_freq);
		if (current_recording != null) {
			current_recording.push(max_freq);
		}
	} else {
		state_main_frequency(null);
	}
}

function render_analysis(ctx: CanvasRenderingContext2D, data: Uint8Array, ): ImageData {
	const height = ctx.canvas.height;
	let imgData = make_background(ctx);
	draw_specturm(imgData.data as unknown as Uint8Array, data);
	mark_main_freq(imgData.data as unknown as Uint8Array, data);
	return imgData;
}

function spectrum(stream: MediaStream) {
	const audioCtx = new AudioContext();
	const analyser = audioCtx.createAnalyser();
	const max_freq = audioCtx.sampleRate / 2;
	analyser.fftSize=1024*32;
	analyser.smoothingTimeConstant = 0.0;
	audioCtx.createMediaStreamSource(stream).connect(analyser);
	hertz_per_bin = max_freq / analyser.frequencyBinCount;

	const max_human_freq_index = Math.round(450 / hertz_per_bin);
	const min_human_freq_index = Math.round(85 / hertz_per_bin);
	frequency_base_band = new BaseFrequencyIndices(min_human_freq_index, max_human_freq_index);


	const canvas = document.getElementById("canvas") as HTMLCanvasElement;
	if (canvas == null) {throw "Missing canvas-element in document";}
	canvas.width = window.innerWidth - 20;
	canvas.height = max_display_freq / hertz_per_bin;
	const ctx = canvas.getContext("2d");
	if (ctx == null) {throw "No 2d-context in canvas element";}
	const data = new Uint8Array(canvas.height);


	setInterval(() => {
		shift_left(ctx, 1);
		analyser.getByteFrequencyData(data);
		ctx.putImageData(render_analysis(ctx, data), canvas.width-1, 0);
	}, 1);
};

function setup_spectrum() {
	navigator.mediaDevices.getUserMedia({audio: true}).then(spectrum).catch(console.log);
}
