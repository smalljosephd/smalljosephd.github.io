// Navigation and Header Functionality
(function() {
  const hamburger = document.getElementById('hamburgerMenu');
  const headerNav = document.getElementById('headerNav');
  const navOverlay = document.getElementById('navOverlay');
  const header = document.getElementById('mainHeader');
  const logoFull = document.querySelector('.logo-text-full');
  const logoShort = document.querySelector('.logo-text-short');
  
  // Hamburger menu toggle
  if (hamburger && headerNav && navOverlay) {
    hamburger.addEventListener('click', () => {
      const isActive = headerNav.classList.contains('active');
      
      if (isActive) {
        closeNav();
      } else {
        openNav();
      }
    });
    
    // Close on overlay click
    navOverlay.addEventListener('click', closeNav);
    
    // Close on link click (mobile)
    headerNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          closeNav();
        }
      });
    });
  }
  
  function openNav() {
    hamburger.classList.add('active');
    headerNav.classList.add('active');
    navOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeNav() {
    hamburger.classList.remove('active');
    headerNav.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  // Scroll behavior - shrink header and abbreviate logo
  let lastScroll = 0;
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
      header.classList.add('scrolled');
      if (logoFull && logoShort) {
        logoFull.style.display = 'none';
        logoShort.style.display = 'inline';
      }
    } else {
      header.classList.remove('scrolled');
      if (logoFull && logoShort) {
        logoFull.style.display = 'inline';
        logoShort.style.display = 'none';
      }
    }
    
    lastScroll = currentScroll;
  });
  
  // Filter toggle button (for explorer pages)
  const filterToggleBtn = document.getElementById('filterToggleBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const closeSidebar = document.getElementById('closeSidebar');
  
  if (filterToggleBtn && sidebar && sidebarOverlay) {
    filterToggleBtn.addEventListener('click', () => {
      sidebar.classList.add('active');
      sidebarOverlay.classList.add('active');
    });
    
    if (closeSidebar) {
      closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
      });
    }
    
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
    });
  }
})();
