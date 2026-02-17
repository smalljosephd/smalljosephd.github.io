// Global Variables
let chartInstance = null;
let allData = [];
let filteredData = [];
let currentPage = 1;
let rowsPerPage = 25;
let currentTimeframe = 'annual';
let allColumns = [];
let yearColumns = [];
let otherColumns = [];
let currentColumnsToShow = []; // Store columns for pagination

// Detect data source from page (set by HTML)
const dataSource = window.dataSource || 'all'; // 'all' or 'trade'

// Timeframe configurations with data folder paths
const timeframeConfig = {
  annual: {
    file: `data/${dataSource}-annual-data.csv`,
    regex: /^\d{4}$/,
    expandYear: (year) => [year]
  },
  quarterly: {
    file: `data/${dataSource}-quarterly-data.csv`,
    regex: /^\d{4}Q[1-4]$/,
    expandYear: (year) => [`${year}Q1`, `${year}Q2`, `${year}Q3`, `${year}Q4`]
  },
  monthly: {
    file: `data/${dataSource}-monthly-data.csv`,
    regex: /^\d{4}-\d{2}$/,
    expandYear: (year) => {
      const months = [];
      for (let i = 1; i <= 12; i++) {
        months.push(`${year}-${String(i).padStart(2, '0')}`);
      }
      return months;
    }
  }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  initializeTimeframeSelector();
  initializeMobileMenu();
  initializeAccordion();
  initializeViewToggle();
  initializePagination();
  initializeExport();
  loadTimeframe('annual');
});

// Initialize Timeframe Selector
function initializeTimeframeSelector() {
  const buttons = document.querySelectorAll('.timeframe-btn');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const timeframe = btn.getAttribute('data-timeframe');
      
      // Update active state
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Load new timeframe
      loadTimeframe(timeframe);
    });
  });
}

// Initialize Mobile Menu
function initializeMobileMenu() {
  const hamburger = document.getElementById('hamburgerMenu');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const closeSidebar = document.getElementById('closeSidebar');
  
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    });
  }
  
  if (closeSidebar) {
    closeSidebar.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      if (hamburger) hamburger.classList.remove('active');
    });
  }
  
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      if (hamburger) hamburger.classList.remove('active');
    });
  }
}

// Load Timeframe Data
function loadTimeframe(timeframe) {
  currentTimeframe = timeframe;
  const config = timeframeConfig[timeframe];
  
  fetch(config.file)
    .then(res => res.text())
    .then(csvText => {
      parseCSVData(csvText);
      initializeFilters();
      resetUI();
    })
    .catch(err => {
      console.error(`Error loading ${timeframe} data:`, err);
      alert(`Failed to load ${timeframe} data. Please check if the file exists.`);
    });
}

// Parse CSV Data
function parseCSVData(csvText) {
  const rows = csvText.trim().split('\n');
  const headers = rows.shift().split(',').map(h => h.trim());
  
  // Get timeframe configuration
  const config = timeframeConfig[currentTimeframe];
  
  // Separate columns
  yearColumns = headers.filter(h => config.regex.test(h));
  otherColumns = headers.filter(h => !config.regex.test(h));
  allColumns = headers;
  
  // Parse data rows
  allData = rows.map(r => {
    const cols = r.split(',');
    const obj = {};
    
    // Map non-year columns
    otherColumns.forEach((h, i) => {
      obj[h.trim()] = cols[i]?.trim() || '';
    });
    
    // Map year columns
    yearColumns.forEach((y, i) => {
      const value = cols[otherColumns.length + i];
      obj[y] = value && value.trim() !== '' ? Number(value) : null;
    });
    
    return obj;
  });
}

// Initialize Filters
function initializeFilters() {
  const indicatorContainer = document.getElementById('indicatorFilters');
  const countryContainer = document.getElementById('countryFilters');
  const yearContainer = document.getElementById('yearFilters');
  
  // Clear existing filters
  indicatorContainer.innerHTML = '';
  countryContainer.innerHTML = '';
  yearContainer.innerHTML = '';
  
  // Get unique values
  const indicators = [...new Set(allData.map(d => d[otherColumns[0]]))].sort();
  const countries = [...new Set(allData.map(d => d[otherColumns[2]]))].sort();
  
  // Extract unique years from year columns
  const years = getUniqueYears();
  
  // Create checkboxes
  indicators.forEach(i => createCheckbox(i, i, indicatorContainer));
  countries.forEach(c => createCheckbox(c, c, countryContainer));
  years.forEach(y => createCheckbox(y, y, yearContainer));
  
  // Setup Select All
  setupSelectAll('indicatorSelectAll', indicatorContainer);
  setupSelectAll('countrySelectAll', countryContainer);
  setupSelectAll('yearSelectAll', yearContainer);
  
  // Setup Search
  setupSearch('indicatorSearch', indicatorContainer);
  setupSearch('countrySearch', countryContainer);
  
  // Setup Show Results button
  const showBtn = document.getElementById('showBtn');
  showBtn.removeEventListener('click', showResults); // Remove old listener
  showBtn.addEventListener('click', showResults);
}

