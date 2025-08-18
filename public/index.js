API_BASE_URL = '/api/gardens';
//handle loading gardens when the page loads
document.addEventListener('DOMContentLoaded', async () => {
   await getGardens(); // Load gardens when the page loads
});
// Handle the home button click to send the user to the home page
//this should load the gardens
//when the user clicks on the home button
document.getElementById('sidebar-btn-home').addEventListener('click', async (e) => {
  e.preventDefault(); // Prevent the default anchor behavior
 getGardens(); // Load gardens when the home button is clicked
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
        <a href="somewhere.html" class="text-light text-decoration-none">
          <div class="card h-100 card text-bg-dark border-secondary">
            <img src="" class="card-img-top" alt="default image">
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
            <div class="card-footer border-secondary d-flex justify-content-between align-items-center">
              <small class="text-body-light">Last updated 3 mins ago</small>
              <div>
                <button class="btn btn-sm text-danger me-2">
                  <i class="bi bi-trash3"></i>
                </button>
                <button class="btn btn-sm text-light">
                  <i class="bi bi-pen"></i>
                </button>
              </div>
            </div>
          </div>
        </a>
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