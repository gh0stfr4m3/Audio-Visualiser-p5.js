function RidgelinePlots() {
	this.name = "Ridgeline Plots"; // Name Of The Visualisation

	let output = [];
	let spectrumWidth; // Width Of The Visualisation
	let startX; // Starting x Position
	let startY; // Starting y Position
	let endY; // Ending y Position

	this.onResize = function() {
		startX = width/10; // Calculate Starting x Position
		startY = height/5; // Calculate Starting y Position
		endY = height - startY; // Calculate Ending y Position
		spectrumWidth = (width/5) * 4; // Calculate Width Of The Visualisation
	};

	this.onResize();

	this.draw = function() {
		// Get Frequency Data
		let bassEnergy = fourier.getEnergy("bass");
		let trebleEnergy = fourier.getEnergy("treble");
		let level = soundAmplitude.getLevel();

		if (frameCount % 15 === 0) { // Add New Plot Every 15 Frames
			let w = fourier.waveform();
			let outputArray = [];

			for (let i = 0; i < w.length; i += 15) {
				let x = map(i, 0, 1024, startX, startX + spectrumWidth);
				let scale = 70;
				let y = map(w[i], -1, 1, -scale, scale); // Calculate y Position Based On Amplitude Value

				outputArray.push({x: x, y: startY + y});
			}
			output.push(outputArray);
		}

		// Change The Speed Based On The Amplitude Value
		this.speed = map(level, 0, 0.5, 1, 4);

		// Colour Scheme
		let baseColor = lerpColor(color(255, 215, 100), color(120, 180, 255), sin(frameCount * 0.02) * 0.3 + 0.5);

		for (let i = 0; i < output.length; i++) {
            // Brighter Fade
			let ageOpacity = map(i, 0, output.length, 0.8, 1);
			let energyOpacity = map(level, 0, 1, 0.9, 1);
			let finalOpacity = ageOpacity * energyOpacity;

			// Brighter Colour Variation
			let colourVariation = lerpColor(baseColor, color(255, 150, 150), map(bassEnergy, 0, 255, 0, 0.3));

			// Apply Brighter Fade
			colourVariation.setAlpha(finalOpacity * 255);
			
			noFill();
			stroke(colourVariation); // Set Stroke Colour
			strokeWeight(3);
			
			beginShape();
			for (let j = 0; j < output[i].length; j++) {
				output[i][j].y += this.speed;
				vertex(output[i][j].x, output[i][j].y); // Draw Each Point
			}
			endShape();

			if (output[i][0].y > endY) {
				output.splice(i, 1); // Remove Plot
				i--;
			}
		}
	};
}