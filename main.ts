
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
	UltraMasc,
	Masc,
	Enby,
	Fem,
	InfraFem,
};

const genders = [Gender.UltraMasc, Gender.Masc, Gender.Enby, Gender.Fem, Gender.InfraFem];

function frequency_to_gender(freq: number): Gender {
	if (freq < 85) {
		return Gender.UltraMasc;
	} else if (freq <= 155) {
		return Gender.Masc;
	} else if (freq < 165) {
		return Gender.Enby;
	} else if (freq <=255) {
		return Gender.Fem;
	} else {
		return Gender.InfraFem;
	}
}

function gender_to_color(g: Gender): color {
	switch(g) {
		case Gender.UltraMasc: return new color(0,128,128);
		case Gender.Masc: return new color(64,64,255);
		case Gender.Enby: return new color(64,255,64);
		case Gender.Fem: return new color(255,64,64);
		case Gender.InfraFem: return new color(128,128,0);
	}
}

function frequency_to_color(freq: number) : color {
	return gender_to_color(frequency_to_gender(freq));
}

function make_background(ctx: CanvasRenderingContext2D, hertz_per_bin: number) : ImageData {
	const height = ctx.canvas.height;
	let imgData = ctx.createImageData(1,height);
	let freq = 0;
	for (let i = 0; i < imgData.data.length; ++i) {
		write_pixel(imgData.data, i, frequency_to_color(freq));
		freq += hertz_per_bin;
	}
	return imgData;
}

function draw_specturm(img: Uint8Array, data: Uint8Array, hertz_per_bin: number) {
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

function state_main_frequency(freq: number | null) {
	const freq_out = document.getElementById("freq-out") as HTMLElement;
	if (freq  == null) {
		freq_out.innerText = "-";
		freq_out.style.color = "white";
	} else {
		freq_out.innerText = String(freq) + " Hz";
		freq_out.style.color = frequency_to_color(freq).to_str();
	}
}

function mark_main_freq(img: Uint8Array, data: Uint8Array, hertz_per_bin: number) {
	const imax = max_index(data);
	const max_amplitude = data[imax];
	if (max_amplitude > current_threshold) {
		const white = new color(255,255,255);
		write_pixel(img, imax-1, white);
		write_pixel(img, imax,   white);
		write_pixel(img, imax+1, white);
		state_main_frequency(imax * hertz_per_bin);
		if (current_recording != null) {
			current_recording.push(max_amplitude * hertz_per_bin);
		}
	} else {
		state_main_frequency(null);
	}
}

function render_analysis(ctx: CanvasRenderingContext2D, data: Uint8Array, hertz_per_bin: number): ImageData {
	const height = ctx.canvas.height;
	let imgData = make_background(ctx, hertz_per_bin);
	draw_specturm(imgData.data, data, hertz_per_bin);
	mark_main_freq(imgData.data, data, hertz_per_bin);
	return imgData;
}

function spectrum(stream: MediaStream) {
	const audioCtx = new AudioContext();
	const analyser = audioCtx.createAnalyser();
	analyser.fftSize=1024*32;
	analyser.smoothingTimeConstant = 0.0;
	audioCtx.createMediaStreamSource(stream).connect(analyser);
	const max_freq = audioCtx.sampleRate / 2;
	const max_human_freq = 400;
	const hertz_per_bin = max_freq / analyser.frequencyBinCount;

	const canvas = document.getElementById("canvas") as HTMLCanvasElement;
	if (canvas == null) {throw "Missing canvas-element in document";}
	canvas.width = window.innerWidth - 20;
	canvas.height = max_human_freq / hertz_per_bin;
	const ctx = canvas.getContext("2d");
	if (ctx == null) {throw "No 2d-context in canvas element";}
	const data = new Uint8Array(canvas.height);


	setInterval(() => {
		shift_left(ctx, 1);
		analyser.getByteFrequencyData(data);
		ctx.putImageData(render_analysis(ctx, data, hertz_per_bin), canvas.width-1, 0);
	}, 1);
};

type RecordStats = {[key in Gender]: number};

function analyze_recording(freq_data: number[]): RecordStats {
	let stats : RecordStats = {
		[Gender.InfraFem]: 0,
		[Gender.Fem]: 0,
		[Gender.Enby]: 0,
		[Gender.Masc]: 0,
		[Gender.UltraMasc]: 0
	};
	for (const freq of freq_data) {
		stats[frequency_to_gender(freq)] += 1;
		console.log(freq);
	}
	return stats;
}

function show_recording_results(stats: RecordStats) {
	let results_table = document.getElementById("RecordResultTableBody") as HTMLElement;
	let total = stats[Gender.InfraFem] + stats[Gender.Fem] + stats[Gender.Enby] + stats[Gender.Masc] + stats[Gender.UltraMasc];
	let tr = document.createElement("tr");

	let td0 = document.createElement("td");
	td0.innerHTML = "#" + (++record_counter).toFixed(0);
	tr.appendChild(td0);

	let td1 = document.createElement("td");
	td1.innerHTML = (100 * stats[Gender.Fem] / total).toFixed(0) + "%";
	tr.appendChild(td1);


	let td2 = document.createElement("td");
	td2.innerHTML = (100 * stats[Gender.Masc] / total).toFixed(0) + "%";
	tr.appendChild(td2);

	let td3 = document.createElement("td");
	td3.innerHTML = (100 * stats[Gender.InfraFem] / total).toFixed(0) + "%";
	tr.appendChild(td3);

	let td4 = document.createElement("td");
	td4.innerHTML = (100 * stats[Gender.UltraMasc] / total).toFixed(0) + "%" ;
	tr.appendChild(td4);

	let td5 = document.createElement("td");
	td5.innerHTML = (100 * stats[Gender.Enby] / total).toFixed(0) + "%";
	tr.appendChild(td5);

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

		show_recording_results(analyze_recording(recording));
	}
}

window.onload =
(() => {
	let threshold_selector = document.getElementById("VolumeThresholdSelector") as HTMLInputElement;
	current_threshold = Number(threshold_selector.value);
	threshold_selector.onchange = (event) => {
		current_threshold = Number(threshold_selector.value);
	};

	let toggle_record_button = document.getElementById("ToggleRecordButton") as HTMLInputElement;
	toggle_record_button.onclick = (event) => {
		toggle_recording(toggle_record_button);
	}
	
	navigator.mediaDevices.getUserMedia({audio: true}).then(spectrum).catch(console.log);
});

