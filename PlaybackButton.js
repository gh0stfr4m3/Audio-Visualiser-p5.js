// Draw The Playback Button
function PlaybackButton() {
    // Button Sizes And Layout
    this.buttonSize = 40;
    this.buttonPadding = 12;
    this.y = height - this.buttonSize - 20;
    this.hovered = {speed: false, prev: false, play: false, next: false, timebar: false}; // Hover States

    // Time Bar Properties
    this.timebarWidth = 500; // Width Of Time Bar
    this.timebarHeight = 6; // Height Of Time Bar
    this.timebarY = this.y - 50;
    this.timebarRadius = 3;
    this.isDragging = false;
    this.trackLabelX = 0;
    this.currentTrackLabel = ""; // Initialise Current Track Label

    // Button Positions
    this.updatePosition = function() {
        this.centerX = width/2;
        this.y = height - this.buttonSize - 20;
        this.speedX = this.centerX - (this.buttonSize * 2) - (this.buttonPadding * 2) - 55;
        this.prevX = this.centerX - this.buttonSize - this.buttonPadding;
        this.playX = this.centerX;
        this.nextX = this.centerX + this.buttonSize + this.buttonPadding;

        // Update Timebar Position
        this.timebarY = this.y - 50;
        this.timebarX = this.centerX - this.timebarWidth/2;
    };

    this.updatePosition();

    // Helper Functions to Reduce Redundancy
    this.stopMicrophoneAndUpdateInput = function() {
        if (mic.enabled) {
            mic.stop();
        }
        fourier.setInput(sounds[currentTrackIndex]);
        soundAmplitude.setInput(sounds[currentTrackIndex]);
    };

    this.applySpeedToCurrentTrack = function() {
        if (sounds.length > 0 && isPlaying) {
            sounds[currentTrackIndex].rate(speedOptions[currentSpeedIndex]); // Apply Speed
        }
    };

    this.switchTrack = function(direction) {
        if (sounds.length === 0 || useMicInput) return;

        this.stopMicrophoneAndUpdateInput();
        sounds[currentTrackIndex].stop();
        
        if (direction === "prev") {
            currentTrackIndex = (currentTrackIndex - 1 + sounds.length) % sounds.length; // Wrap Around
        } else {
            currentTrackIndex = (currentTrackIndex + 1) % sounds.length;
        }

        fourier.setInput(sounds[currentTrackIndex]); // Set Fourier Transform Input
        soundAmplitude.setInput(sounds[currentTrackIndex]); // Set Amplitude Input
        
        if (isPlaying) {
            sounds[currentTrackIndex].rate(speedOptions[currentSpeedIndex]); // Apply Speed
            sounds[currentTrackIndex].loop(); // Loop Track
        }
    };

    this.draw = function() {
        // Draw Current Track Info
        let emoji = "";
        let trackText = "";

        if (useMicInput) {
            emoji = "🎙️"; // Mic Symbol
            trackText = " Microphone Input";
        } else if (sounds.length > 0) {
            if (currentTrackIndex < uploadedFileNames.length) {
                emoji = "📁"; // Uploaded File Symbol
                trackText = " " + uploadedFileNames[currentTrackIndex];
            } else {
                let builtInTrackNumber = currentTrackIndex - uploadedFileNames.length + 1;
                emoji = "🎵"; // Music Icon
                trackText = " Track " + builtInTrackNumber;
            }
        } else {
            trackText = "No Track";
        }

        let fullLabel = emoji + trackText;

        if (fullLabel !== this.currentTrackLabel) {
            this.currentTrackLabel = fullLabel;
            this.trackLabelX = this.timebarX + this.timebarWidth;
        }

        push();
        fill(255);
        textSize(22);
        textAlign(LEFT, BOTTOM);

        // Clipping Region For Track Info
        drawingContext.save();
        drawingContext.beginPath();
        drawingContext.rect(this.timebarX + 80, this.timebarY - 40, this.timebarWidth - 145, 500);
        drawingContext.clip();

        textFont("system"); // Draw Emoji
        let emojiWidth = textWidth(emoji);
        text(emoji, this.trackLabelX, this.timebarY - 11.5);

        textFont(myFont); // Custom Font
        text(trackText, this.trackLabelX + emojiWidth + 5, this.timebarY - 12);

        drawingContext.restore();

        this.trackLabelX -= 1;
        let textW = textWidth(fullLabel);
        if (this.trackLabelX < this.timebarX - textW) {
            this.trackLabelX = this.timebarX + this.timebarWidth;
        }
        pop();

        // Draw Timebar
        if (!useMicInput && sounds.length > 0) {
            this.drawTimeBar();
        }

        // Draw Buttons
        this.drawSpeedButton();
        this.drawButton(this.prevX, this.y, "prev", this.hovered.prev);
        this.drawButton(this.playX, this.y, "play", this.hovered.play);
        this.drawButton(this.nextX, this.y, "next", this.hovered.next);
    };

    this.drawButton = function(x, y, type, hovered) {
        push();
        translate(x, y);
        noStroke();

        // Disable Buttons
        let isDisabled = useMicInput && (type === "play" || type === "prev" || type === "next");
        if (isDisabled) {
            fill(color(40, 40, 40, 100)); // Dimmed When Disabled
        } else {
            if (hovered) {
                fill(color(255, 200, 0, 220));
            } else {
                fill(color(40, 40, 40, 200));
            }
        }
        
        rectMode(CENTER);
        if (type === "play") {
            rect(0, 0, this.buttonSize + 8, this.buttonSize, 12); // Play Button
        } else if (type === "prev") {
            rect(-3, 0, this.buttonSize + 8, this.buttonSize, 12); // Prev Button
        } else if (type === "next") {
            rect(3, 0, this.buttonSize + 8, this.buttonSize, 12); // Next Button
        }

        // Icon
        if (isDisabled) {
            fill(100); // Dimmed When Disabled
        } else {
            if (hovered) {
                fill(40);
            } else {
                fill(255);
            }
        }
        
        if (type === "play") {
            if (isPlaying) {
                // Pause Icon
                rect(-5, 0, 7, 20, 3);
                rect(5, 0, 7, 20, 3);
            } else {
                // Play Icon
                triangle(-10, -12, 14, 0, -10, 12);
            }
        } else if (type === "prev") {
            // Prev Icon
            triangle(8, -12, -8, 0, 8, 12);
            triangle(-4, -12, -20, 0, -4, 12);
        } else if (type === "next") {
            // Next Icon
            triangle(-8, -12, 8, 0, -8, 12);
            triangle(4, -12, 20, 0, 4, 12);
        }
        pop();
    };

    this.drawSpeedButton = function() {
        push();
        translate(this.speedX, this.y);
        noStroke();

        // Disable Speed Button When Mic Is Active
        let isDisabled = useMicInput;
        if (isDisabled) {
            fill(color(40, 40, 40, 100)); // Dimmed When Mic Is Disabled
        } else {
            if (this.hovered.speed) {
                fill(color(68, 215, 168));
            } else {
                fill(color(40, 40, 40, 200));
            }
        }
        
        rectMode(CENTER);
        rect(0, 0, this.buttonSize + 25, this.buttonSize, 12); // Speed Button

        // Speed Text
        if (isDisabled) {
            fill(100); // Dimmed When Disabled
        } else {
            if (this.hovered.speed) {
                fill(40);
            } else {
                fill(255);
            }
        }
        
        textAlign(CENTER, CENTER);
        textSize(18);
        textFont(myFont);
        text(speedLabels[currentSpeedIndex], 0, 0); // Display Current Speed
        
        pop();
    };

    // Draw Time Bar
    this.drawTimeBar = function() {
        if (!sounds[currentTrackIndex]) return;
        
        let currentSound = sounds[currentTrackIndex];
        let currentTime = currentSound.currentTime();
        let duration = currentSound.duration();

        // Handle Invalid Duration
        if (!duration || duration <= 0) {
            duration = 1; // Default To Prevent Division By Zero
        }
        
        let progress = currentTime/duration;
        progress = constrain(progress, 0, 1);
        
        push();
        // Draw Time Labels
        this.drawTimeLabels(currentTime, duration);

        // Draw Background Bar
        noStroke();
        fill(100, 100, 100, 150);
        rectMode(CORNER);
        rect(this.timebarX, this.timebarY, this.timebarWidth, this.timebarHeight, this.timebarRadius);

        // Draw Progress Bar
        if (progress > 0) {
            let progressColor;
            if (this.hovered.timebar || this.isDragging) {
                progressColor = color(255, 200, 0);
            } else {
                progressColor = color(255, 255, 255);
            }
            fill(progressColor);
            rect(this.timebarX, this.timebarY, this.timebarWidth * progress, this.timebarHeight, this.timebarRadius);
        }

        // Draw Hover Circle
        if (this.hovered.timebar || this.isDragging) {
            fill(255, 200, 0);
            noStroke();
            let circleX = this.timebarX + (this.timebarWidth * progress);
            ellipse(circleX, this.timebarY + this.timebarHeight/2, 12);
            
            // Inner Circle
            fill(255, 255, 255);
            ellipse(circleX, this.timebarY + this.timebarHeight/2, 6);
        }
        
        pop();
    };
    
    // Draw Time Labels
    this.drawTimeLabels = function(currentTime, duration) {
        push();
        textAlign(LEFT);
        textFont(myFont);
        textSize(16);
        fill(255);
        
        // Current Time
        let currentTimeStr = this.formatTime(currentTime);
        text(currentTimeStr, this.timebarX, this.timebarY - 8);
        
        // Total Duration
        textAlign(RIGHT);
        let durationStr = this.formatTime(duration);
        text(durationStr, this.timebarX + this.timebarWidth, this.timebarY - 8);
        
        pop();
    };
    
    this.formatTime = function(seconds) {
        if (!seconds || isNaN(seconds)) // Handle NaN or Undefined
            return "0:00";
        
        let mins = Math.floor(seconds/60); // Calculate Minutes
        let secs = Math.floor(seconds % 60); // Calculate Remaining Seconds
        let secsStr = "";
        if (secs < 10) {
            secsStr = "0";
        } else {
            secsStr = "";
        }
        return mins + ":" + secsStr + secs;
    };

    // Mouse Hit Detection
    this.hitCheck = function() {
        this.updatePosition();
        let mx = mouseX, my = mouseY;

        // Check Time Bar
        if (!useMicInput && sounds.length > 0 && this.inTimeBar(mx, my)) {
            this.onTimeBarClick(mx);
            return true;
        }
        // Check Speed Button
        if (this.inSpeedButton(mx, my, this.speedX, this.y)) {
            this.onSpeed();
            return true;
        }
        // Check Other Buttons
        let buttonChecks = [
            {x: this.prevX, y: this.y, action: () => this.onPrev()},
            {x: this.playX, y: this.y, action: () => this.onPlayPause()},
            {x: this.nextX, y: this.y, action: () => this.onNext()}
        ];
        
        for (let button of buttonChecks) {
            if (this.inButton(mx, my, button.x, button.y)) { // Check If Mouse Is Over Button
                button.action();
                return true;
            }
        }
        return false;
    };

    // Hit Detection Functions
    this.inButton = function(mx, my, bx, by) {
        return mx > bx - this.buttonSize/2 && mx < bx + this.buttonSize/2 &&
               my > by - this.buttonSize/2 && my < by + this.buttonSize/2;
    };
    
    // Speed Button Hit Detection
    this.inSpeedButton = function(mx, my, bx, by) {
        return mx > bx - (this.buttonSize + 25)/2 && mx < bx + (this.buttonSize + 25)/2 &&
               my > by - this.buttonSize/2 && my < by + this.buttonSize/2;
    };
    
    // Time Bar Hit Detection
    this.inTimeBar = function(mx, my) {
        return mx > this.timebarX && mx < this.timebarX + this.timebarWidth &&
               my > this.timebarY - 10 && my < this.timebarY + this.timebarHeight + 10;
    };
    
    // Handle Clicks On Time Bar
    this.onTimeBarClick = function(mx) {
        if (!sounds[currentTrackIndex]) return;
        
        let progress = (mx - this.timebarX)/this.timebarWidth;
        progress = constrain(progress, 0, 1);
        
        let duration = sounds[currentTrackIndex].duration();
        if (duration && duration > 0) {
            let seekTime = progress * duration;
            sounds[currentTrackIndex].jump(seekTime);
        }
    };

    // Hover State
    this.updateHover = function() {
        this.updatePosition();
        let mx = mouseX, my = mouseY;
        this.hovered.speed = this.inSpeedButton(mx, my, this.speedX, this.y);
        this.hovered.prev = this.inButton(mx, my, this.prevX, this.y);
        this.hovered.play = this.inButton(mx, my, this.playX, this.y);
        this.hovered.next = this.inButton(mx, my, this.nextX, this.y);
        this.hovered.timebar = !useMicInput && sounds.length > 0 && this.inTimeBar(mx, my);
    };

    // Button Actions
    this.onPlayPause = function() {
       if (sounds.length === 0 || useMicInput) return;

       if (isPlaying) {
           sounds[currentTrackIndex].pause();
           isPlaying = false;
       } else {
           this.stopMicrophoneAndUpdateInput();

           // Stop All Other Tracks
           for (let i = 0; i < sounds.length; i++) {
               if (i !== currentTrackIndex) sounds[i].stop();
           }
           
           sounds[currentTrackIndex].rate(speedOptions[currentSpeedIndex]);
           sounds[currentTrackIndex].loop();
           isPlaying = true;
       }
    };

    this.onPrev = function() {
       this.switchTrack("prev"); // Switch To Previous Track
    };

    this.onNext = function() {
       this.switchTrack("next"); // Switch To Next Track
    };

    this.onSpeed = function() {
       if (useMicInput) return; // Do Not Allow Speed Control When Mic is Active

       // Play Click Sound
       if (clickSound) clickSound.play();

       // Cycle To Next Speed
       currentSpeedIndex = (currentSpeedIndex + 1) % speedOptions.length;

       // Apply New Speed To Currently Playing Track
       this.applySpeedToCurrentTrack();
    };
}