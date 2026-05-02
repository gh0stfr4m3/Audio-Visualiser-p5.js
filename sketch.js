// Global Variables
let controls = null;
let vis = null;
let sounds = []; // Array To Store Loaded Sounds
let scrollSound;
let clickSound;
let fourier;
let startMenu = true;
let selectedVisualIndex = 0;
let volumeSlider;
let soundAmplitude;
let fileInput;
let uploadedSounds = []; // Array To Store Uploaded Sounds
let uploadedFileNames = []; // Array To Store Uploaded File Names
let currentTrackIndex = 0; // Index Of Currently Playing Track
let isPlaying = false;
let particleSystem;
let mic; // Microphone Input
let micFourier; // FFT For Microphone Input
let useMicInput = false; // Track Whether To Use Microphone Input
let inputToggleButton; // UI Button For Microphone Input
let instructionsVisible = false; // Track Whether Instructions Are Visible
let instructionButtonAnim = {scale: 1, y: 0}; // Smooth Animation For Instructions Button
let speedButton;
let currentSpeedIndex = 1; // Start At 1x speed
let speedOptions = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0]; // Available Speed Options
let speedLabels = ["0.75x", "1x", "1.25x", "1.5x", "1.75x", "2x"]; // Display Labels

// Function To Manage Microphone State
function manageMicState(shouldUseMic) {
    if (shouldUseMic) {
        mic.start(); // Start The Microphone
        fourier.setInput(mic); // FFT For Microphone
        soundAmplitude.setInput(mic); // Volume
    } else {
        mic.stop(); // Stop The Microphone
        if (sounds[currentTrackIndex]) { // Check If There Are Sounds Loaded
            fourier.setInput(sounds[currentTrackIndex]); // Set FFT Input To Current Track
            soundAmplitude.setInput(sounds[currentTrackIndex]);
        }
    }
}

// Loading Sound Files & Font
function preload() {
	sounds.push(loadSound("assets/Audio1.mp3"));
  	sounds.push(loadSound("assets/Audio2.mp3"));
  	sounds.push(loadSound("assets/Audio3.mp3"));
	sounds.push(loadSound("assets/Audio4.mp3"));
	sounds.push(loadSound("assets/Audio5.mp3"));
	scrollSound = loadSound("assets/SoundEffect1.mp3"); // Sound For Scrolling Through Visualisations
	clickSound = loadSound("assets/SoundEffect2.mp3"); // Sound For Clicking Buttons
	myFont = loadFont("assets/myFont.ttf"); // Load Custom Font
}

// File Upload
function createFileUpload() {
    fileInput = createFileInput(handleFile); // Create File Input Button
    fileInput.position(20, 20); // Top left position
    
    fileInput.style("background-color", "rgba(20, 24, 37, 0.9)"); // Background Colour
    fileInput.style("color", "#ffffff"); // Text Color
    fileInput.style("border", "2px solid rgba(0, 229, 255, 0.8)"); // Border Colour
    fileInput.style("border-radius", "25px"); // Curved Edges
    fileInput.style("padding", "6px 12px"); // Padding
    fileInput.style("font-family", "myFont"); // Custom Font
    fileInput.style("font-size", "12px"); // Font Size
    fileInput.style("cursor", "pointer"); // Pointer Cursor
    fileInput.style("transition", "all 0.3s ease");
    fileInput.style("width", "187px"); // Width
    fileInput.style("text-align", "center"); // Centre Text
    
    // Hover Effect
    fileInput.mouseOver(() => {
        fileInput.style("background-color", "rgba(30, 38, 56, 0.95)"); // Brighter Background On Hover
        fileInput.style("border-color", "rgba(0, 229, 255, 1)"); // Brighter Border On Hover
        fileInput.style("transform", "translateY(-1px) scale(1.01)"); // Slightly Move Up On Hover
    });
    
    // Mouse Out Effect
    fileInput.mouseOut(() => {
        fileInput.style("background-color", "rgba(20, 24, 37, 0.9)"); // Back To Original Background
        fileInput.style("border-color", "rgba(0, 229, 255, 0.8)"); // Back To Original Border
        fileInput.style("transform", "translateY(0px) scale(1)"); // Back To Original Position
    });
    
    fileInput.attribute("accept", "audio/*"); // Accept Only Audio Files

    // Play Click Sound On Mouse Press
    fileInput.mousePressed(() => {
        if (clickSound) clickSound.play();
    });
}

