function shift_left(ctx, n) {
	ctx.globalCompositeOperation = "copy";
	ctx.drawImage(ctx.canvas,-n, 0);
	// reset back to normal for subsequent operations.
	ctx.globalCompositeOperation = "source-over"
}

function make_column(ctx, data, canvas: HTMLCanvasElement) {
	let imgData = ctx.createImageData(1,canvas.height);
	for (let i = 0; i < imgData.data.length; i += 4) {
		imgData.data[i+0] = 200;
	}
	let imax = 0;
	let dmax = data[0];
	for (let i = 0; i < data.length ; ++i) {
		let d = data[i]
		imgData.data[4*(canvas.height-i)-1] = d;
		if (d > dmax) {
			imax =i;
			dmax = d;
		}
	}
	imgData.data[4*(canvas.height-imax)] = 0;
	imgData.data[4*(canvas.height-imax)+1] = dmax;
	imgData.data[4*(canvas.height-imax)+2] = 0;
	return imgData;
}

function spectrum(stream) {
	const audioCtx = new AudioContext();
	const analyser = audioCtx.createAnalyser();
	analyser.fftSize=1024*32;
	analyser.smoothingTimeConstant = 0.0;
	audioCtx.createMediaStreamSource(stream).connect(analyser);
	const max_freq = audioCtx.sampleRate / 2;
	const max_human_freq = 300;

	const canvas = document.getElementById("canvas") as HTMLCanvasElement;
	canvas.width = window.innerWidth - 20;
	canvas.height = analyser.frequencyBinCount * 2* (max_human_freq / max_freq);
	const ctx = canvas.getContext("2d");
	const data = new Uint8Array(canvas.height);


	setInterval(() => {
		shift_left(ctx, 1);
		analyser.getByteFrequencyData(data);
		ctx.putImageData(make_column(ctx, data, canvas), canvas.width-1, 0);
	}, 1000 * canvas.width / audioCtx.sampleRate);
};

navigator.mediaDevices.getUserMedia({audio: true}).then(spectrum).catch(console.log);
