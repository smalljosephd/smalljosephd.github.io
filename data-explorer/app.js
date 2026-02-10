let chartInstance = null;

// Replace with your Google Sheets CSV URL
const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKDHY91czNF0C9f3wTswf9uKTvipREeIuQZJT-zgELMRO6fS1bQUWTSdE30bo7TYlTaZaujWxCkjbh/pub?output=csv';

fetch(sheetURL)
  .then(res => res.text())
  .then(csvText => {
    const rows = csvText.trim().split('\n');
    rows.shift(); // remove header
    const data = rows.map(r => {
      const cols = r.split(',');
      return {
        name: cols[0].trim(),
        category: cols[1].trim(),
        country: cols[2].trim(),
        year: cols[3].trim(),
        value: Number(cols[4].trim()),
        notes: cols[5] ? cols[5].trim() : '',
        source: cols[6] ? cols[6].trim() : ''
      };
    });

    const indicatorContainer = document.getElementById('indicatorFilters');
    const countryContainer = document.getElementById('countryFilters');
    const yearContainer = document.getElementById('yearFilters');
    const tableContainer = document.getElementById('tableContainer');
    const tbody = document.querySelector('#dataTable tbody');
    const theadRow = document.getElementById('tableHeader');
    const chartContainer = document.getElementById('chartContainer');
    const ctx = document.getElementById('chartCanvas').getContext('2d');

    // Checkbox helper
    function createCheckbox(name, value, container){
      const label = document.createElement('label');
      label.style.marginRight = '10px';
      label.style.display = 'block';
      label.innerHTML = `<input type="checkbox" value="${value}"> ${name}`;
      container.appendChild(label);
    }

    // Populate filters
    const indicators = [...new Set(data.map(d=>d.name))].sort();
    const countries = [...new Set(data.map(d=>d.country))].sort();
    const years = [...new Set(data.map(d=>d.year))].sort();

    indicators.forEach(i => createCheckbox(i,i,indicatorContainer));
    countries.forEach(c => createCheckbox(c,c,countryContainer));
    years.forEach(y => createCheckbox(y,y,yearContainer));

    // Select All checkboxes
    function setupSelectAll(selectAllId, container){
      const selectAll = document.getElementById(selectAllId);
      selectAll.addEventListener('change', e=>{
        const checked = e.target.checked;
        container.querySelectorAll('input[type=checkbox]').forEach(cb=>cb.checked=checked);
      });
    }
    setupSelectAll('indicatorSelectAll', indicatorContainer);
    setupSelectAll('countrySelectAll', countryContainer);
    setupSelectAll('yearSelectAll', yearContainer);

    // Search filters
    function filterSearch(inputId, container){
      document.getElementById(inputId).addEventListener('input', e => {
        const search = e.target.value.toLowerCase();
        Array.from(container.children).forEach(label=>{
          label.style.display = label.textContent.toLowerCase().includes(search)?'block':'none';
        });
      });
    }
    filterSearch('indicatorSearch', indicatorContainer);
    filterSearch('countrySearch', countryContainer);

    function getSelected(container){
      return Array.from(container.querySelectorAll('input[type=checkbox]:checked')).map(cb=>cb.value);
    }

    function displayTable(filtered){
      tbody.innerHTML='';
      if(!filtered.length) return;

      const allYears = [...new Set(filtered.map(d=>d.year))].sort().reverse();
      theadRow.innerHTML='<th>Indicator</th><th>Category</th><th>Country</th>';
      allYears.forEach(y => theadRow.appendChild(document.createElement('th')).textContent = y);
      theadRow.appendChild(document.createElement('th')).textContent = "Notes";
      theadRow.appendChild(document.createElement('th')).textContent = "Source";

      const combos = [...new Set(filtered.map(d=>`${d.name}|${d.category}|${d.country}`))];
      combos.forEach(ind=>{
        const [name, category, country] = ind.split('|');
        const row = document.createElement('tr');
        const noteItem = filtered.find(d=>d.name===name && d.category===category && d.country===country);
        row.innerHTML=`<td>${name}</td><td>${category}</td><td>${country}</td>`;
        allYears.forEach(y=>{
          const item = filtered.find(d=>d.name===name && d.category===category && d.country===country && d.year===y);
          const td = document.createElement('td');
          td.textContent = item?item.value:'-';
          row.appendChild(td);
        });
        row.appendChild(document.createElement('td')).textContent = noteItem ? noteItem.notes : '';
        row.appendChild(document.createElement('td')).textContent = noteItem ? noteItem.source : '';
        tbody.appendChild(row);
      });
    }

    function displayChart(filtered){
      const indicators = [...new Set(filtered.map(d=>d.name))];
      const countries = [...new Set(filtered.map(d=>d.country))];
      const years = [...new Set(filtered.map(d=>d.year))].sort();

      const datasets = [];
      indicators.forEach(ind=>{
        countries.forEach(c=>{
          const dataPoints = years.map(y=>{
            const item = filtered.find(d=>d.name===ind && d.country===c && d.year===y);
            return item?item.value:null;
          });
          datasets.push({
            label: `${ind} (${c})`,
            data: dataPoints,
            borderColor: `hsl(${Math.random()*360},70%,50%)`,
            fill:false,
            tension:0.3
          });
        });
      });

      if(chartInstance) chartInstance.destroy();
      chartInstance = new Chart(ctx,{
        type:'line',
        data:{ labels:years, datasets },
        options:{
          responsive:true,
          interaction:{ mode:'index', intersect:false },
          plugins:{ legend:{ position:'bottom' } },
          scales:{ y:{ beginAtZero:true } }
        }
      });
      chartContainer.style.display='block';
    }

    document.getElementById('showBtn').addEventListener('click',()=>{
      const selectedIndicators = getSelected(indicatorContainer);
      const selectedCountries = getSelected(countryContainer);
      const selectedYears = getSelected(yearContainer);

      const filtered = data.filter(d=>
        (!selectedIndicators.length || selectedIndicators.includes(d.name)) &&
        (!selectedCountries.length || selectedCountries.includes(d.country)) &&
        (!selectedYears.length || selectedYears.includes(d.year))
      );

      tableContainer.style.display = filtered.length?'block':'none';
      displayTable(filtered);
      if(filtered.length) displayChart(filtered);
      else chartContainer.style.display='none';
    });

    document.getElementById('downloadBtn').addEventListener('click',()=>{
      const headers = Array.from(document.querySelectorAll('#dataTable th')).map(h=>h.textContent);
      let csv="data:text/csv;charset=utf-8," + headers.join(",") + "\n";
      document.querySelectorAll('#dataTable tbody tr').forEach(row=>{
        csv+= Array.from(row.querySelectorAll('td')).map(td=>td.textContent).join(",") + "\n";
      });
      const link=document.createElement('a');
      link.href=encodeURI(csv);
      link.download='data_repository.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

  })
  .catch(err=>console.error(err));