// Handle Uploaded Sound Files
function handleFile(file) {
    if (file.type === "audio") {
        let uploadedSound = loadSound(file.data, () => {
            // Add The Uploaded Sound To The Sounds Array
            sounds.unshift(uploadedSound);
            uploadedSounds.push(uploadedSound);
            
            // Store The File Name Without Extension Type
            let fileName = file.name;
            if (fileName.includes(".")) {
                fileName = fileName.substring(0, fileName.lastIndexOf("."));
            }

            uploadedFileNames.unshift(fileName); // Store File Name
            currentTrackIndex = 0; // Set Current Track Index To The New Uploaded Track
            fourier.setInput(uploadedSound); // Set FFT Input To The Uploaded Sound
            soundAmplitude.setInput(uploadedSound);
            
            // Stop Any Currently Playing Track When A New File Is Uploaded
            if (isPlaying) {
                sounds[currentTrackIndex].stop();
                isPlaying = false;
            }

            // Apply Current Speed Setting
            uploadedSound.rate(speedOptions[currentSpeedIndex]);
        });
    }
}

// Setup Function
function setup() {
    createCanvas(windowWidth, windowHeight); // Create The Canvas
    controls = new ControlsAndInput(); // Create The Controls
    fourier = new p5.FFT(); // Create The FFT Object
	soundAmplitude = new p5.Amplitude(); // Create The Amplitude Object

    mic = new p5.AudioIn(); // Create The Microphone Input
    micFourier = new p5.FFT(); // Create The FFT For Microphone Input
    micFourier.setInput(mic); // Set The FFT Input To The Microphone

    // Container For Visualisations
    vis = new Visualisations();
    vis.add(new WavePattern());
    vis.add(new Spectrum());
    vis.add(new Needles());
    vis.add(new RidgelinePlots());
	vis.add(new BeatBlocks());
	vis.add(new RadialAmplitude());
	vis.add(new CircularWave());
	vis.add(new BeatDance());
	vis.add(new FrequencyRings());
    vis.add(new MirroredBars());
    vis.add(new GradientBars());
    vis.add(new RingBars());
    vis.add(new SquidGame());
    vis.add(new BlackHole());
    vis.add(new MouseTrail());

	vis.selectVisual(vis.visuals[selectedVisualIndex].name); // Set The Selected Visualisation
	controls.playbackButton = new PlaybackButton(); // Create The Playback Button

    inputToggleButton = createButton("🎙️"); // Create Button
    inputToggleButton.position(width - 90, 20);
    inputToggleButton.style("background-color", "rgba(20, 24, 37, 0.85)"); // Default Background Color
    inputToggleButton.style("color", "#fff"); // Text Color
    inputToggleButton.style("border", "2px solid #00e5ff");
    inputToggleButton.style("border-radius", "50%"); // Circular Button
    inputToggleButton.style("padding", "0px");
    inputToggleButton.style("font-family", "myFont"); // Custom Font
    inputToggleButton.style("font-size", "24px"); // Font Size
    inputToggleButton.style("width", "50px"); // Width Of Button
    inputToggleButton.style("height", "50px"); // Height Of Button
    inputToggleButton.style("display", "flex");
    inputToggleButton.style("align-items", "center"); // Centre Vertically
    inputToggleButton.style("justify-content", "center"); // Centre Horizontally

    inputToggleButton.mousePressed(() => {
        if (clickSound) clickSound.play(); // Play Click Sound
        useMicInput = !useMicInput;
        if (useMicInput) {
            // Stop Any Currently Playing Track When Microphone Is Activated
            if (isPlaying) {
                sounds[currentTrackIndex].stop();
                isPlaying = false;
            }
        }
    
        manageMicState(useMicInput); // Manage Microphone State

        // Button Appearance
        if (useMicInput) {
            inputToggleButton.html("🎙️");
            inputToggleButton.style("background-color", "rgba(226, 62, 146, 0.9)"); // When Mic Is Active
        } else {
            inputToggleButton.html("🎙️");
            inputToggleButton.style("background-color", "rgba(20, 24, 37, 0.85)"); // When Mic Is Inactive
        }
    });

    inputToggleButton.hide(); // Only Show In Main UI
	createFileUpload(); // Create File Upload
	particleSystem = new ParticleSystem(); // Create Particle System
    controls.volumeSlider.hide(); // Hide Volume Slider On Start Menu
}

// Function To Draw A Gradient Background
function drawGradientBackground(c1, c2) { // Takes 2 Colours As Parameters
	for (let y = 0; y < height; y++) {
		let amt = map(y, 0, height, 0, 1); // Blend Amount
		let gradientColour = lerpColor(c1, c2, amt); // Blend The Two Colours
		stroke(gradientColour); // Set The Stroke Colour To The Gradient Colour
		line(0, y, width, y); // Horizontal Line Across The Canvas
	}
}

