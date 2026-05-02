// Particle Constructor Function
function Particle() {
    // Initialise Particle Properties
    this.x = random(width); // Random x Position
    this.y = random(height); // Random y Position
    this.vx = random(-1, 1); // Random x Velocity
    this.vy = random(-1, 1); // Random y Velocity
    this.size = random(2, 6); // Random Size
    this.opacity = random(0.3, 0.8);
    this.color = color(random(255, 200), random(100, 255), random(100, 255), this.opacity * 255); // Random Color
    this.life = 0; // Particle Life
    this.maxLife = random(100, 200); // Random Maximum Life Span
    
    this.update = function() {
        this.x += this.vx; // Update x Position
        this.y += this.vy; // Update y Position
        this.life++; // Increment Life

        // Wrap Around The Edges
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Fade Out As The Particle Ages
        let lifeRatio = this.life/this.maxLife;
        this.opacity = map(lifeRatio, 0, 1, 0.8, 0);
        this.color.setAlpha(this.opacity * 255);

        // Reset Particle
        if (this.life > this.maxLife) {
            this.reset();
        }
    };
    
    this.draw = function() {
        push();
        noStroke();
        fill(this.color);
        ellipse(this.x, this.y, this.size); // Draw Particle
        pop();
    };
    
    // Reset Particle Properties
    this.reset = function() {
        this.x = random(width);
        this.y = random(height);
        this.vx = random(-1, 1);
        this.vy = random(-1, 1);
        this.size = random(2, 6);
        this.opacity = random(0.3, 0.8);
        this.color = color(random(255, 200), random(100, 255), random(100, 255), this.opacity * 255);
        this.life = 0;
        this.maxLife = random(100, 200);
    };
}