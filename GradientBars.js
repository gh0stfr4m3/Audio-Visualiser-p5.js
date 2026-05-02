function GradientBars() {
    this.name = "Gradient Bars"; //  Name Of The Visualisation
    
    this.draw = function() {
        let spectrum = fourier.analyze(); // Get Frequency Spectrum Data
        let numBars = 64; // Number Of Bars
        let margin = 50; // Margin From Edges
        let availableWidth = width - (2 * margin);
        let barWidth = availableWidth/numBars; // Width Of Each Bar
        
        push();
        fill(255, 255, 255);
        noStroke();
        
        // Calculate Centre Position
        let centerY = height/2;
        let maxBarHeight = height * 0.3; // Maximum Extension From Centre
        for (let i = 0; i < numBars; i++) {
            // Map Bar Index To Spectrum Index
            let spectrumIndex = Math.floor(map(i, 0, numBars, 0, spectrum.length));
            let individualAmplitude = spectrum[spectrumIndex];
            
            // Determine Frequency Type & Bar Height
            let frequencyRatio = i/numBars; // 0 to 1 Across The Bars
            let groupIndex = Math.floor(i/10); // Group Bars In Sets Of 10
            let isUpward = (groupIndex % 2 === 0); // First 10 Up, Next 10 Down

            // Colour Scheme
            let colA = color(0, 229, 255);
            let colB = color(255, 0, 255);
            let colC = color(255, 140, 0);
            let barColor;
            if (frequencyRatio < 0.5) {
                barColor = lerpColor(colA, colB, frequencyRatio * 2);
            } else {
                barColor = lerpColor(colB, colC, (frequencyRatio - 0.5) * 2);
            }
            
            let baseEnergy;
            if (frequencyRatio < 0.25) {
                // Bass
                baseEnergy = fourier.getEnergy("bass");
            } else if (frequencyRatio < 0.5) {
                // Low Mid
                baseEnergy = fourier.getEnergy("lowMid");
            } else if (frequencyRatio < 0.75) {
                // High Mid
                baseEnergy = fourier.getEnergy("highMid");
            } else {
                // Treble
                baseEnergy = fourier.getEnergy("treble");
            }
            
            let overallLevel = soundAmplitude.getLevel();
            
            // Rest State Height For The Bars
            let restHeight = 25;
            
            if (overallLevel < 0.01) {
                barHeight = restHeight; // If No Sound, Set To Rest Height
            } else {
                let normalisedIndex = map(i, 0, numBars, 0, spectrum.length - 1);
                let spectrumValue = spectrum[Math.floor(normalisedIndex)];
                
                let baseHeight = map(baseEnergy, 0, 255, restHeight, maxBarHeight * 0.4);
                let individualHeight = map(spectrumValue, 0, 255, 0, maxBarHeight * 0.6);
                barHeight = baseHeight + individualHeight;
                
                let sensitivityMultiplier = 2.0;
                barHeight = restHeight + (barHeight - restHeight) * sensitivityMultiplier;
            }
            
            barHeight = Math.max(barHeight, restHeight);
            
            // Calculate Bar Position
            let x = margin + (i * barWidth);
            let y, height_val;
            
            if (overallLevel < 0.01) {
                y = centerY - restHeight/2;
                height_val = restHeight; // If No Sound, Set To Rest Height
            } else {
                if (isUpward) {
                    // Bar Extends Upward From Centre
                    y = centerY - barHeight;
                    height_val = barHeight;
                } else {
                    // Bar Extends Downward From Centre
                    y = centerY;
                    height_val = barHeight;
                }
            }
            
            // Draw Curved Bar
            this.drawCurvedBar(x, y, barWidth - 2, height_val, isUpward, barColor); // Curved Edge Bars
        }
        
        pop();
    };
    
    // Method To Draw Curved Bars
    this.drawCurvedBar = function(x, y, barWidth, barHeight, isUpward, col) {
        push();
        noStroke();
        fill(col);
        let cornerRadius = Math.min(barWidth/2, 6);
        rect(x, y, barWidth, barHeight, cornerRadius);
        pop();
    };
}