// Draw Function
function draw() {
	// Analyse The Sound
	fourier.analyze();

    // Gradient Background
    drawGradientBackground(color(12, 22, 47), color(35, 10, 45));

    if (startMenu) {
        fileInput.show(); // Show File Input Button
        inputToggleButton.hide(); // Hide Microphone Input Button
        controls.volumeSlider.hide(); // Hide Volume Slider
        particleSystem.update(); // Update Particle System
        particleSystem.draw(); // Draw Particle System
        drawStartMenu(); // Call drawStartMenu() Function
    } else {
        fileInput.hide(); // Hide File Input Button
        inputToggleButton.show(); // Show Microphone Input Button
        controls.volumeSlider.show(); // Show Volume Slider
        inputToggleButton.position(width - 90, 20);
        vis.selectedVisual.draw(); // Draw Selected Visualisation
        controls.playbackButton.updateHover(); // Update Playback Button Hover State
        controls.draw(); // Draw Controls
    }
}

// Draw The Start Menu
function drawStartMenu() {
	push();

	// Gradient Effect For Start Menu
	let menuGradient = drawingContext.createLinearGradient(0, 0, 0, height);
	menuGradient.addColorStop(0, "rgba(0, 0, 0, 0.3)");
	menuGradient.addColorStop(0.5, "rgba(0, 0, 0, 0.1)");
	menuGradient.addColorStop(1, "rgba(0, 0, 0, 0.4)");
	drawingContext.fillStyle = menuGradient;
	noStroke();
	rect(0, 0, width, height);

	textAlign(CENTER);
	textSize(45); // Font Size
	textFont(myFont); // Custom Font

	// Title Glowing Effect
	let titleGlow = sin(frameCount * 0.02) * 0.3 + 0.7; // Glow Intensity
	noStroke();
	fill(255, 165, 0, 140 * titleGlow); // Orange Glow
	text("Music Visualiser", width/2 + 230, height/8 + 65); // Glow Offset

	// Main title
	fill(255, 215, 100); // Golden Yellow
	text("Music Visualiser", width/2 + 228, height/8 + 62); // Move Higher

	// Two Column Layout
	let leftColumnX = width * 0.35;
	let rightColumnX = width * 0.68;
	let menuStartY = height * 0.12;
	let itemSpacing = 50; // Spacing Between Items

	for (let i = 0; i < vis.visuals.length; i++) {
		let columnX;
		let columnIndex;
		if (i < 7) {
			columnX = leftColumnX;
			columnIndex = i;
		} else {
			columnX = rightColumnX;
			columnIndex = i - 7;
		}
		let y = menuStartY + columnIndex * itemSpacing;
	
		if (i >= 7) {
			y += 118;
		}

		textSize(25);
		
		// Highlight The Selected Visualisation
		if (i === selectedVisualIndex) {
			let highlightPulse = sin(frameCount * 0.1) * 0.2 + 0.8;
			noStroke();

			// Dynamic Highlight Dimensions Based On Text Length
			let visName = (i + 1) + ": " + vis.visuals[i].name;
			let textLength = visName.length;
			let highlightWidth = textLength * 12 + 140;
			let highlightHeight = 40;
			let highlightX = columnX - highlightWidth/2 - 5;
			let highlightY = y - highlightHeight/2 - 8.5;
			
			// Outer Glow Effect
			fill(0, 229, 255, 60 * highlightPulse);
			rect(highlightX - 10, highlightY - 5, highlightWidth + 20, highlightHeight + 10, 8);

			// Main Highlight Gradient Effect
			fill(0, 229, 255, 200 * highlightPulse);
			rect(highlightX, highlightY, highlightWidth, highlightHeight, 5);
			fill(25, 25, 35, 180);
			text((i + 1) + ": " + vis.visuals[i].name, columnX + 1, y + 1);
			fill(20, 24, 37);
			text((i + 1) + ": " + vis.visuals[i].name, columnX, y);
		} else {
			// Hover Effect
			let hoverEffect = 0.8 + 0.2 * sin(frameCount * 0.05 + i * 0.5);
			fill(255, 255, 255, 255 * hoverEffect);
			text((i + 1) + ": " + vis.visuals[i].name, columnX, y);
		}
	}

	// Instructions Button
	let buttonWidth = 187;
    let buttonHeight = 30;
    let buttonX = 20;
    let buttonY = 60;
	let rectW = buttonWidth + 27;
	let rectH = buttonHeight + 3;
	let rectX = buttonX;
	let rectY = buttonY + 4;
	let centerX = rectX + rectW/2;
	let centerY = rectY + rectH/2;

	let isHovered = mouseX > rectX && mouseX < rectX + rectW && mouseY > rectY && mouseY < rectY + rectH;

	// Button Animation
	let targetScale;
	let targetY;
	if (isHovered) {
		targetScale = 1.01;
		targetY = -1;
	} else {
		targetScale = 1;
		targetY = 0;
	}
	instructionButtonAnim.scale = lerp(instructionButtonAnim.scale, targetScale, 0.2);
	instructionButtonAnim.y = lerp(instructionButtonAnim.y, targetY, 0.2);

	push();
	translate(centerX, centerY);
	scale(instructionButtonAnim.scale);
	translate(-centerX, -centerY);
	translate(0, instructionButtonAnim.y);

	// Draw Instructions Button
	let bgColor;
	let borderColor;
	if (isHovered) {
		bgColor = "rgba(30, 38, 56, 0.95)";
		borderColor = "rgba(0, 229, 255, 1)";
	} else {
		bgColor = "rgba(20, 24, 37, 0.9)";
		borderColor = "rgba(0, 229, 255, 0.8)";
	}
	fill(bgColor);
	stroke(borderColor);
	strokeWeight(2);
	rect(rectX, rectY, rectW, rectH, 25);
	
	noStroke();
	fill(255);
	textSize(15);
	textFont(myFont);
	textAlign(CENTER, CENTER);
	text("Instructions", centerX, centerY - 2);
	pop();

	if (instructionsVisible) {
		drawInstructions();
	}
	
	pop();
}

