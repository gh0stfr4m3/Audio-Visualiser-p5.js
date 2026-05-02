function SquidGame() {
    this.name = "Squid Game"; // Name Of The Visualisation
    
    this.draw = function() {
        let spectrum = fourier.analyze(); // Get Frequency Spectrum
        let level = soundAmplitude.getLevel(); // Get Sound Amplitude Level
        
        push();
        translate(width/2, height/2); // Centre The Visualisation
        
        let segments = 8;
        for (let seg = 0; seg < segments; seg++) {
            push();
            rotate(map(seg, 0, segments, 0, TWO_PI)); // Rotate Each Segment
            
            // Draw Geometric Shapes Based On Frequency Spectrum
            for (let i = 0; i < 20; i++) {
                let spectrumIndex = map(i, 0, 20, 0, spectrum.length);
                let energy = spectrum[Math.floor(spectrumIndex)];
                
                let x = map(i, 0, 20, 50, 300); // x Position
                let y = map(energy, 0, 255, -100, 100); // y Position Based On Energy
                let size = map(energy, 0, 255, 5, 30); // Size Based On Energy
                
                // Alternate Between Different Shapes
                if (i % 3 === 0) {
                    // Triangle
                    fill(255, 100, 150, map(energy, 0, 255, 50, 200));
                    noStroke();
                    triangle(x, y, x + size, y + size, x - size, y + size);
                } else if (i % 3 === 1) {
                    // Circle
                    fill(100, 200, 255, map(energy, 0, 255, 50, 200));
                    noStroke();
                    ellipse(x, y, size);
                } else {
                    // Square
                    fill(255, 200, 100, map(energy, 0, 255, 50, 200));
                    noStroke();
                    rectMode(CENTER);
                    rect(x, y, size, size);
                }
            }
            pop();
        }
        pop();
    };
}