// Get Unique Years
function getUniqueYears() {
  const config = timeframeConfig[currentTimeframe];
  const yearSet = new Set();
  
  yearColumns.forEach(col => {
    // Extract year from column name
    const year = col.match(/^\d{4}/)?.[0];
    if (year) yearSet.add(year);
  });
  
  return Array.from(yearSet).sort();
}

// Create checkbox element
function createCheckbox(name, value, container) {
  const label = document.createElement('label');
  label.innerHTML = `<input type="checkbox" value="${value}"> ${name}`;
  container.appendChild(label);
}

// Setup Select All functionality
function setupSelectAll(checkboxId, container) {
  const selectAll = document.getElementById(checkboxId);
  
  // Remove old listener
  const newSelectAll = selectAll.cloneNode(true);
  selectAll.parentNode.replaceChild(newSelectAll, selectAll);
  
  newSelectAll.addEventListener('change', e => {
    const checked = e.target.checked;
    container.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.checked = checked;
    });
  });
}

// Setup Search functionality
function setupSearch(inputId, container) {
  const searchInput = document.getElementById(inputId);
  
  // Remove old listener
  const newSearchInput = searchInput.cloneNode(true);
  searchInput.parentNode.replaceChild(newSearchInput, searchInput);
  
  newSearchInput.addEventListener('input', e => {
    const search = e.target.value.toLowerCase();
    Array.from(container.children).forEach(label => {
      const text = label.textContent.toLowerCase();
      label.style.display = text.includes(search) ? 'block' : 'none';
    });
  });
}

// Get selected values from container
function getSelected(container) {
  return Array.from(container.querySelectorAll('input[type=checkbox]:checked'))
    .map(cb => cb.value);
}

// Expand selected years to actual columns
function expandYearsToColumns(selectedYears) {
  if (selectedYears.length === 0) return yearColumns;
  
  const config = timeframeConfig[currentTimeframe];
  const expandedColumns = [];
  
  selectedYears.forEach(year => {
    const columns = config.expandYear(year);
    columns.forEach(col => {
      if (yearColumns.includes(col)) {
        expandedColumns.push(col);
      }
    });
  });
  
  return expandedColumns;
}

// Initialize accordion functionality
function initializeAccordion() {
  const headers = document.querySelectorAll('.accordion-header');
  
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const targetId = header.getAttribute('data-target');
      const content = document.getElementById(targetId);
      const isActive = header.classList.contains('active');
      
      // Close all accordions
      document.querySelectorAll('.accordion-header').forEach(h => {
        h.classList.remove('active');
      });
      document.querySelectorAll('.accordion-content').forEach(c => {
        c.classList.remove('active');
      });
      
      // Open clicked accordion if it wasn't active
      if (!isActive) {
        header.classList.add('active');
        content.classList.add('active');
      }
    });
  });
  
  // Open first accordion by default
  const firstHeader = document.querySelector('.accordion-header');
  if (firstHeader) {
    const firstContent = document.getElementById(firstHeader.getAttribute('data-target'));
    firstHeader.classList.add('active');
    firstContent.classList.add('active');
  }
}

// Initialize view toggle
function initializeViewToggle() {
  const tableViewBtn = document.getElementById('tableViewBtn');
  const chartViewBtn = document.getElementById('chartViewBtn');
  const tableView = document.getElementById('tableView');
  const chartView = document.getElementById('chartView');
  const placeholder = document.getElementById('placeholderMessage');
  
  tableViewBtn.addEventListener('click', () => {
    tableViewBtn.classList.add('active');
    chartViewBtn.classList.remove('active');
    
    if (filteredData.length > 0) {
      tableView.style.display = 'block';
      chartView.style.display = 'none';
      placeholder.style.display = 'none';
      displayTable(filteredData, currentColumnsToShow); // Re-display current page
    } else {
      tableView.style.display = 'none';
      chartView.style.display = 'none';
      placeholder.style.display = 'block';
    }
  });
  
  chartViewBtn.addEventListener('click', () => {
    chartViewBtn.classList.add('active');
    tableViewBtn.classList.remove('active');
    
    if (filteredData.length > 0) {
      chartView.style.display = 'block';
      tableView.style.display = 'none';
      placeholder.style.display = 'none';
      displayChart(filteredData, currentColumnsToShow); // Re-display with current columns
    } else {
      chartView.style.display = 'none';
      tableView.style.display = 'none';
      placeholder.style.display = 'block';
    }
  });
}

