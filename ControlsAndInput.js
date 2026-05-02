function ControlsAndInput() {
	this.menuDisplayed = false; // Flag To Check If The Menu Is Displayed
	this.playbackButton = new PlaybackButton(); // Create The Playback Button
	this.volumeSlider = createSlider(0, 1, 0.5, 0.01); // Create The Volume Slider
	this.volumeSlider.style("width", "150px"); // Set Volume Slider Width

	this.mousePressed = function() { // Check If The Playback Button Is Clicked
		if (!this.playbackButton.hitCheck()) {
			let fs = fullscreen(); // Get Current Fullscreen State
			fullscreen(!fs); // Toggle Fullscreen
		}
	};

	this.keyPressed = function(keycode) {
		if (keycode == 27) { // Escape Key
			startMenu = true; // Set Start Menu Flag To True
		}
		// Arrow Keys For Visualisation Navigation
		if (keycode === LEFT_ARROW) {
			// Move To Previous Visualisation
			selectedVisualIndex = selectedVisualIndex - 1;
			if (selectedVisualIndex < 0) {
				selectedVisualIndex = vis.visuals.length - 1;
			}
			vis.selectVisual(vis.visuals[selectedVisualIndex].name);
		} else if (keycode === RIGHT_ARROW) {
			// Move To Next Visualisation
			selectedVisualIndex = selectedVisualIndex + 1;
			if (selectedVisualIndex >= vis.visuals.length) {
				selectedVisualIndex = 0;
			}
			vis.selectVisual(vis.visuals[selectedVisualIndex].name);
		} else if (keycode === 32) { // Spacebar
			// Only Allow Playback Controls When Mic Is Not Active
			if (!useMicInput) {
				this.playbackButton.onPlayPause();
			}
		} else if (keycode === 83) { // "S" key for speed control
			// Only Allow Speed Control When Mic Is Not Active
			if (!useMicInput) {
				controls.playbackButton.onSpeed();
			}
		}

		// Number Keys 1-9 For Visualisations 1-9
		if (keycode >= 49 && keycode <= 57) {
			let visNumber = keycode - 49; // Convert Keycode to Visualisation Index (0-8)
			selectedVisualIndex = visNumber;
			vis.selectVisual(vis.visuals[visNumber].name); // Select Visualisation
		}
		// Key 0 for 10th Visualisation
		if (keycode == 48) {
			selectedVisualIndex = 9;
			vis.selectVisual(vis.visuals[9].name); // Select 10th Visualisation
		}
	};

	this.draw = function() {
		push();
		fill("white");
		stroke("black"); // Set Stroke Color
		strokeWeight(2); // Set Stroke Weight
		textSize(34); // Set Text Size
		this.playbackButton.draw(); // Draw The Playback Button

		textAlign(LEFT);
		textSize(24); // Set Text Size For Volume Icon
		fill("white"); // Set Fill Color For Volume Icon
		noStroke();

		// Show Volume Icon Based On Slider Value
		let volume = this.volumeSlider.value();
		let volumeIcon;
		if (volume === 0) {
			volumeIcon = "🔇"; // No Volume Icon
		} else {
			volumeIcon = "🔊"; // Icon When Volume > 0
		}
		text(volumeIcon, 20, height - 55); // Draw Volume Icon
		
		this.volumeSlider.position(15, height - 48);
		// Only Set Track Volume When Mic Is Not Active
		if (!useMicInput) {
			for (let i = 0; i < sounds.length; i++) {
				sounds[i].setVolume(volume); // Set Volume For Each Sound
			}
		}
		pop();
	};
}