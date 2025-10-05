// Component loader utility - only declare if not already declared
if (typeof ComponentLoader === 'undefined') {
  class ComponentLoader {
    static async loadComponent(elementId, componentPath) {
      try {
        const response = await fetch(componentPath);
        if (!response.ok) {
          throw new Error(`Failed to load component: ${response.status}`);
        }
        const html = await response.text();
        const element = document.getElementById(elementId);
        if (element) {
          element.innerHTML = html;
        } else {
          console.error(`Element with id '${elementId}' not found`);
        }
      } catch (error) {
        console.error('Error loading component:', error);
      }
    }

    static async loadAll() {
      await Promise.all([
        this.loadComponent('navbar-placeholder', 'parts/navbar.html'),
        this.loadComponent('sidebar-placeholder', 'parts/sidebar.html')
      ]);
    }
  }
  
  // Make it globally available
  window.ComponentLoader = ComponentLoader;
}

// Only add event listener if it hasn't been added before
if (!window.componentsInitialized) {
  document.addEventListener('DOMContentLoaded', async () => {
    await ComponentLoader.loadAll();
    
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
        
    if (sidebar && mainContent) {
      sidebar.addEventListener('mouseenter', function() {
        mainContent.style.marginLeft = '250px';
      });
      sidebar.addEventListener('mouseleave', function() {
        mainContent.style.marginLeft = '70px';
      });
    }
    
    const createGardenBtn = document.getElementById('create-garden-btn');
    if (createGardenBtn) {
      createGardenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Check if we're on a page with the modal
        const modal = document.getElementById('createGardenModal');
        if (modal) {
          // If resetFormToCreate function exists, use it
          if (typeof resetFormToCreate === 'function') {
            resetFormToCreate();
          }
          const bootstrapModal = new bootstrap.Modal(modal);
          bootstrapModal.show();
        } else {
          // If not on index page, redirect to index page
          window.location.href = '/';
        }
      });
    }
  });
  
  // Mark as initialized
  window.componentsInitialized = true;
}