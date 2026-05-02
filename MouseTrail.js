function MouseTrail() {
    this.name = "MouseTrail";
    this.trail = []; // Array To Store Trail Points
    this.maxTrailLength = 80; // Increased Trail Length For More Dramatic Effect
    this.trailColors = []; // Array To Store Colours For Each Trail Point
    this.baseSize = 15; // Increased Base Size For Better Visibility
    this.frequencyResponse = []; // Store Frequency Data For Colour Mapping
    this.beatThreshold = 0.15; // Threshold For Beat Detection
    this.lastBeatTime = 0; // Track Last Beat Time For Pulsing Effects

    this.draw = function() {
        // Get Audio Data
        let spectrum = fourier.logAverages(fourier.analyze());
        let amplitude = soundAmplitude.getLevel();
        
        // Update Frequency Response For Colour Mapping
        this.frequencyResponse = spectrum;
        
        // Beat Detection - Create Pulsing Effect On Strong Beats
        if (amplitude > this.beatThreshold) {
            this.lastBeatTime = frameCount;
        }
        
        // Add Current Mouse Position To Trail
        if (mouseX > 0 && mouseY > 0) { // Only Add If Mouse Is On Canvas
            let trailPoint = {
                x: mouseX,
                y: mouseY,
                time: frameCount,
                amplitude: amplitude,
                beatIntensity: amplitude > this.beatThreshold ? amplitude : 0
            };
            
            this.trail.push(trailPoint);
            
            // Limit Trail Length
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
        }
        
        // Draw The Trail
        this.drawTrail();
        
        // Draw Current Mouse Position With Special Effect
        this.drawCurrentMouse();
    };
    
    this.drawTrail = function() {
        for (let i = 0; i < this.trail.length; i++) {
            let point = this.trail[i];
            let age = (frameCount - point.time) / 8; // Faster Fade For More Dynamic Effect
            let alpha = map(age, 0, 4, 255, 0); // Fade Out Over Time
            
            // Calculate Size Based On Amplitude And Age With More Dramatic Scaling
            let size = this.baseSize * (1 + point.amplitude * 8) * (1 - age * 0.15);
            // Safety check to ensure size is a valid number
            if (!isNaN(size)) {
                size = constrain(size, 5, 60); // Increased Size Range For Better Visibility
            } else {
                size = this.baseSize; // Fallback To Base Size If Calculation Results In NaN
            }
            
            // Beat-Reactive Size Pulsing
            let beatPulse = 1;
            if (point.beatIntensity > 0) {
                beatPulse = 1 + sin(frameCount * 0.3) * 0.5 * point.beatIntensity;
                size *= beatPulse;
            }
            
            // Get Colour Based On Frequency Data And Position
            let colorIndex = map(i, 0, this.trail.length - 1, 0, this.frequencyResponse.length - 1);
            // Safety Check To Ensure FrequencyResponse Array Is Not Empty
            if (this.frequencyResponse.length > 0) {
                colorIndex = constrain(Math.floor(colorIndex), 0, this.frequencyResponse.length - 1);
            } else {
                colorIndex = 0; // Fallback Value If No Frequency Data
            }
            
            let frequency = this.frequencyResponse[colorIndex] || 0;
            let normalizedFreq = map(frequency, 0, 255, 0, 1);
            
            // Create Dynamic Colour Based On Frequency With More Saturation
            let r, g, b;
            if (normalizedFreq < 0.33) {
                // Low Frequencies - Vibrant Blues And Purples
                r = map(normalizedFreq, 0, 0.33, 80, 180);
                g = map(normalizedFreq, 0, 0.33, 30, 120);
                b = map(normalizedFreq, 0, 0.33, 220, 255);
            } else if (normalizedFreq < 0.66) {
                // Mid Frequencies - Bright Greens And Yellows
                r = map(normalizedFreq, 0.33, 0.66, 180, 255);
                g = map(normalizedFreq, 0.33, 0.66, 150, 255);
                b = map(normalizedFreq, 0.33, 0.66, 50, 30);
            } else {
                // High Frequencies - Intense Reds And Oranges
                r = map(normalizedFreq, 0.66, 1, 255, 180);
                g = map(normalizedFreq, 0.66, 1, 80, 30);
                b = map(normalizedFreq, 0.66, 1, 30, 0);
            }
            
            // Enhanced Glow Effects For Stronger Amplitudes
            if (point.amplitude > 0.2) {
                // Outer Glow - Larger And More Dramatic
                noStroke();
                fill(r, g, b, alpha * 0.4);
                ellipse(point.x, point.y, size * 2.5, size * 2.5);
                
                // Middle Glow
                fill(r, g, b, alpha * 0.7);
                ellipse(point.x, point.y, size * 1.8, size * 1.8);
                
                // Inner Glow
                fill(r, g, b, alpha * 0.9);
                ellipse(point.x, point.y, size * 1.2, size * 1.2);
            }
            
            // Main Trail Point With Beat-Reactive Effects
            noStroke();
            if (point.beatIntensity > 0) {
                // Beat-Reactive Colour Intensity
                let beatColor = map(point.beatIntensity, 0, 1, 0.7, 1.3);
                // Safety Check To Ensure R, G, B Are Valid Numbers
                if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                    r = constrain(r * beatColor, 0, 255);
                    g = constrain(g * beatColor, 0, 255);
                    b = constrain(b * beatColor, 0, 255);
                }
            }
            fill(r, g, b, alpha);
            ellipse(point.x, point.y, size, size);
            
            // Enhanced Sparkle Effects For High Frequencies And Beats
            if ((normalizedFreq > 0.7 || point.beatIntensity > 0.3) && point.amplitude > 0.15) {
                let sparkleSize = point.beatIntensity > 0.3 ? 4 : 2;
                let sparkleAlpha = point.beatIntensity > 0.3 ? alpha : alpha * 0.8;
                
                fill(255, 255, 255, sparkleAlpha);
                // Multiple Sparkles For Beat-Reactive Points
                for (let s = 0; s < (point.beatIntensity > 0.3 ? 3 : 1); s++) {
                    ellipse(point.x + random(-size/2, size/2), 
                           point.y + random(-size/2, size/2), 
                           sparkleSize, sparkleSize);
                }
            }
        }
    };
    
    this.drawCurrentMouse = function() {
        if (mouseX > 0 && mouseY > 0) {
            let amplitude = soundAmplitude.getLevel();
            let size = this.baseSize * (1 + amplitude * 15); // More Dramatic Size Scaling
            
            // Beat-Reactive Current Mouse Size
            if (amplitude > this.beatThreshold) {
                size *= (1 + sin(frameCount * 0.4) * 0.8);
            }
            
            // Get Dominant Frequency For Current Mouse Colour
            let spectrum = fourier.analyze();
            let dominantFreq = 0;
            let maxAmp = 0;
            
            for (let i = 0; i < spectrum.length; i++) {
                if (spectrum[i] > maxAmp) {
                    maxAmp = spectrum[i];
                    dominantFreq = i;
                }
            }
            
            let normalizedFreq = map(dominantFreq, 0, spectrum.length, 0, 1);
            
            // Create Colour For Current Mouse Position
            let r, g, b;
            if (normalizedFreq < 0.33) {
                r = map(normalizedFreq, 0, 0.33, 80, 180);
                g = map(normalizedFreq, 0, 0.33, 30, 120);
                b = map(normalizedFreq, 0, 0.33, 220, 255);
            } else if (normalizedFreq < 0.66) {
                r = map(normalizedFreq, 0.33, 0.66, 180, 255);
                g = map(normalizedFreq, 0.33, 0.66, 150, 255);
                b = map(normalizedFreq, 0.33, 0.66, 50, 30);
            } else {
                r = map(normalizedFreq, 0.66, 1, 255, 180);
                g = map(normalizedFreq, 0.66, 1, 80, 30);
                b = map(normalizedFreq, 0.66, 1, 30, 0);
            }
            
            // Enhanced Current Mouse With Beat-Reactive Effects
            let pulse = sin(frameCount * 0.2) * 0.3 + 0.7;
            
            // Beat-Reactive Outer Ring
            let outerRingSize = size * 2;
            if (amplitude > this.beatThreshold) {
                outerRingSize *= (1 + sin(frameCount * 0.3) * 0.5);
            }
            
            noFill();
            stroke(r, g, b, 180 * pulse);
            strokeWeight(4); // Thicker Stroke
            ellipse(mouseX, mouseY, outerRingSize, outerRingSize);
            
            // Beat-Reactive Middle Ring
            let middleRingSize = size * 1.3;
            if (amplitude > this.beatThreshold) {
                middleRingSize *= (1 + sin(frameCount * 0.25) * 0.3);
            }
            
            stroke(r, g, b, 120 * pulse);
            strokeWeight(2);
            ellipse(mouseX, mouseY, middleRingSize, middleRingSize);
            
            // Inner Circle With Beat Effects
            noStroke();
            if (amplitude > this.beatThreshold) {
                // Beat-Reactive Colour Intensity
                let beatColor = map(amplitude, 0, 1, 1, 1.5);
                // Safety Check To Ensure R, G, B Are Valid Numbers
                if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                    r = constrain(r * beatColor, 0, 255);
                    g = constrain(g * beatColor, 0, 255);
                    b = constrain(b * beatColor, 0, 255);
                }
            }
            fill(r, g, b, 220 * pulse);
            ellipse(mouseX, mouseY, size, size);
            
            // Enhanced Centre Highlight
            fill(255, 255, 255, 180 * pulse);
            ellipse(mouseX, mouseY, size * 0.4, size * 0.4);
        }
    };
    
    this.onResize = function() {
        // Adjust Trail Length Based On Canvas Size
        this.maxTrailLength = Math.floor((width + height) / 15); // More Trail Points
    };
}