// Container Function For Visualisations
function Visualisations() {
	this.visuals = []; // Array For Storing Visualisations
	this.selectedVisual = null; // Set To Null Initially

	// Add New Visualisations
	this.add = function(vis) {
		this.visuals.push(vis);
		if (this.selectedVisual == null) {
			this.selectVisual(vis.name);
		}
	};

	// Select A Visualisation Using Its Name
	this.selectVisual = function(visName) {
		for (let i = 0; i < this.visuals.length; i++) {
			if (visName == this.visuals[i].name) {
				this.selectedVisual = this.visuals[i];
			}
		}
	};
}