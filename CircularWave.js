function CircularWave() {
    this.name = "Circular Wave"; // Name Of The Visualisation

    this.draw = function() {
        push();
        translate(width/2, height/2 - 50); // Position The Circle
        let wave = fourier.waveform(); // Array Of Amplitutde Values

        noFill();
        // Colour Scheme
        let circleColor = lerpColor(color(255, 215, 100), color(120, 180, 255), sin(frameCount * 0.04) * 0.5 + 0.5);
        stroke(circleColor); // Set Stroke Colour
        strokeWeight(2); // Set Stroke Weight

        beginShape();
        for (let i = 0; i < wave.length; i++) {
            let angle = map(i, 0, wave.length, 0, TWO_PI); // Map Index Value To Angle
            let radius = map(wave[i], -1, 1, 60, 180); // Reduced radius range for smaller size
            let x = radius * cos(angle); // Calculate x Position Based On Radius & Angle
            let y = radius * sin(angle); // Calculate y Position Based On Radius & Angle
            vertex(x, y); // Draw The Vertex
        }
        endShape(CLOSE); // Close The Shape To Form A Complete Circle
        pop();
    };
}