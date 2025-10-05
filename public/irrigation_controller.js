const API_lineConfigurations_URL = '/api/line_configurations';
function getCurrentGardenId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('gardenId');
}
//load existing lines from the database and display them
               
const addLinebtn = document.getElementById('add-line-btn');
addLinebtn.addEventListener('click', () => {
    const currentGardenId = getCurrentGardenId();
    const counter = document.getElementById('lines-container').querySelectorAll('.line-card').length + 1;
   const lineCard = document.createElement('div');
   lineCard.className = 'col-lg-6 mb-4';
   lineCard.innerHTML = `
                <div id="line-${counter}" class="card line-card bg-dark text-white border-secondary clickable-card">
                  <div class="card-body">
                  <!-- Title row with switch -->
                    <a href="line-controller.html?gardenId=${currentGardenId}&lineId=${`line-${counter}`}" class="text-decoration-none text-white">
                      <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="d-flex align-items-center">
                          <div class="line-indicator line"></div>
                          <h5 class="card-title text-white mb-0 ms-3">
                            <i class="bi bi-droplet-fill me-2"></i>Line ${counter} 
                          </h5>
                        </div>
                        <div class="form-check form-switch">
                          <input class="form-check-input" type="checkbox" id="lineSwitch${counter}" checked>
                          <label class="form-check-label text-white" for="lineSwitch${counter}">
                          </label>
                        </div>
                      </div>

                      <!-- Clickable area for navigation -->

                      
                      <!-- Delete button at bottom right -->
                      <div class="d-flex justify-content-end">
                      <button class="btn btn-outline-danger btn-sm delete-line-btn" data-line-id="${counter}" title="Delete Line">
                      <i class="bi bi-trash"></i>
                      </button>
                      </div>
                      </div>
                    </a>
                </div>`;

   document.getElementById('lines-container').querySelector('.row').appendChild(lineCard);
   addLineEventListeners(counter);
   // create line configuration in the database with default values
   fetch(API_lineConfigurations_URL, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json'
     },

      body: JSON.stringify({
       name: `Line - ${counter}`,
       gardenId: currentGardenId,
       lineNumber: counter,
       plantType: 'Tomato',
       maintenanceLevel: 50,
       location: 1,
       interval: 1,
       areaSize: 1,
       dripperSettings: {
         distance: 0.5,
         flowRate: 2.3
       },
       flowRate: 1,
       calculatedValues: {}
     })
   });
});
 function addLineEventListeners(lineId) {
  // Delete button event 
  const deleteBtn = document.querySelector(`[data-line-id="${lineId}"]`);
  deleteBtn.addEventListener('click', async (e) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault();
    
    if (confirm(`Are you sure you want to delete Line ${lineId}?`)) {
       try {
                const response = await fetch(`/api/line_configurations/${lineId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    const lineCard = document.getElementById(`line-${lineId}`).closest('.col-lg-6');
                    lineCard.remove();
                    console.log(`Line ${lineId} deleted`);
                } else {
                    console.error('Failed to delete line');
                }
            } catch (error) {
                console.error('Error deleting line:', error);
            }
    }
  });
}
