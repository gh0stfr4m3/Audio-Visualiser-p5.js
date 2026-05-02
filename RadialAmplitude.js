function RadialAmplitude() {
    this.name = "Radial Amplitude"; // Name Of The Visualisation
    let volHistory = []; // Array To Store Volume Levels

    this.draw = function() {
        let vol = soundAmplitude.getLevel(); // Get The Current Volume Level
        volHistory.push(vol); // Add Volume Level To volHistory

        if (volHistory.length > 360) {
            volHistory.splice(0, 1); // Remove The First Volume Level If Length Of Array Exceeds 360
        }

        push();
        noFill();
        // Volume Based Color Variation
        let volColor = lerpColor(color(255, 215, 100), color(120, 180, 255), sin(frameCount * 0.03 + vol * 10) * 0.5 + 0.5);
        stroke(volColor);
        strokeWeight(2);
        translate(width/2, height/2 - 50); // Centre The Visualisation
        beginShape();
        for (let i = 0; i < volHistory.length; i++) {
            let r = map(volHistory[i], 0, 1, 10, 600); // Map Volume Level To Radius
            let angle = map(i, 0, 360, 0, TWO_PI); // Map Index Value To Angle
            let x = r * cos(angle); // Calculate x Position Based On Radius & Angle
            let y = r * sin(angle); // Calculate y Position Based On Radius & Angle
            vertex(x, y); // Draw The Vertex
        }
        endShape();
        pop();
    };
}