// Theme Toggle Functionality
(function() {
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;
  
  // Check for saved theme preference or default to 'light'
  const currentTheme = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', currentTheme);
  
  // Update button state
  updateThemeButton(currentTheme);
  
  // Theme toggle event
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeButton(newTheme);
    });
  }
  
  function updateThemeButton(theme) {
    if (!themeToggle) return;
    
    const sunIcon = themeToggle.querySelector('.sun');
    const moonIcon = themeToggle.querySelector('.moon');
    
    if (theme === 'dark') {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    } else {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    }
  }
})();