// Reset UI
function resetUI() {
  filteredData = [];
  currentPage = 1;
  
  document.getElementById('placeholderMessage').style.display = 'block';
  document.getElementById('tableView').style.display = 'none';
  document.getElementById('chartView').style.display = 'none';
  
  // Reset to table view
  document.getElementById('tableViewBtn').classList.add('active');
  document.getElementById('chartViewBtn').classList.remove('active');
}

// Store current columns to show (needed for pagination)
let currentColumnsToShow = [];

// Show results based on filters
function showResults() {
  const indicatorContainer = document.getElementById('indicatorFilters');
  const countryContainer = document.getElementById('countryFilters');
  const yearContainer = document.getElementById('yearFilters');
  
  const selectedIndicators = getSelected(indicatorContainer);
  const selectedCountries = getSelected(countryContainer);
  const selectedYears = getSelected(yearContainer);
  
  // Filter data
  filteredData = allData.filter(d =>
    (!selectedIndicators.length || selectedIndicators.includes(d[otherColumns[0]])) &&
    (!selectedCountries.length || selectedCountries.includes(d[otherColumns[2]]))
  );
  
  // Get columns to show based on selected years
  currentColumnsToShow = expandYearsToColumns(selectedYears);
  
  // Reset pagination
  currentPage = 1;
  
  // Display results
  displayResults();
}

// Display results (separated from filtering for pagination)
function displayResults() {
  // Update UI
  if (filteredData.length > 0) {
    document.getElementById('placeholderMessage').style.display = 'none';
    
    // Check which view is active
    const isTableView = document.getElementById('tableViewBtn').classList.contains('active');
    
    if (isTableView) {
      document.getElementById('tableView').style.display = 'block';
      document.getElementById('chartView').style.display = 'none';
      displayTable(filteredData, currentColumnsToShow);
    } else {
      document.getElementById('chartView').style.display = 'block';
      document.getElementById('tableView').style.display = 'none';
      displayChart(filteredData, currentColumnsToShow);
    }
  } else {
    document.getElementById('placeholderMessage').style.display = 'block';
    document.getElementById('tableView').style.display = 'none';
    document.getElementById('chartView').style.display = 'none';
  }
}

// Display table with pagination
function displayTable(data, columnsToShow) {
  const tableHeader = document.getElementById('tableHeader');
  const tableBody = document.getElementById('tableBody');
  
  // Clear table
  tableHeader.innerHTML = '';
  tableBody.innerHTML = '';
  
  // Create header
  const headerColumns = ['Indicator', 'Category', 'Country', 'Notes', 'Source'];
  headerColumns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col;
    tableHeader.appendChild(th);
  });
  
  // Add year columns
  columnsToShow.sort((a, b) => {
    // Sort chronologically
    return a.localeCompare(b);
  }).forEach(year => {
    const th = document.createElement('th');
    th.textContent = year;
    tableHeader.appendChild(th);
  });
  
  // Calculate pagination
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, data.length);
  const pageData = data.slice(startIndex, endIndex);
  
  // Create rows
  pageData.forEach(row => {
    const tr = document.createElement('tr');
    
    // Add fixed columns
    headerColumns.forEach((col, idx) => {
      const td = document.createElement('td');
      const value = row[otherColumns[idx]];
      td.textContent = value || '...';
      tr.appendChild(td);
    });
    
    // Add year columns
    columnsToShow.forEach(year => {
      const td = document.createElement('td');
      const value = row[year];
      td.textContent = value !== null && value !== undefined ? value : '...';
      tr.appendChild(td);
    });
    
    tableBody.appendChild(tr);
  });
  
  updatePaginationInfo(data.length);
}

// Initialize pagination
function initializePagination() {
  const rowsPerPageSelect = document.getElementById('rowsPerPage');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  rowsPerPageSelect.addEventListener('change', e => {
    rowsPerPage = parseInt(e.target.value);
    currentPage = 1;
    displayResults(); // Just re-display, don't re-filter
  });
  
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayResults(); // Just re-display, don't re-filter
    }
  });
  
  nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      displayResults(); // Just re-display, don't re-filter
    }
  });
}

