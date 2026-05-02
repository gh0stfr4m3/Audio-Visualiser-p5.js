function FrequencyRings() {
    this.name = "Frequency Rings"; // Name Of The Visualisation

    // Beat Detection Properties
    this.sampleBuffer = []; // Buffer For Sampled Energy Values
    this.beatThreshold = 1.08;
    this.beatDecay = 0.97;
    this.beatCooldown = 5;
    this.beatIntensity = 0;
    this.lastBeatTime = 0;
    this.beatCooldown = 5;

    // Colour Palette
    this.colorPalettes = [
        [color(255, 50, 50), color(255, 150, 50), color(255, 255, 50), color(255, 100, 255)], // Bass Palette
        [color(50, 255, 50), color(50, 255, 255), color(100, 100, 255), color(255, 100, 100)], // Mid Palette
        [color(255, 100, 255), color(100, 255, 255), color(255, 255, 100), color(255, 150, 100)], // Treble Palette
        [color(255, 0, 100), color(100, 0, 255), color(0, 255, 200), color(255, 200, 0)]  // Dynamic Palette
    ];

    // Current Colour State
    this.currentPalette = 0;
    this.colorTransition = 0;
    this.targetColors = [];
    this.currentColors = [];

    // Frequency Bands & Their Properties
    this.frequencyBands = [
        {name: "Bass", radius: 50},
        {name: "Low Mid", radius: 75},
        {name: "High Mid", radius: 110},
        {name: "Treble", radius: 150}
    ];
    
    // Animation Properties
    this.rotation = 0;
    this.pulseScale = 1;
    this.pulseDirection = 1;
    this.colorShift = 0;
    
    // Initialise Colours
    this.initColors = function() {
        this.currentColors = [];
        this.targetColors = [];
        for (let i = 0; i < this.frequencyBands.length; i++) {
            this.currentColors.push(this.colorPalettes[0][i]); // Start With Bass Palette
            this.targetColors.push(this.colorPalettes[0][i]);
        }
    };
    
    this.initColors();
    
    this.draw = function() {
        push();
        translate(width/2, height/2 - 50); // Centre The Visualisation

        // Get Frequency Data
        let bassEnergy = fourier.getEnergy("bass");
        let lowMidEnergy = fourier.getEnergy("lowMid");
        let highMidEnergy = fourier.getEnergy("highMid");
        let trebleEnergy = fourier.getEnergy("treble");
        
        let energies = [bassEnergy, lowMidEnergy, highMidEnergy, trebleEnergy];
        
        // Beat Detection
        this.detectBeat(energies);

        // Update Colour Transitions
        this.updateColors();

        // Update Pulse Animation
        this.pulseScale += 0.02 * this.pulseDirection; // Pulse Scale Animation
        if (this.pulseScale > 1.2 || this.pulseScale < 0.8) {
            this.pulseDirection *= -1;
        }

        // Update Rotation & Colour Shift
        this.rotation += 0.01;
        this.colorShift += 0.5;

        // Draw Frequency Rings
        for (let i = 0; i < this.frequencyBands.length; i++) {
            this.drawRing(this.frequencyBands[i], energies[i], i);
        }

        // Draw Central Pulse
        this.drawCentralPulse();
        
        pop();
    };
    
    this.detectBeat = function(energies) {
        // Calculate Energy
        let totalEnergy = 0;
        for (let i = 0; i < energies.length; i++) {
            totalEnergy += energies[i];
        }
        totalEnergy = totalEnergy / energies.length;

        // Add To Sample Buffer
        this.sampleBuffer.push(totalEnergy);
        if (this.sampleBuffer.length > 30) {
            this.sampleBuffer.shift();
        }

        // Beat Detection Logic
        if (this.sampleBuffer.length >= 30) {
            let average = 0;
            for (let i = 0; i < this.sampleBuffer.length; i++) {
                average += this.sampleBuffer[i];
            }
            average = average / this.sampleBuffer.length;
            
            let variance = 0;
            for (let i = 0; i < this.sampleBuffer.length; i++) {
                variance += (this.sampleBuffer[i] - average) * (this.sampleBuffer[i] - average);
            }
            variance = variance / this.sampleBuffer.length;

            // Dynamic Threshold Based on Variance
            let dynamicThreshold = this.beatThreshold + (variance/1000);
            
            if (totalEnergy > average * dynamicThreshold && frameCount - this.lastBeatTime > this.beatCooldown) {
                this.onBeatDetected(energies); // Trigger Beat Detected Logic
                this.lastBeatTime = frameCount; // Update Last Beat Time
            }
        }

        // Decay Beat Intensity
        this.beatIntensity *= this.beatDecay;
    };
    
    this.onBeatDetected = function(energies) {
        // Increase Beat Intensity
        this.beatIntensity = 1.0;

        // Determine Dominant Frequency Band
        let maxEnergy = Math.max.apply(null, energies); // Find Maximum Energy
        let dominantBand = energies.indexOf(maxEnergy);

        // Select Color Palette
        if (dominantBand === 0) { // Bass
            this.currentPalette = 0;
        } else if (dominantBand === 1 || dominantBand === 2) { // Mid Frequencies
            this.currentPalette = 1;
        } else { // Treble
            this.currentPalette = 2;
        }

        // Add Some Randomness
        if (Math.random() < 0.3) {
            this.currentPalette = 3; // Dynamic Palette
        }

        // Set New Target Colours
        this.targetColors = this.colorPalettes[this.currentPalette].slice();

        // Reset Colour Transition
        this.colorTransition = 0;
    };
    
    this.updateColors = function() {
        // Smooth Colour Transitions
        this.colorTransition += 0.1;
        if (this.colorTransition > 1) this.colorTransition = 1;
        
        for (let i = 0; i < this.currentColors.length; i++) {
            this.currentColors[i] = lerpColor(this.currentColors[i], this.targetColors[i], this.colorTransition);
        }
    };
    
    this.drawRing = function(band, energy, index) {
        push();
        
        // Calculate Ring Properties
        let ringRadius = band.radius * map(energy, 0, 255, 0.5, 2);
        let ringOpacity = map(energy, 0, 255, 50, 255);
        let ringThickness = map(energy, 0, 255, 2, 8);

        // Apply Pulse Effect
        let beatPulse = 1 + (this.beatIntensity * 0.3);
        ringRadius *= this.pulseScale * beatPulse;

        // Get Current Colour
        let currentColor = this.currentColors[index];
        let beatColor = lerpColor(currentColor, color(255, 255, 255), this.beatIntensity * 0.5);

        // Draw Outer Ring
        noFill();
        if (this.beatIntensity > 0.1) {
            // Beat glow effect
            stroke(beatColor.levels[0], beatColor.levels[1], beatColor.levels[2], ringOpacity * this.beatIntensity);
            strokeWeight(ringThickness * 2);
            ellipse(0, 0, ringRadius * 2.2);
        }
        
        stroke(beatColor.levels[0], beatColor.levels[1], beatColor.levels[2], ringOpacity);
        strokeWeight(ringThickness);
        ellipse(0, 0, ringRadius * 2);

        // Draw Inner Ring
        push();
        rotate(this.rotation * (index + 1));
        stroke(beatColor.levels[0], beatColor.levels[1], beatColor.levels[2], ringOpacity * 0.7);
        strokeWeight(ringThickness * 0.5);
        ellipse(0, 0, ringRadius * 1.5);
        pop();

        // Draw Beat Particles Around The Ring
        if (this.beatIntensity > 0.3) {
            this.drawBeatParticles(ringRadius, beatColor, index);
        }
        
        pop();
    };
    
    this.drawBeatParticles = function(radius, color, index) {
        push();
        noStroke();
        fill(color.levels[0], color.levels[1], color.levels[2], this.beatIntensity * 255); // Particle Colour Based On Beat Intensity
        
        let particleCount = 8; // Number Of Particles Around The Ring
        for (let i = 0; i < particleCount; i++) {
            let angle = (TWO_PI/particleCount) * i + this.rotation * (index + 1); // Angle Offset
            let x = cos(angle) * radius * 1.3; // Adjust Radius For Particles
            let y = sin(angle) * radius * 1.3;
            let size = this.beatIntensity * 8; // Particle Size Based On Beat Intensity
            
            ellipse(x, y, size); // Draw Particle
        }
        pop();
    };
    
    this.drawCentralPulse = function() {
        let level = soundAmplitude.getLevel(); // Get Sound Level
        let pulseSize = map(level, 0, 1, 10, 50); // Pulse Size Based On Sound Level
        
        noStroke();

        // Outer pulse
        if (this.beatIntensity > 0.2) {
            fill(255, 255, 255, this.beatIntensity * 150);
            ellipse(0, 0, pulseSize * 3); // Outer Pulse Glow
        }
        
        // Main Pulse
        let pulseColor = lerpColor(color(255, 200, 0), color(255, 255, 255), this.beatIntensity); // Pulse Color Based On Beat Intensity
        fill(pulseColor.levels[0], pulseColor.levels[1], pulseColor.levels[2], map(level, 0, 1, 50, 200));
        ellipse(0, 0, pulseSize); // Main Pulse Circle
        
        // Inner Core
        fill(255, 255, 255, map(level, 0, 1, 100, 255));
        ellipse(0, 0, pulseSize * 0.3);
    };
}