// Handle Mouse Clicks
function mouseClicked() {
    if (startMenu) {
        if (instructionsVisible) {
            let boxWidth = 450;
            let boxHeight = 450;
			let boxX = 20;
			let boxY = 110;

            let closeButtonX = boxX + boxWidth - 30;
            let closeButtonY = boxY + 30;

            if (dist(mouseX, mouseY, closeButtonX, closeButtonY) < 15) {
                instructionsVisible = false;
                if (clickSound) clickSound.play();
                return; // Prevent Other Clicks From Being Processed
            }

            // If Click Is Outside The Panel
            if (mouseX < boxX || mouseX > boxX + boxWidth || mouseY < boxY || mouseY > boxY + boxHeight) {
                instructionsVisible = false;
            }
            return; // Clicks Inside The Panel Should Not Trigger Anything Else
        }

        // Handle Clicks On The Instructions Button
        let buttonWidth = 187;
        let buttonHeight = 30;
        let buttonX = 20;
        let buttonY = 60;
		let rectW = buttonWidth + 27;
		let rectH = buttonHeight + 3;
		let rectX = buttonX;
		let rectY = buttonY + 4;

        if (mouseX > rectX && mouseX < rectX + rectW && mouseY > rectY && mouseY < rectY + rectH) { // Check If Click Is Within The Button Area
            instructionsVisible = true;
            if (clickSound) clickSound.play();
            return;
        }

        // Handle Clicks On Visualization Names
        for (let i = 0; i < vis.visuals.length; i++) {
            let columnIndex;
            let columnX;
            if (i < 7) {
                columnIndex = i;
                columnX = width * 0.35; // Left column
            } else {
                columnIndex = i - 7;
                columnX = width * 0.68; // Right column
            }
            let y = height * 0.12 + columnIndex * 50;
            
            if (i >= 7) {
                y += 118;
            }
            
            // Check both X and Y coordinates to ensure we're clicking on the correct column
            if (mouseY > y - 20 && mouseY < y + 20 && 
                mouseX > columnX - 100 && mouseX < columnX + 100) {
                selectedVisualIndex = i;
                startVis();
                break;
            }
        }
    } else {
        controls.playbackButton.updateHover();
        controls.mousePressed();
    }
}

// Handle Mouse Press
function mousePressed() {
    if (!startMenu && !useMicInput && sounds.length > 0) {
        if (controls.playbackButton.inTimeBar(mouseX, mouseY)) {
            controls.playbackButton.isDragging = true;
            controls.playbackButton.onTimeBarClick(mouseX);
        }
    }
}

// Handle Mouse Release
function mouseReleased() {
    if (!startMenu) {
        controls.playbackButton.isDragging = false;
    }
}

// Handle Mouse Drag
function mouseDragged() {
    if (!startMenu && controls.playbackButton.isDragging) {
        controls.playbackButton.onTimeBarClick(mouseX);
    }
}

