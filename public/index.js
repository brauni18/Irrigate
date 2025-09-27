API_BASE_URL = '/api/gardens';
//handle loading gardens when the page loads
document.addEventListener('DOMContentLoaded', async () => {
   await getGardens(); // Load gardens when the page loads
   
  });
 
  // This function will be called when the page loads
  //plus if the user clicks on the home button
const getGardens = async () => {
  try{
    const response = await fetch(API_BASE_URL);
    const gardens = await response.json();

    const container = document.getElementById('cardsContainer'); // note the existing id
    container.innerHTML = ''; // Clear the container before adding new content
    gardens.forEach(garden => {
      console.log( 'garden info:', garden);
      // Create a new card for each garden
      const card = document.createElement('div');
      card.className = 'col';
      card.innerHTML = `
        <a href="irrigation_controller.html?id=${garden._id}" class="text-light text-decoration-none">
          <div class="card h-100 card text-bg-dark border-secondary">
            <img src="${garden.image || 'https://www.thespruce.com/thmb/Y4wxxbBnxIGKK8v4eoI5whUZP2c=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/byladylpergola-f0e18912bd13494682b988bcf37c1265.jpg'}" class="card-img-top" alt="garden image" style="height: 200px; object-fit: cover;">
            <div class="card-body">
              <h5 class="card-title">${garden.name}</h5>
              <h7 class="card-addres">${garden.address}</h7>
              <div>
                <p class="card-text">
                  Irrigation days: 
                </p>
              </div>
              <div>
                <p class="card-text">
                  duration: 
                </p>
              </div>
              <div>
                <p class="card-text">
                  total amount: 
                </p>
              </div>
              </div>
            </a>
            <div class="card-footer border-secondary d-flex justify-content-between align-items-center">
              <small class="text-body-light">Last updated 3 mins ago</small>
              <div>
                <button class="btn btn-sm text-danger me-2" onclick="deleteGarden('${garden._id}')">
                  <i class="bi bi-trash3"></i>
                </button>
                <button class="btn btn-sm text-light" onclick="editGarden('${garden._id}', '${garden.name}', '${garden.address}')">
                  <i class="bi bi-pen"></i>
                </button>
              </div>
            </div>
          </div>
      `;
      container.appendChild(card);
    });

  } catch (error) {
    console.error('Error fetching gardens:', error);
   }
};
 
// Function to create a new garden
const createGarden = async function(event) {
  event.preventDefault(); // Prevent the default form submission behavior


  const modal = bootstrap.Modal.getInstance(document.getElementById('createGardenModal'));
  const name = document.getElementById('gardenName').value;
  const address = document.getElementById('gardenAddress').value;
  const image = document.getElementById('gardenImage').files[0];
  
  // Create a FormData object to handle file uploads
  const formData = new FormData();
  formData.append('name', name);  
  formData.append('address', address);
  if (image) {
    formData.append('image', image);
  }else {
    formData.append('image', ''); // Handle case where no image is provided
  }

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    
    body: formData
  });
  if (response.status === 404) {
   console.log(`Garden creation failed`);
  } else {
    const garden = await response.json();
    modal.hide(); // Hide the modal after creation
    document.getElementById('createGardenForm').reset();
    console.log(`Garden created successfully: ${garden.name}`);
    await getGardens(); // Refresh the garden list after creation
    // Optionally, you can redirect to the garden page or update the UI
    //how do i update the UI to show the new garden


  }
  
}
document.getElementById('createGardenForm').addEventListener('submit', createGarden);

// Function to delete a garden
const deleteGarden = async (gardenId) => {
  if (confirm('Are you sure you want to delete this garden?')) {
    try {
      const response = await fetch(`${API_BASE_URL}/${gardenId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        console.log('Garden deleted successfully');
        await getGardens(); // Refresh the garden list
      } else {
        const error = await response.json();
        console.error('Failed to delete garden:', error.error);
        alert('Failed to delete garden: ' + error.error);
      }
    } catch (error) {
      console.error('Error deleting garden:', error);
      alert('Error deleting garden');
    }
  }
};

// Function to edit a garden
const editGarden = (gardenId, currentName, currentAddress) => {
  // Pre-fill the modal with current values
  document.getElementById('gardenName').value = currentName;
  document.getElementById('gardenAddress').value = currentAddress;
  
  // Change the modal title and button text
  document.getElementById('createGardenModalLabel').textContent = 'Edit Garden';
  
  // Get the form and change its submit handler
  const form = document.getElementById('createGardenForm');
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.textContent = 'Update';
  
  // Remove existing event listener and add update handler
  form.removeEventListener('submit', createGarden);
  
  const updateHandler = async (event) => {
    event.preventDefault();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('createGardenModal'));
    const name = document.getElementById('gardenName').value;
    const address = document.getElementById('gardenAddress').value;
    const image = document.getElementById('gardenImage').files[0];
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('address', address);
    if (image) {
      formData.append('image', image);
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/${gardenId}`, {
        method: 'PATCH',
        body: formData
      });
      
      if (response.ok) {
        const updatedGarden = await response.json();
        modal.hide();
        console.log('Garden updated successfully:', updatedGarden.name);
        await getGardens(); // Refresh the garden list
        
        // Reset form for next use
        resetFormToCreate();
      } else {
        const error = await response.json();
        console.error('Failed to update garden:', error.error);
        alert('Failed to update garden: ' + error.error);
      }
    } catch (error) {
      console.error('Error updating garden:', error);
      alert('Error updating garden');
    }
  };
  
  // Add the update handler
  form.addEventListener('submit', updateHandler, { once: true });
  
  // Show the modal
  const modal = new bootstrap.Modal(document.getElementById('createGardenModal'));
  modal.show();
};

// Function to reset form back to create mode
const resetFormToCreate = () => {
  document.getElementById('createGardenModalLabel').textContent = 'Create Garden';
  const form = document.getElementById('createGardenForm');
  const submitButton = form.querySelector('button[type="submit"]');
  submitButton.textContent = 'Create';
  form.reset();
  
  // Remove any existing event listeners and add back the create handler
  form.removeEventListener('submit', createGarden);
  form.addEventListener('submit', createGarden);
};

// Reset form when modal is hidden
document.getElementById('createGardenModal').addEventListener('hidden.bs.modal', () => {
  resetFormToCreate();
});