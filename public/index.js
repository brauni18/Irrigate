
API_BASE_URL = '/api/gardens';

const createGarden = async function(event) {
  event.preventDefault();

  const name = document.getElementById('gardenName').value;
  const address = document.getElementById('gardenAddress').value;
  const gardenCreation = document.getElementById('gardenCreation');

  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, address })
  });

  if (response.status === 404) {
    gardenCreation.textContent = `Garden creation failed`;
  } else {
    const garden = await response.json();
    const cardHtml = `
      <div class="col">
        <a href="#" class="text-light text-decoration-none">
          <div class="card h-100 card text-bg-dark border-secondary">
            <div class="card-body">
              <h5 class="card-title">${garden.name}</h5>
              <h7 class="card-addres">${garden.address}</h7>
            </div>
            <div class="card-footer border-secondary d-flex justify-content-between align-items-center">
              <small class="text-body-light">Just now</small>
              <div>
                <button class="btn btn-sm text-danger me-2"><i class="bi bi-trash3"></i></button>
                <button class="btn btn-sm text-light"><i class="bi bi-pen"></i></button>
              </div>
            </div>
          </div>
        </a>
      </div>
    `;
    // Add the new card to the end of the gardenCreation container
    gardenCreation.insertAdjacentHTML('beforeend', cardHtml);
  }
}

document.getElementById('createGardenForm').addEventListener('submit', createGarden);