// Handle Key Presses
function keyPressed() {
	if (startMenu) {
		handleStartMenuKeys();
	} else {
		controls.keyPressed(keyCode);
	}
}

// Key Presses For The Start Menu
function handleStartMenuKeys() {
	// Number Keys (1-9) And 0 for 10th visualisation
	if (keyCode >= 49 && keyCode <= 57) { // Keys 1-9
		selectedVisualIndex = keyCode - 49;
		startVis();
	} else if (keyCode == 48) { // Key 0 for 10th visualisation
		selectedVisualIndex = 9;
		startVis();
	}
	
	// Arrow Keys
	if (keyCode == UP_ARROW) {
		selectedVisualIndex = (selectedVisualIndex - 1 + vis.visuals.length) % vis.visuals.length;
        if (scrollSound) scrollSound.play();
	} else if (keyCode == DOWN_ARROW) {
		selectedVisualIndex = (selectedVisualIndex + 1) % vis.visuals.length;
        if (scrollSound) scrollSound.play();
	}
	
	// Enter Key Starts The Selected Visualisation
	if (keyCode == ENTER) {
		startVis();
	}

	// Spacebar Starts The Selected Visualisation
	if (keyCode == 32) { // Spacebar Key Code
		startVis();
	}

	if (keyCode === ESCAPE) { // Escape Key
        if (instructionsVisible) {
            instructionsVisible = false; // Close Instructions Panel
        }
    }
}

// Draw Instructions Panel
function drawInstructions() {
    push();

    // Panel Dimensions
    let boxWidth = 450;
    let boxHeight = 450;
    let boxX = 20;
    let boxY = 110;

    // Draw Panel Background
    fill("rgba(20, 24, 37, 0.95)"); // Semi-Transparent Background
    stroke("rgba(0, 229, 255, 0.8)"); // Border Colour
    strokeWeight(2);
    rect(boxX, boxY, boxWidth, boxHeight, 20); // Rounded Corners

    // Title
    noStroke();
    fill(255, 215, 100);
    textAlign(CENTER);
    textFont(myFont); // Custom Font
    textSize(32);
    text("Instructions", boxX + boxWidth/2, boxY + 43);

    // Instructions Text
    fill(255);
    textAlign(LEFT, TOP);
	textFont(myFont);
    textSize(16);
    let instructions = [ // Instructions Text
        "1. Select a visualisation from the list.",
        "2. Press Enter or click the visualisation name to start.",
        "3. Use the arrow keys to navigate visualisations.",
        "4. Press 'ESC' to return to the main menu.",
        "5. Upload your own audio files using the \"Choose File\" button.",
        "6. Use the microphone input by clicking the mic icon.",
        "7. Click the speed button or press 'S' to change playback speed.",
    ].join("\n\n"); // Join Instructions With Double Newlines

    text(instructions, boxX + 30, boxY + 70, boxWidth - 60);

    // Close Instructions Button
    let closeButtonX = boxX + boxWidth - 30;
    let closeButtonY = boxY + 30;

    // Hover Effect For Close Button
    let isHovered = dist(mouseX, mouseY, closeButtonX, closeButtonY) < 15; // Check If Mouse Is Over Close Button
    if (isHovered) {
        fill("rgba(255, 80, 150, 1)"); // Brighter Colour When Hovered
    } else {
        fill("rgba(226, 62, 146, 0.9)"); // Default Colour
    }
    
    noStroke();
    ellipse(closeButtonX, closeButtonY, 30, 30); // Draw Close Button Circle
    fill(255);
    textSize(20); // Text Size For Close Button
    textAlign(CENTER, CENTER);
    text("X", closeButtonX, closeButtonY - 2); // Draw Close Button Text
    pop();
}

// Start The Selected Visualisation
function startVis() {
    if (clickSound) clickSound.play(); // Play Click Sound
	vis.selectVisual(vis.visuals[selectedVisualIndex].name); // Select The Visualisation
	startMenu = false; // Close Start Menu
	manageMicState(useMicInput); // Set Initial FFT Input Based On Current State
}

// Resize The Canvas To Fit The Window
function windowResized() {
	resizeCanvas(windowWidth, windowHeight); // Resize The Canvas
	fileInput.position(20, 20); // Keep File Input At Top Left
	particleSystem.onResize(); // Update Particle System For New Window Size
	if (!startMenu && vis.selectedVisual.hasOwnProperty("onResize")) {
		vis.selectedVisual.onResize(); // Call onResize If The Visualisation Has This Method
	}
	if (inputToggleButton) {
		inputToggleButton.position(width - 90, 20); // Keep Top Right On Resize
	}
}