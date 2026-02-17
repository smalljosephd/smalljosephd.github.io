// Theme Toggle Functionality
(function() {
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Check for saved theme preference or default to 'light'
  const currentTheme = localStorage.getItem('theme') || 'light';
  html.setAttribute('data-theme', currentTheme);
  updateThemeButton(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const newTheme = current === 'light' ? 'dark' : 'light';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeButton(newTheme);
    });
  }

  function updateThemeButton(theme) {
    if (!themeToggle) return;
    const sun  = themeToggle.querySelector('.sun');
    const moon = themeToggle.querySelector('.moon');
    if (!sun || !moon) return;

    if (theme === 'dark') {
      sun.style.display  = 'inline-block';
      moon.style.display = 'none';
    } else {
      sun.style.display  = 'none';
      moon.style.display = 'inline-block';
    }
  }
})();
