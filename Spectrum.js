function Spectrum() {
	this.name = "Spectrum"; // Name Of The Visualisation

	this.draw = function() {
		push();
		let spectrum = fourier.analyze(); // Array Of Amplitude Values
		noStroke();

		for (let i = 0; i < spectrum.length; i++) {
			let amt = map(i, 0, spectrum.length, 0, 1); // Calculate Blend Amount
			let spectrumColour = lerpColor(color(25, 25, 100), color(255, 215, 100), amt);
			fill(spectrumColour);

			let y = map(i, 0, spectrum.length, 0, height); // Calculate y Position Based On Index Value
			let w = map(spectrum[i], 0, 255, 0, width); // Calculate Width Based On Amplitude Value
			rect(0, y, w, height/spectrum.length); // Draw The Rectangle
		}
		pop();
	};
}