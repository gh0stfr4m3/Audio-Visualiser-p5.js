function RingBars() {
    this.name = "Ring Bars"; // Name Of The Visualisation

    this.barCount = 180; // Number Of Radial Bars
    this.innerRadius = 150; // Base Circle Radius
    this.gapAngle = 0.6;
    this.rotation = 0; // Rotation Effect

    this.draw = function() {
        // Get Frequency Spectrum Data
        let spectrum = fourier.analyze();

        push();
        translate(width/2, height/2 - 15);

        this.rotation += 0.002; // Apply Rotation Effect
        rotate(this.rotation);

        // Get Frequency Data For Bass & Treble
        let bassEnergy = fourier.getEnergy("bass");
        let trebleEnergy = fourier.getEnergy("treble");
        let overallLevel = soundAmplitude.getLevel();

        // Colour Scheme Based On Bass Energy
        let ringColor = lerpColor(
            color(0, 140, 255),  // Electric blue
            color(255, 0, 100),  // Hot pink
            map(bassEnergy, 0, 255, 0, 1)
        );

        // Draw Inner Circle
        let ringStroke = map(overallLevel, 0, 1, 2, 8);
        stroke(ringColor);
        strokeWeight(ringStroke);
        noFill();
        ellipse(0, 0, this.innerRadius * 2);

        // Draw Radial Bars
        let binsPerBar = Math.floor(spectrum.length/this.barCount);
        for (let i = 0; i < this.barCount; i++) {
            let angle = map(i, 0, this.barCount, 0, TWO_PI); // Calculate Angle For Each Bar

            // Create Break In The Circle
            if (angle > PI - this.gapAngle/2 && angle < PI + this.gapAngle/2) {
                continue;
            }

            // Map Spectrum Data To Bar Length
            let index = i * binsPerBar;
            let amp = spectrum[index];
            let barLength = map(amp, 0, 255, 0, 120);

            // Colour Mapping
            let hue = map(i, 0, this.barCount, 0, 360) + frameCount * 0.5;
            let saturation = map(amp, 0, 255, 60, 100);
            let brightness = map(amp, 0, 255, 70, 100);
            
            // Beat Reactive Colours
            if (amp > 200) {
                brightness = 100;
                saturation = 100;
            }

            // Calculate Bar Start & End Points
            let x1 = cos(angle) * this.innerRadius;
            let y1 = sin(angle) * this.innerRadius;
            let x2 = cos(angle) * (this.innerRadius + barLength);
            let y2 = sin(angle) * (this.innerRadius + barLength);

            // Draw Radial Bar
            colorMode(HSB, 360, 100, 100, 255); // Set Colour Mode to HSB
            stroke(hue % 360, saturation, brightness); // Set Stroke Colour
            strokeWeight(map(amp, 0, 255, 1, 4));
            line(x1, y1, x2, y2);
        }
        
        // Reset Colour Mode
        colorMode(RGB, 255, 255, 255, 255);

        pop();
    };
}