// Update pagination info
function updatePaginationInfo(totalRows) {
  const paginationInfo = document.getElementById('paginationInfo');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  
  const startIndex = (currentPage - 1) * rowsPerPage + 1;
  const endIndex = Math.min(currentPage * rowsPerPage, totalRows);
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  
  paginationInfo.textContent = `Showing ${startIndex}-${endIndex} of ${totalRows} records | Page ${currentPage} of ${totalPages}`;
  
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// Display chart
function displayChart(data, columnsToShow) {
  const chartPlaceholder = document.getElementById('chartPlaceholder');
  const chartContent = document.getElementById('chartContent');
  
  if (data.length === 0) {
    chartPlaceholder.style.display = 'block';
    chartContent.style.display = 'none';
    return;
  }
  
  chartPlaceholder.style.display = 'none';
  chartContent.style.display = 'block';
  
  // Get unique indicators and countries
  const indicators = [...new Set(data.map(d => d[otherColumns[0]]))].sort();
  const countries = [...new Set(data.map(d => d[otherColumns[2]]))].sort();
  
  // Populate dropdowns
  const indicatorSelect = document.getElementById('chartIndicatorSelect');
  const countrySelect = document.getElementById('chartCountrySelect');
  
  indicatorSelect.innerHTML = '';
  countrySelect.innerHTML = '';
  
  indicators.forEach(ind => {
    const option = document.createElement('option');
    option.value = ind;
    option.textContent = ind;
    indicatorSelect.appendChild(option);
  });
  
  countries.forEach(country => {
    const option = document.createElement('option');
    option.value = country;
    option.textContent = country;
    countrySelect.appendChild(option);
  });
  
  // Remove old event listeners and add new ones
  const newIndicatorSelect = indicatorSelect.cloneNode(true);
  const newCountrySelect = countrySelect.cloneNode(true);
  indicatorSelect.parentNode.replaceChild(newIndicatorSelect, indicatorSelect);
  countrySelect.parentNode.replaceChild(newCountrySelect, countrySelect);
  
  // Draw initial chart
  updateChart(data, columnsToShow);
  
  // Update chart on dropdown change
  document.getElementById('chartIndicatorSelect').addEventListener('change', () => {
    updateChart(data, columnsToShow);
  });
  
  document.getElementById('chartCountrySelect').addEventListener('change', () => {
    updateChart(data, columnsToShow);
  });
}

// Update chart based on selected indicator and country
function updateChart(data, columnsToShow) {
  const selectedIndicator = document.getElementById('chartIndicatorSelect').value;
  const selectedCountry = document.getElementById('chartCountrySelect').value;
  
  // Find matching row
  const chartData = data.find(d => 
    d[otherColumns[0]] === selectedIndicator && 
    d[otherColumns[2]] === selectedCountry
  );
  
  if (!chartData) return;
  
  // Prepare chart data
  const sortedColumns = columnsToShow.sort((a, b) => a.localeCompare(b));
  const values = sortedColumns.map(col => chartData[col] || null);
  
  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  // Create new chart
  const ctx = document.getElementById('chartCanvas').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedColumns,
      datasets: [{
        label: `${selectedIndicator} - ${selectedCountry}`,
        data: values,
        borderColor: '#2a5298',
        backgroundColor: 'rgba(42, 82, 152, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#2a5298'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            font: {
              size: 12
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          ticks: {
            font: {
              size: 12
            },
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

// Initialize export functionality
function initializeExport() {
  document.getElementById('exportBtn').addEventListener('click', () => {
    if (filteredData.length === 0) return;
    
    // Get current table headers
    const tableHeader = document.getElementById('tableHeader');
    const headers = Array.from(tableHeader.querySelectorAll('th')).map(th => th.textContent);
    
    // Build CSV
    let csv = 'data:text/csv;charset=utf-8,';
    csv += headers.join(',') + '\n';
    
    // Get year columns from headers
    const yearCols = headers.filter(h => h !== 'Indicator' && h !== 'Category' && h !== 'Country' && h !== 'Notes' && h !== 'Source');
    
    filteredData.forEach(row => {
      const rowData = [];
      
      // Add fixed columns
      ['Indicator', 'Category', 'Country', 'Notes', 'Source'].forEach((col, idx) => {
        const value = row[otherColumns[idx]];
        rowData.push(value || '...');
      });
      
      // Add year columns
      yearCols.forEach(col => {
        const value = row[col];
        rowData.push(value !== null && value !== undefined ? value : '...');
      });
      
      csv += rowData.join(',') + '\n';
    });
    
    // Download
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = `preston_consults_${currentTimeframe}_data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}
