document.getElementById('createGardenForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const name = document.getElementById('gardenName').value;
  const address = document.getElementById('gardenAddress').value;
  const irrigation = document.getElementById('gardenIrrigation').value;

  const response = await fetch('/api/gardens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, address, irrigation })
  });

  if (response.ok) {
    const garden = await response.json();
    const cardHtml = `
      <div class="col">
        <a href="#" class="text-light text-decoration-none">
          <div class="card h-100 card text-bg-dark border-secondary">
            <div class="card-body">
              <h5 class="card-title">${garden.name}</h5>
              <h7 class="card-addres">${garden.address}</h7>
              <div><p class="card-text">Irrigation: ${garden.Irrigation || ''}</p></div>
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
    document.querySelector('.row.row-cols-1').insertAdjacentHTML('beforeend', cardHtml);

    var modal = bootstrap.Modal.getInstance(document.getElementById('createGardenModal'));
    modal.hide();
    this.reset();
  } else {
    alert('Failed to create garden.');
  }
});