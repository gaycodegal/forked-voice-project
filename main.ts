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


enum Gender {
	UltraMasc,
	Masc,
	Enby,
	Fem,
	InfraFem,
};

function freqency_to_gender(freq: number): Gender {
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

function freqency_to_color(freq: number) : color {
	return gender_to_color(freqency_to_gender(freq));
}

function make_background(ctx: CanvasRenderingContext2D, hertz_per_bin: number) : ImageData {
	const height = ctx.canvas.height;
	let imgData = ctx.createImageData(1,height);
	let freq = 0;
	for (let i = 0; i < imgData.data.length; ++i) {
		write_pixel(imgData.data, i, freqency_to_color(freq));
		freq += hertz_per_bin;
	}
	return imgData;
}

function draw_specturm(img: Uint8Array, data: Uint8Array, hertz_per_bin: number) {
	const height = img.length / 4;
	for (let i = 0; i < data.length ; ++i) {
		let d = data[i]
		img[4*(height-i)-1] = Math.max(64,d);
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

function state_main_frequency(freq: number) {
	const freq_out = document.getElementById("freq-out");
	if (freq_out == null) {throw "Missing freq-out-element in document";}
	freq_out.innerText = freq == 0 ? "-" : String(freq) + " Hz";
	freq_out.style.color = freqency_to_color(freq).to_str();
}

function mark_main_freq(img: Uint8Array, data: Uint8Array, hertz_per_bin: number) {
	const imax = max_index(data);
	const white = new color(255,255,255);
	write_pixel(img, imax-1, white);
	write_pixel(img, imax,   white);
	write_pixel(img, imax+1, white);
	state_main_frequency(imax * hertz_per_bin);

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

navigator.mediaDevices.getUserMedia({audio: true}).then(spectrum).catch(console.log);
