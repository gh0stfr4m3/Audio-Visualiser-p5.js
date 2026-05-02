function BeatDance() {
    this.name = "Beat Dance"; // Name Of The Visualisation
    
    let sampleBuffer = []; // Buffer To Store Recent Samples
    let beatIntensity = 0; // Intensity Of The Beat
    let beatDecay = 0.95; // Decay Rate For Beat Intensity
    
    this.draw = function() {
        let spectrum = fourier.analyze(); // Get Frequency Spectrum
        let currentBeat = this.detectBeat(spectrum); // Detect Beat
        
        if (currentBeat) { // If A Beat Is Detected
            beatDetected = true;
            beatIntensity = 1.5; // Set Beat Intensity To A High Value
        } else {
            beatDetected = false;
            beatIntensity *= beatDecay; // Decay The Beat Intensity
        }
        
        // Draw The Beat Visualisation
        this.drawBeatVisualisation();
    };
    
    this.drawBeatVisualisation = function() {
        push();
        translate(width/2, height/2 - 50); // Centre The Visualisation
        
        let spectrum = fourier.analyze(); // Get Frequency Spectrum
        noFill();
        // Colour Scheme
        let beatColor = lerpColor(color(255, 120, 120), color(255, 215, 100), sin(frameCount * 0.1 + beatIntensity * 5) * 0.5 + 0.5);
        stroke(beatColor);
        strokeWeight(2);
        
        let level = soundAmplitude.getLevel(); // Get Sound Level
        let globalRadiusMultiplier = map(level, 0, 1, 0.5, 2); // Adjust Radius Based On Sound Level
        
        beginShape();
        for (let i = 0; i < spectrum.length; i++) { // Loop Through Frequency Bands
            let angle = map(i, 0, spectrum.length, 0, TWO_PI); // Calculate Angle For Each Band
            let radius = map(spectrum[i], 0, 255, 100, 200); // Map Spectrum Value To Radius
            radius *= globalRadiusMultiplier; // Adjust Radius Based On Sound Level
            let x = radius * cos(angle) * 1.2; // Calculate x Position
            let y = radius * sin(angle) * 1.2; // Calculate y Position
            vertex(x, y); // Draw Vertex
        }
        endShape(CLOSE);
        pop();
    };

    this.detectBeat = function(spectrum) { // Detect Beat Based On Frequency Spectrum
        let sum = 0;
        
        let endIndex = spectrum.length/4;
        if (endIndex > spectrum.length) {
            endIndex = spectrum.length; // Ensure That We Do Not Exceed The Spectrum Length
        }
        for (let i = 0; i < endIndex; i++) {
            sum += spectrum[i] * spectrum[i]; // Sum The Squares Of The Frequencies
        }

        if (sampleBuffer.length == 60) {
            let sampleSum = 0; // Initialise Sample Sum
            let isBeat = false; // Flag To Indicate If A Beat Is Detected
            
            for (let i = 0; i < sampleBuffer.length; i++) {
                sampleSum += sampleBuffer[i]; // Sum The Samples In The Buffer
            }
            let sampleAverage = sampleSum/sampleBuffer.length;
            let c = this.calculateConstant(sampleAverage); // Calculate Constant Based On Sample Average
            
            if (sum > sampleAverage * c) {
                isBeat = true; // If The Current Sum Exceeds The Average By The Constant, A Beat Is Detected
            }
            
            sampleBuffer.splice(0, 1); // Remove The Oldest Sample
            sampleBuffer.push(sum); // Add The New Sample To The Buffer
            return isBeat;

        } else {
            sampleBuffer.push(sum); // Add The New Sample To The Buffer
            return false;
        }
    };

    this.calculateConstant = function(sampleAverage) {
        let varianceSum = 0;
        for (let i = 0; i < sampleBuffer.length; i++) {
            let diff = sampleBuffer[i] - sampleAverage; // Calculate Difference From Average
            varianceSum += diff * diff; // Sum The Squares Of The Differences
        }

        let variance = varianceSum/sampleBuffer.length; // Calculate The Variance
        let m = -0.15/(25 - 200); // Calculate The Gradient
        let b = 1 + (m * 200); // Calculate The Intercept
        let c = (m * variance) + b; // Calculate The Constant Based On Variance
        
        if (c < 1.1) { // Ensure The Constant Is Not Too Low
            c = 1.1;
        }
        if (c > 2.0) { // Ensure The Constant Is Not Too High
            c = 2.0;
        }
        
        return c; // Return The Calculated Constant
    };
}