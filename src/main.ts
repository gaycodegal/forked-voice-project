const texts_table : {[language: string]: {[title: string]: string}} =
#include "texts.json"

const harmonic_detection_factor = 0.5;
const max_display_freq = 1600;

let min_human_freq_index = 0;
let max_human_freq_index = 0;
let hertz_per_bin = 0;
let current_threshold = 0;
let current_recording : number[] | null = null;
let record_counter = 0;

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
		img[4*(height-i)-1] = Math.max(current_threshold,d);
	}
}

function max_index(data: any) : number {
	if (data.length < 1) {
		throw "max_index must only be called with non-empty arrays";
	}
	let imax = 0;
	let vmax = data[0];
	for (let i = 1; i < data.length ; ++i) {
		let v = data[i]
		if (v > vmax) {
			imax = i;
			vmax = v;
		}
	}
	return imax;
}

function is_harmonic(data: any, index: number) : boolean {
	const n_low = Math.floor(index/min_human_freq_index);
	const n_high = Math.ceil(index/max_human_freq_index);
	let is_harmonic = false;
	for (let harmonic = n_high+1; harmonic <= n_low; ++harmonic) {
		if (data[Math.round(index/harmonic)] > data[index] * harmonic_detection_factor) {
			return true;
		}
	}
	return false;
}

function main_freq_index(data: any) : number {
	if (data.length < 1) {
		throw "max_index must only be called with non-empty arrays";
	}
	//return Math.round(hertz_per_bin/max_display_freq);
	let imax = 0;
	let vmax = data[0];
	for (let i = 1; i < data.length ; ++i) {
		let v = data[i]
		if (v > vmax && !is_harmonic(data, i)) {
			imax = i;
			vmax = v;
		}
	}
	return imax;
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
	//const imax = max_index(data);
	const white = new color(255,255,255);
	const imax = main_freq_index(data);
	const max_amplitude = data[imax];
	if (max_amplitude > current_threshold) {
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

	max_human_freq_index = Math.round(450 / hertz_per_bin);
	min_human_freq_index = Math.round(85 / hertz_per_bin);

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

type RecordStats = {[key in Gender]: number};

function analyze_recording(freq_data: number[]): RecordStats {
	let stats : RecordStats = {
		[Gender.UltraFem]: 0,
		[Gender.Fem]: 0,
		[Gender.Enby]: 0,
		[Gender.Masc]: 0,
		[Gender.InfraMasc]: 0
	};
	for (const freq of freq_data) {
		stats[frequency_to_gender(freq)] += 1;
		console.log(freq);
	}
	return stats;
}

function show_recording_results(stats: RecordStats) {
	let results_table = document.getElementById("RecordResultTableBody") as HTMLElement;
	let total = stats[Gender.UltraFem] + stats[Gender.Fem] + stats[Gender.Enby] + stats[Gender.Masc] + stats[Gender.InfraMasc];
	let tr = document.createElement("tr");

	let td0 = document.createElement("td");
	td0.innerHTML = "#" + (++record_counter).toFixed(0);
	tr.appendChild(td0);

	for (const gender of [Gender.Fem, Gender.Masc, Gender.UltraFem, Gender.InfraMasc, Gender.Enby]) {
		let td = document.createElement("td");
		td.innerHTML = (100 * stats[gender] / total).toFixed(0) + "%";
		tr.appendChild(td);
	}

	results_table.appendChild(tr);
}

function toggle_recording(toggle_element: HTMLInputElement) {
	if (current_recording === null) {
		current_recording = [];
		toggle_element.style.color = "red";
		toggle_element.innerText="Stop Recording"
	} else {
		let recording = current_recording;
		current_recording = null;
		toggle_element.style.color = "green";
		toggle_element.innerText="Start Recording";

		if (recording.length > 0) {
			show_recording_results(analyze_recording(recording));
		}
	}
}

function remove_options(element: HTMLSelectElement) {
	//element.innerHTML = "";
	var i, L = element.options.length - 1;
	for(i = L; i >= 0; i--) {
		element.remove(i);
	}
}

function setup_languages() {
	let language_selector = document.getElementById("LanguageSelector") as HTMLSelectElement;
	for(let lang in texts_table) {
		language_selector.add(new Option(lang));
	}
	on_language_select();
}

function get_selected_text() {
	let language_selector = document.getElementById("LanguageSelector") as HTMLSelectElement;
	let text_selector = document.getElementById("TextSelector") as HTMLSelectElement;
	let text_display = document.getElementById("TextDisplay") as HTMLDivElement;
	const lang = language_selector.value;
	let text = text_selector.value;
	if (lang in texts_table && text in texts_table[lang]){
		text_display.innerText = texts_table[lang][text];
	} else {
		text_display.innerText = "";
	}
}

function on_language_select() {
	const language_selector = document.getElementById("LanguageSelector") as HTMLSelectElement;
	const language = language_selector.value;
	let text_selector = document.getElementById("TextSelector") as HTMLSelectElement;
	remove_options(text_selector);
	for(let key in texts_table[language]) {
		text_selector.add(new Option(key));
	}
}

window.onload =
(() => {
	console.log(texts_table);
	let threshold_selector = document.getElementById("VolumeThresholdSelector") as HTMLInputElement;
	current_threshold = Number(threshold_selector.value);
	threshold_selector.onchange = (event) => {
		current_threshold = Number(threshold_selector.value);
	};

	let toggle_record_button = document.getElementById("ToggleRecordButton") as HTMLInputElement;
	toggle_record_button.onclick = (event) => {
		toggle_recording(toggle_record_button);
	}

	setup_languages();
	get_selected_text();
	let language_selector = document.getElementById("LanguageSelector") as HTMLSelectElement;
	language_selector.onchange = (event) => {
		on_language_select();
		get_selected_text();
	}
	let text_selector = document.getElementById("TextSelector") as HTMLSelectElement;
	text_selector.onchange = (event) => {
		get_selected_text();
	}

	navigator.mediaDevices.getUserMedia({audio: true}).then(spectrum).catch(console.log);
});

