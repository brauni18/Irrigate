const API_lineConfigurations_URL = '/api/line_configurations';

function getCurrentGardenId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('gardenId');
}

// Reusable function to create line card HTML
function createLineCard(lineData, counter) {
    const currentGardenId = getCurrentGardenId();
    const lineCard = document.createElement('div');
    lineCard.className = 'col-lg-6 mb-4';
    lineCard.innerHTML = `
        <div id="line-${counter}" class="card line-card bg-dark text-white border-secondary clickable-card">
            <div class="card-body">
                <!-- Title row with switch -->
                <a href="line-controller.html?gardenId=${currentGardenId}&lineId=${lineData._id || `line-${counter}`}" class="text-decoration-none text-white">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="d-flex align-items-center">
                            <div class="line-indicator line"></div>
                            <h5 class="card-title text-white mb-0 ms-3">
                                <i class="bi bi-droplet-fill me-2"></i>${lineData.name || `Line ${counter}`}
                            </h5>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="lineSwitch${counter}" checked>
                            <label class="form-check-label text-white" for="lineSwitch${counter}">
                            </label>
                        </div>
                    </div>
                    <!-- Additional line info -->
                    <div class="mb-2">
                        <small class="text-muted">Plant: ${lineData.plantType || 'Not set'}</small><br>
                        <small class="text-muted">Area: ${lineData.areaSize || 0} m²</small>
                    </div>
                </a>
                <!-- Delete button at bottom right -->
                <div class="d-flex justify-content-end">
                    <button class="btn btn-outline-danger btn-sm delete-line-btn" data-line-id="${lineData._id || counter}" title="Delete Line">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        </div>`;
    
    return lineCard;
}

// Add line card to container and attach event listeners
function addLineToContainer(lineData, counter) {
    const lineCard = createLineCard(lineData, counter);
    document.getElementById('lines-container').querySelector('.row').appendChild(lineCard);
    addLineEventListeners(lineData._id || counter);
    return lineCard;
}

// Load existing lines from the database and display them
const loadLines = async () => {
    try {
        const currentGardenId = getCurrentGardenId();
        if (!currentGardenId) {
            console.error('No garden ID found in URL');
            return;
        }

        const response = await fetch(`${API_lineConfigurations_URL}?gardenId=${currentGardenId}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const lines = await response.json();
        const linesContainer = document.getElementById('lines-container').querySelector('.row');
        linesContainer.innerHTML = ''; // Clear existing lines
        
        // Display each line
        lines.forEach((line, index) => {
            addLineToContainer(line, line.lineNumber || (index + 1));
        });
        
        console.log(`Loaded ${lines.length} lines for garden ${currentGardenId}`);
        
    } catch (error) {
        console.error('Error loading lines:', error);
        // Show user-friendly error message
        const linesContainer = document.getElementById('lines-container').querySelector('.row');
        linesContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-warning" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    Failed to load existing lines. You can still create new ones.
                </div>
            </div>`;
    }
};

// Add new line button event
const addLinebtn = document.getElementById('add-line-btn');
addLinebtn.addEventListener('click', async () => {
    const currentGardenId = getCurrentGardenId();
    
    if (!currentGardenId) {
        alert('Garden ID not found in URL!');
        return;
    }
    
    const counter = document.getElementById('lines-container').querySelectorAll('.line-card').length + 1;
    
    // Create line configuration in the database with default values
    try {
        const response = await fetch(API_lineConfigurations_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: `Line ${counter}`,
                gardenId: currentGardenId,
                lineNumber: counter,
                plantType: 'grass', // Valid enum value
                maintenanceLevel: 50,
                location: 2.5, // Valid number
                interval: 2, // Valid positive number
                areaSize: 10, // Valid positive number
                dripperSettings: {
                    distance: 0.5,
                    flowRate: 2.3
                },
                calculatedValues: {}
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const newLine = await response.json();
        console.log('Line created successfully:', newLine);
        
        // Add the new line to the UI using the same function
        addLineToContainer(newLine, counter);
        
    } catch (error) {
        console.error('Error creating line:', error);
        alert(`Error creating line: ${error.message}`);
    }
});

// Event listeners for line interactions
function addLineEventListeners(lineId) {
    // Switch event listener
    const switchElement = document.getElementById(`lineSwitch${document.getElementById('lines-container').querySelectorAll('.line-card').length}`);
    if (switchElement) {
        switchElement.addEventListener('change', (e) => {
            e.stopPropagation();
            console.log(`Line ${lineId} turned ${switchElement.checked ? 'ON' : 'OFF'}`);
            // Here you can add API call to update line status
        });
    }
    
    // Delete button event 
    const deleteBtn = document.querySelector(`[data-line-id="${lineId}"]`);
    if (deleteBtn) {
        deleteBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            if (confirm(`Are you sure you want to delete this line?`)) {
                try {
                    const response = await fetch(`${API_lineConfigurations_URL}/${lineId}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        // Find and remove the line card
                        const lineCard = deleteBtn.closest('.col-lg-6');
                        lineCard.remove();
                        console.log(`Line ${lineId} deleted`);
                    } else {
                        throw new Error('Failed to delete line');
                    }
                } catch (error) {
                    console.error('Error deleting line:', error);
                    alert(`Error deleting line: ${error.message}`);
                }
            }
        });
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadLines();
});
