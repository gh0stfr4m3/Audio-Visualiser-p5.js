function MirroredBars() {
    this.name = "Mirrored Bars"; // Name Of The Visualisation

    // Properties For Mirrored Bars
    this.barCount = 64;
    this.barWidth = 0;
    this.maxBarHeight = 0;
    this.centerGap = 0;
    this.rotation = 0;
    this.colorShift = 0;
    
    this.onResize = function() {
        this.barWidth = (width/2 - 100)/this.barCount; // Calculate Bar Width Based On Screen Width
        this.maxBarHeight = height/2 - 50; // Maximum Bar Height Based On Screen Height
        this.centerGap = 100; // Gap Between Left and Right Bars
    };
    
    this.onResize();
    
    this.draw = function() {
        let spectrum = fourier.analyze(); // Get Frequency Spectrum Data
        let level = soundAmplitude.getLevel(); // Get Current Sound Level

        // Update Animation Properties
        this.rotation += 0.02;
        this.colorShift += 0.01;
        
        push();
        colorMode(HSB, 360, 100, 100, 255);
        
        // Draw Left Side Bars
        this.drawBars(spectrum, level, true);
        
        // Draw Right Side Bars
        this.drawBars(spectrum, level, false);
        
        // Draw Center Connection
        this.drawCenterConnection(level);
        
        pop();
    };
    
    this.drawBars = function(spectrum, level, isLeft) {
        push();
        
        let centerX = width/2;
        let centerY = height/2;

        // Calculate Spectrum Samples Per Bar
        let samplesPerBar = Math.floor(spectrum.length/this.barCount);
        
        for (let i = 0; i < this.barCount; i++) {
            // Get Average Energy For The Bar
            let sum = 0;
            let startIndex = i * samplesPerBar;
            let endIndex = Math.min(startIndex + samplesPerBar, spectrum.length);
            
            for (let j = startIndex; j < endIndex; j++) {
                sum += spectrum[j];
            }
            let avgEnergy = sum/(endIndex - startIndex);
            
            // Calculate Bar Height
            let barHeight = map(avgEnergy, 0, 255, 10, this.maxBarHeight);
            
            // Calculate Bar Position
            let barX;
            if (isLeft) {
                // Left Side Bars
                barX = centerX - this.centerGap/2 - (i + 1) * this.barWidth;
            } else {
                // Right Side Bars
                barX = centerX + this.centerGap/2 + i * this.barWidth;
            }
            
            // Colour Based On Frequency & Energy
            let hue = map(i, 0, this.barCount, 0, 360) + this.colorShift * 50;
            let saturation = map(avgEnergy, 0, 255, 50, 100);
            let brightness = map(avgEnergy, 0, 255, 50, 100);
            
            // Draw Main Bar
            noStroke();
            fill(hue % 360, saturation, brightness);
            rect(barX, centerY - barHeight/2, this.barWidth - 2, barHeight, 3);
        }
        
        pop();
    };
    
    this.drawCenterConnection = function(level) {
        push();
        translate(width/2, height/2);
        
        // Get Frequency Data For The Beat Circles
        let bassEnergy = fourier.getEnergy("bass");
        let trebleEnergy = fourier.getEnergy("treble");
        
        // Top Beat Circle (Treble)
        let topPulseSize = map(trebleEnergy, 0, 255, 15, 60);
        noStroke();
        colorMode(RGB);
        fill(100, 150, 255, map(trebleEnergy, 0, 255, 80, 200));
        ellipse(0, -80, topPulseSize);
        
        // Inner Core For Top Circle
        fill(255, 255, 255, map(trebleEnergy, 0, 255, 100, 200));
        ellipse(0, -80, topPulseSize * 0.4);
        
        // Draw Central Pulse
        let pulseSize = map(level, 0, 1, 20, 80);
        fill(255, 200, 0, map(level, 0, 1, 100, 255));
        ellipse(0, 0, pulseSize);
        
        // Inner Core For Center Circle
        fill(255, 255, 255, map(level, 0, 1, 150, 255));
        ellipse(0, 0, pulseSize * 0.4);
        
        // Bottom Circle (Bass)
        let bottomPulseSize = map(bassEnergy, 0, 255, 15, 60);
        fill(255, 100, 100, map(bassEnergy, 0, 255, 80, 200));
        ellipse(0, 80, bottomPulseSize);
        
        // Draw Inner Core For Bottom Circle
        fill(255, 255, 255, map(bassEnergy, 0, 255, 100, 200));
        ellipse(0, 80, bottomPulseSize * 0.4);
        
        pop();
    };
}