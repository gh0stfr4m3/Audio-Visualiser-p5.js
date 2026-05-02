function WavePattern() {
	this.name = "Wave Pattern"; // Name Of The Visualisation

	this.draw = function() {
		push();
		noFill();
		// Colour Palette
		let waveColor = lerpColor(color(255, 215, 100), color(120, 180, 255), sin(frameCount * 0.05) * 0.5 + 0.5);
		stroke(waveColor); // Set Stroke Colour
		strokeWeight(2); // Set Stroke Weight

		beginShape();

		let wave = fourier.waveform(); // Array Of Amplitude Values

		for (let i = 0; i < wave.length; i++) {
			let x = map(i, 0, wave.length, 0, width); // Calculate x Position Based On Index Value
			let y = map(wave[i], -1, 1, 0, height); // Calculate y Position Based On Amplitude Value
			vertex(x, y); // Draw The Vertex
		}

		endShape();
		pop();
	};
}