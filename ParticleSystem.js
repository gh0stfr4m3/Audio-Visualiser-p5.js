// Particle System Constructor Function
function ParticleSystem() {
    this.particles = []; // Array to Hold Particles
    this.maxParticles = 100; // Maximum Number of Particles
    
    this.init = function() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(new Particle()); // Create New Particle
        }
    };
    
    // Update All Particles
    this.update = function() {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].update();
        }
    };
    
    // Draw All Particles
    this.draw = function() {
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].draw();
        }
    };
    
    this.onResize = function() {
        // Update Particle Positions When Window Is Resized
        for (let i = 0; i < this.particles.length; i++) {
            if (this.particles[i].x > width) this.particles[i].x = random(width); // Reset x Position
            if (this.particles[i].y > height) this.particles[i].y = random(height); // Reset y Position
        }
    };
    
    // Initialise The Particles
    this.init();
}