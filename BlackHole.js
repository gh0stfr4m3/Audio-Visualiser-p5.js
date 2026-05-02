function BlackHole() {
    this.name = "Black Hole"; // Name Of The Visualisation
    
    let flowPoints = []; // Points For The Flowing Line
    let time = 0; // Time Variable For Animation
    
    this.draw = function() {
        let spectrum = fourier.analyze(); // Get The Frequency Spectrum
        let level = soundAmplitude.getLevel(); // Get The Amplitude Level
        
        // Diagonnaly Positioned Circular Patterns
        this.drawCircularPattern(width * 0.25, height * 0.75, spectrum, level);
        this.drawCircularPattern(width * 0.75, height * 0.25, spectrum, level);
        
        // Draw The Flowing Line
        this.drawFlowingLine(spectrum, level);
        
        time += 0.02; // Increment Time For Animation
    };
    
    this.drawCircularPattern = function(centerX, centerY, spectrum, level) {
        push();
        translate(centerX, centerY); // Move To The Centre Of The Pattern
        
        // Draw Concentric Circles
        let numCircles = 8;
        let baseRadius = 80;
        let radiusMultiplier = map(level, 0, 1, 0.8, 1.5);
        
        for (let i = 0; i < numCircles; i++) { // Iterate Over Number Of Circles
            let radius = baseRadius + (i * 15);
            radius *= radiusMultiplier; // Adjust Radius Based On Amplitude Level
            
            // Gradient Effect
            let alpha = map(i, 0, numCircles - 1, 150, 100); // Alpha Value For Gradient
            let lightPurple = color(200, 150, 255, alpha); // Light Purple Colour
            noStroke(); // No Stroke For Circles
            fill(lightPurple);
            ellipse(0, 0, radius * 2); // Draw Circle
        }
        
        // Draw Central Black Circle
        fill(0);
        ellipse(0, 0, 40);
        
        pop();
    };
    
    this.drawFlowingLine = function(spectrum, level) {
        push();
        stroke(255, 100, 80);
        strokeWeight(3);
        noFill();
        
        // Flowing Path Points
        let points = [];
        let numPoints = 200;
        
        for (let i = 0; i < numPoints; i++) {
            let t = map(i, 0, numPoints - 1, 0, 1);
            
            let startX = width * 0.25; // Start Point X
            let startY = height * 0.75; // Start Point Y
            let endX = width * 0.75; // End Point X
            let endY = height * 0.3; // End Point Y
            
            // Constrain Control Points To Avoid Going Off Canvas
            let control1X = constrain(width * 0.15, 50, width - 50);
            let control1Y = height * 0.3;
            let control2X = constrain(width * 0.85, 50, width - 50);
            let control2Y = height * 0.7;
            
            let t2 = t * t; // t Squared
            let t3 = t2 * t; // t Cubed
            let mt = 1 - t; // 1 - t
            let mt2 = mt * mt; // (1 - t) Squared
            let mt3 = mt2 * mt; // (1 - t) Cubed
            
            let x = startX * mt3 + control1X * 3 * mt2 * t + control2X * 3 * mt * t2 + endX * t3; // Calculate X Position
            let y = startY * mt3 + control1Y * 3 * mt2 * t + control2Y * 3 * mt * t2 + endY * t3; // Calculate Y Position
            
            let waveOffset = 0;
            if (t > 0.1 && t < 0.9) {
                let waveFreq = map(t, 0.1, 0.9, 3, 6);
                let waveAmp = map(level, 0, 1, 30, 80);
                waveOffset += sin(t * PI * waveFreq + time) * waveAmp; // Add Wave Effect
            }
            
            let curveAngle = atan2(control2Y - control1Y, control2X - control1X); // Calculate Curve Angle
            let perpAngle = curveAngle + PI/2; // Perpendicular Angle
            x += cos(perpAngle) * waveOffset; // Apply Perpendicular Offset
            y += sin(perpAngle) * waveOffset; // Apply Perpendicular Offset
            
            // Spectrum Based Variation
            let spectrumIndex = floor(map(t, 0, 1, 0, spectrum.length - 1)); // Get Spectrum Index
            let spectrumValue = spectrum[spectrumIndex] || 0;
            let spectrumOffset = map(spectrumValue, 0, 255, -10, 10); // Map Spectrum Value To Offset
            y += spectrumOffset; // Apply Spectrum Offset
            
            // Constrain The Final Position To Stay Within The Canvas Bounds
            x = constrain(x, 0, width);
            y = constrain(y, 0, height);
            
            points.push(createVector(x, y)); // Add Point To The Flowing Line
        }
        
        // Draw The Flowing Line
        beginShape();
        for (let i = 0; i < points.length; i++) { // Iterate Over Points
            let p = points[i]; // Get Current Point
            
            // Add Spiral Effect
            if (i < 30) {
                let spiralT = map(i, 0, 29, 0, 1); // Map Index To Spiral Range
                let angle = spiralT * PI * 2 + time; // Angle For Spiral Effect
                let spiralRadius = map(spiralT, 0, 1, 0, 40); // Radius For Spiral Effect
                p.x = width * 0.25 + cos(angle) * spiralRadius; // x Position In Spiral
                p.y = height * 0.75 + sin(angle) * spiralRadius; // y Position In Spiral
            } else if (i > points.length - 30) {
                let spiralT = map(i, points.length - 30, points.length - 1, 0, 1); // Map Index To Spiral Range
                let angle = spiralT * PI * 2 + time; // Angle For Spiral Effect
                let spiralRadius = map(spiralT, 0, 1, 40, 0); // Radius For Spiral Effect
                p.x = width * 0.75 + cos(angle) * spiralRadius; // x Position In Spiral
                p.y = height * 0.25 + sin(angle) * spiralRadius; // y Position In Spiral
            }
            
            p.x = constrain(p.x, 0, width); // Constrain x Position To Canvas Width
            p.y = constrain(p.y, 0, height); // Constrain y Position To Canvas Height
            
            vertex(p.x, p.y); // Draw Vertex For The Flowing Line
        }
        endShape();
        
        pop();
    };
}