let chartInstance = null;
let allData = [];
let filteredData = [];
let currentPage = 1;
let rowsPerPage = 25;

// CSV URL
const sheetURL = 'data.csv';

// Fetch and parse CSV
fetch(sheetURL)
  .then(res => res.text())
  .then(csvText => {
    const rows = csvText.trim().split('\n');
    const headers = rows.shift().split(',').map(h => h.trim());
    
    // Separate year columns from other columns
    const yearColumns = headers.filter(h => /^\d{4}$/.test(h));
    const otherColumns = headers.filter(h => !/^\d{4}$/.test(h));
    
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
    
    // Initialize UI
    initializeFilters(otherColumns, yearColumns);
    initializeAccordion();
    initializeViewToggle();
    initializePagination();
    initializeExport();
    setupClickOutsideAccordion();
  })
  .catch(err => console.error('Error loading data:', err));

// Initialize filter checkboxes
function initializeFilters(otherColumns, yearColumns) {
  const indicatorContainer = document.getElementById('indicatorFilters');
  const countryContainer = document.getElementById('countryFilters');
  const yearContainer = document.getElementById('yearFilters');
  
  // Get unique values
  const indicators = [...new Set(allData.map(d => d[otherColumns[0]]))].sort();
  const countries = [...new Set(allData.map(d => d[otherColumns[2]]))].sort();
  const years = yearColumns.sort((a, b) => a - b);
  
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
  document.getElementById('showBtn').addEventListener('click', showResults);
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
  selectAll.addEventListener('change', e => {
    const checked = e.target.checked;
    container.querySelectorAll('input[type=checkbox]').forEach(cb => {
      cb.checked = checked;
    });
  });
}

// Setup Search functionality
function setupSearch(inputId, container) {
  document.getElementById(inputId).addEventListener('input', e => {
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
  const firstContent = document.getElementById(firstHeader.getAttribute('data-target'));
  firstHeader.classList.add('active');
  firstContent.classList.add('active');
}

// Setup click outside to close accordion
function setupClickOutsideAccordion() {
  document.addEventListener('click', (e) => {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar.contains(e.target)) {
      document.querySelectorAll('.accordion-header').forEach(h => {
        h.classList.remove('active');
      });
      document.querySelectorAll('.accordion-content').forEach(c => {
        c.classList.remove('active');
      });
    }
  });
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
    } else {
      chartView.style.display = 'none';
      tableView.style.display = 'none';
      placeholder.style.display = 'block';
    }
  });
}

// Show results based on filters
function showResults() {
  const indicatorContainer = document.getElementById('indicatorFilters');
  const countryContainer = document.getElementById('countryFilters');
  const yearContainer = document.getElementById('yearFilters');
  
  const selectedIndicators = getSelected(indicatorContainer);
  const selectedCountries = getSelected(countryContainer);
  const selectedYears = getSelected(yearContainer);
  
  // Get column names
  const firstRow = allData[0];
  const allColumns = Object.keys(firstRow);
  const yearColumns = allColumns.filter(col => /^\d{4}$/.test(col));
  const otherColumns = allColumns.filter(col => !/^\d{4}$/.test(col));
  
  // Filter data
  filteredData = allData.filter(d =>
    (!selectedIndicators.length || selectedIndicators.includes(d[otherColumns[0]])) &&
    (!selectedCountries.length || selectedCountries.includes(d[otherColumns[2]]))
  );
  
  // Store selected years for display
  const yearsToShow = selectedYears.length > 0 ? selectedYears : yearColumns;
  
  // Reset pagination
  currentPage = 1;
  
  // Update UI
  if (filteredData.length > 0) {
    document.getElementById('placeholderMessage').style.display = 'none';
    
    // Check which view is active
    const isTableView = document.getElementById('tableViewBtn').classList.contains('active');
    
    if (isTableView) {
      document.getElementById('tableView').style.display = 'block';
      document.getElementById('chartView').style.display = 'none';
      displayTable(filteredData, otherColumns, yearsToShow);
    } else {
      document.getElementById('chartView').style.display = 'block';
      document.getElementById('tableView').style.display = 'none';
      displayChart(filteredData, otherColumns, yearsToShow);
    }
  } else {
    document.getElementById('placeholderMessage').style.display = 'block';
    document.getElementById('tableView').style.display = 'none';
    document.getElementById('chartView').style.display = 'none';
  }
}

// Display table with pagination
function displayTable(data, otherColumns, yearsToShow) {
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
  yearsToShow.sort((a, b) => a - b).forEach(year => {
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
    yearsToShow.forEach(year => {
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
    showResults();
  });
  
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      showResults();
    }
  });
  
  nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      showResults();
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
function displayChart(data, otherColumns, yearsToShow) {
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
  
  // Draw initial chart
  updateChart(data, otherColumns, yearsToShow);
  
  // Update chart on dropdown change
  indicatorSelect.addEventListener('change', () => {
    updateChart(data, otherColumns, yearsToShow);
  });
  
  countrySelect.addEventListener('change', () => {
    updateChart(data, otherColumns, yearsToShow);
  });
}

// Update chart based on selected indicator and country
function updateChart(data, otherColumns, yearsToShow) {
  const selectedIndicator = document.getElementById('chartIndicatorSelect').value;
  const selectedCountry = document.getElementById('chartCountrySelect').value;
  
  // Find matching row
  const chartData = data.find(d => 
    d[otherColumns[0]] === selectedIndicator && 
    d[otherColumns[2]] === selectedCountry
  );
  
  if (!chartData) return;
  
  // Prepare chart data
  const sortedYears = yearsToShow.sort((a, b) => a - b);
  const values = sortedYears.map(year => chartData[year] || null);
  
  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  // Create new chart
  const ctx = document.getElementById('chartCanvas').getContext('2d');
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: sortedYears,
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
            }
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
    
    // Get current year columns from table
    const tableHeader = document.getElementById('tableHeader');
    const headers = Array.from(tableHeader.querySelectorAll('th')).map(th => th.textContent);
    
    // Build CSV
    let csv = 'data:text/csv;charset=utf-8,';
    csv += headers.join(',') + '\n';
    
    // Get all rows from current table (all pages)
    const firstRow = filteredData[0];
    const allColumns = Object.keys(firstRow);
    const otherColumns = allColumns.filter(col => !/^\d{4}$/.test(col));
    const yearColumns = headers.filter(h => /^\d{4}$/.test(h));
    
    filteredData.forEach(row => {
      const rowData = [];
      
      // Add fixed columns
      ['Indicator', 'Category', 'Country', 'Notes', 'Source'].forEach((col, idx) => {
        const value = row[otherColumns[idx]];
        rowData.push(value || '...');
      });
      
      // Add year columns
      yearColumns.forEach(year => {
        const value = row[year];
        rowData.push(value !== null && value !== undefined ? value : '...');
      });
      
      csv += rowData.join(',') + '\n';
    });
    
    // Download
    const link = document.createElement('a');
    link.href = encodeURI(csv);
    link.download = 'preston_consults_data_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}
