// Component loader utility
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
// Load components when the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  await ComponentLoader.loadAll();
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('main-content');
      
      sidebar.addEventListener('mouseenter', function() {
                mainContent.style.marginLeft = '250px';
            });
      sidebar.addEventListener('mouseleave', function() {
                mainContent.style.marginLeft = '70px';
            });
});
