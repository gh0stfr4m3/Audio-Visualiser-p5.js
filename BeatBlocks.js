function BeatBlocks() {
    this.name = "Beat Blocks"; // Name Of The Visualisation

    this.rotation = 0; // Rotation Angle
    this.noiseStep = 0.01; // Step Size For Noise Function
    this.progression = 0; // Progress Variable For Noise Function
    this.seedThreshold = 100; // Threshold For Noise Seed Reset

    this.draw = function() {
        let bassEnergy = fourier.getEnergy(0); // Get Bass Energy
        let trebleEnergy = fourier.getEnergy(3); // Get Treble Energy

        this.rotatingBlocks(trebleEnergy); // Draw Rotating Blocks Based On Treble Energy
        this.noiseLine(bassEnergy + 35, trebleEnergy + 35); // Draw Noise Line Based On Bass Energy
    };

    this.rotatingBlocks = function(energy) {
        this.rotation -= 0.01; // Rotate Anti-Clockwise

		if (energy > 150) {
			this.rotation += 0.02 // Rotate Clockwise
		}

        let r = map(energy, 0, 255, 20, 100); // Map Energy To The Size Of The Blocks

        push();
        rectMode(CENTER);
        translate(width/2, height/2); // Centre The Blocks
        rotate(this.rotation); // Rotate The Blocks
		noStroke();
        fill(random(255), random(255), random(255)); // Random Colour

        let blockSpacing = width/9; // Spacing Between The Blocks
        for (let i = 0; i < 10; i++) {
            rect(i * blockSpacing - width/2, 0, r, r); // Draw The Blocks
        }

        pop();
    };

    this.noiseLine = function(energy) {
        push();
        translate(width/2, height/2); // Centre The Noise Line

        beginShape();
		
        noFill();
        stroke(random(100, 255), random(100, 255), random(100, 255)); // Random Stroke Colour
        strokeWeight(3);

        for (let i = 0; i < 100; i++) {
            let x = map(noise(i * this.noiseStep + this.progression), 0, 1, -250, 250); // Calculate x Position With Noise
            let y = map(noise(i * this.noiseStep + this.progression + 1000), 0, 1, -250, 250); // Calculate y Position With Noise
            vertex(x, y);
        }

        endShape();

        this.progression += 0.03; // Increment Progress Variable
        
        if (energy > this.seedThreshold) { // If Energy Exceeds Threshold, Reset Noise Seed
            noiseSeed();
        }

        pop();
    };
}