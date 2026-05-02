function Needles() {
    this.name = "Needles"; // Name Of The Visualisation

    let minAngle = PI + PI/10;
    let maxAngle = TWO_PI - PI/10;
    this.plotsAcross = 2;
    this.plotsDown = 2;

    // Names Of The Frequency Bands
    this.frequencyBins = ["Bass", "Low Mid", "High Mid", "Treble"];

    // Labels For Frequency Bands To Sample Energy
    this.frequencyBands = ["bass", "lowMid", "highMid", "treble"];

                        // Bass Colour    // Low Mid Colour    // High Mid Colour     // Treble Colour
    this.colors = [color(255, 120, 120), color(255, 215, 100), color(120, 255, 120), color(120, 180, 255)]; // Colour For Each Frequency Band
    this.bgColors = [color(80, 25, 25), color(80, 60, 25), color(25, 80, 25), color(25, 40, 80)]; // Background Colour For Dials

    this.onResize = function() {
        this.pad = width/30; // Padding Around Each Plot
        this.plotWidth = (width - this.pad)/this.plotsAcross; // Width Of Each Plot
        this.plotHeight = (height - this.pad)/this.plotsDown; // Height Of Each Plot
        this.dialRadius = (this.plotWidth - this.pad)/2 - 5; // Radius Of The Dial
    };

    this.onResize();

    this.draw = function() {
        fourier.analyze();
        let currentBin = 0;
        push();
        noStroke();
        
        for (let i = 0; i < this.plotsDown; i++) {
            for (let j = 0; j < this.plotsAcross; j++) {

                let x = this.pad + j * this.plotWidth;
                let y = this.pad + i * this.plotHeight;
                let w = this.plotWidth - this.pad;
                let h = this.plotHeight - this.pad;

                // Neon Effect For Dashboard Background
                this.drawNeonGlow(x, y, w, h + 5, this.bgColors[currentBin], currentBin);
                
                // Main Dashboard
                fill(this.bgColors[currentBin]);
                rect(x, y, w, h + 5, 15); // Curve The Corners
                
                this.ticks(x + w/2, y + h, this.frequencyBins[currentBin], currentBin);
                
                let energy = fourier.getEnergy(this.frequencyBands[currentBin]);
                this.needle(energy, x + w/2, y + h, currentBin);
                currentBin++; // Move To Next Frequency Band
            }
        }
        pop();
    };

    this.needle = function(energy, centreX, bottomY, binIndex) {
        push();
        
        translate(centreX, bottomY);
        let theta = map(energy, 0, 255, minAngle, maxAngle);
        let x = this.dialRadius * cos(theta);
        let y = this.dialRadius * sin(theta);
        
        // Needle Colour Based On Energy
        let needleColor = lerpColor(color(100), this.colors[binIndex], map(energy, 0, 255, 0.3, 1));
        
        // Neon Glow For Needles
        let glowIntensity = map(energy, 0, 255, 0.2, 1);
        
        // Outer Glow
        stroke(this.colors[binIndex].levels[0], this.colors[binIndex].levels[1], this.colors[binIndex].levels[2], 40 * glowIntensity);
        strokeWeight(18);
        line(0, 0, x, y);
        
        // Middle Glow
        stroke(this.colors[binIndex].levels[0], this.colors[binIndex].levels[1], this.colors[binIndex].levels[2], 80 * glowIntensity);
        strokeWeight(12);
        line(0, 0, x, y);
        
        // Main Needle
        stroke(needleColor);
        strokeWeight(6);
        line(0, 0, x, y); // Draw The Needle

        // Draw The Semicircle With Matching Colour
        noStroke();
        fill(lerpColor(color(30), this.colors[binIndex], 0.7));
        arc(0, 5, 25, 25, PI, TWO_PI); // Draw The Semicircle

        pop();
    };

    this.drawNeonGlow = function(x, y, w, h, baseColor, binIndex) {
        push();
        noFill();
        
        // Neon Effect With Multiple Layers
        let glowIntensity = map(fourier.getEnergy(this.frequencyBands[binIndex]), 0, 255, 0.3, 1);
        
        // Outer Glow
        stroke(this.colors[binIndex].levels[0], this.colors[binIndex].levels[1], this.colors[binIndex].levels[2], 30 * glowIntensity);
        strokeWeight(20);
        rect(x, y, w, h, 15);
        
        // Middle Glow
        stroke(this.colors[binIndex].levels[0], this.colors[binIndex].levels[1], this.colors[binIndex].levels[2], 60 * glowIntensity);
        strokeWeight(12);
        rect(x, y, w, h, 15);
        
        // Inner Glow
        stroke(this.colors[binIndex].levels[0], this.colors[binIndex].levels[1], this.colors[binIndex].levels[2], 120 * glowIntensity);
        strokeWeight(6);
        rect(x, y, w, h, 15);
        
        // Pulsing Effect Based On Energy
        let pulse = sin(frameCount * 0.1) * 0.1 + 0.9;
        stroke(this.colors[binIndex].levels[0], this.colors[binIndex].levels[1], this.colors[binIndex].levels[2], 80 * glowIntensity * pulse);
        strokeWeight(3);
        rect(x, y, w, h, 15);
        
        pop();
    };

    this.ticks = function(centreX, bottomY, freqLabel, binIndex) {
        let nextTickAngle = minAngle;
        push();
        
        translate(centreX, bottomY); // Centre The Ticks
        textAlign(CENTER);
        textFont(myFont); // Custom Font

        // Colour For The Frequency Label
        noStroke();
        fill(this.colors[binIndex]);
        textSize(25); // Size Of The Frequency Label
        text(freqLabel, 0, -(this.plotHeight/2)); // Draw The Frequency Label

        // Draw The Neon Tick Marks
        for (let i = 0; i < 9; i++) {
            let x = this.dialRadius * cos(nextTickAngle);
            let x1 = (this.dialRadius - 5) * cos(nextTickAngle);
            let y = (this.dialRadius) * sin(nextTickAngle);
            let y1 = (this.dialRadius - 5) * sin(nextTickAngle);

            // Main thick tick
            stroke(this.colors[binIndex]); // Set Tick Colour
            strokeWeight(6); // Thickness Of The Tick
            line(x, y, x1, y1); // Draw The Tick

            nextTickAngle += PI/10; // Increment Angle For Next Tick
        }
        pop();
    };
}