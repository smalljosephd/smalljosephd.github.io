let chartInstance = null;

// Replace with your Google Sheets CSV URL
const sheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTKDHY91czNF0C9f3wTswf9uKTvipREeIuQZJT-zgELMRO6fS1bQUWTSdE30bo7TYlTaZaujWxCkjbh/pub?output=csv';

fetch(sheetURL)
  .then(res => res.text())
  .then(csvText => {
    const rows = csvText.trim().split('\n');
    const headers = rows.shift().split(','); // headers include years
    const yearColumns = headers.filter(h => /^\d{4}$/.test(h)); // columns that are years
    const otherColumns = headers.filter(h => !/^\d{4}$/.test(h)); // name, category, country, notes, source

    const data = rows.map(r=>{
      const cols = r.split(',');
      const obj = {};
      otherColumns.forEach((h,i)=> obj[h.trim()] = cols[i]?.trim()||'');
      yearColumns.forEach((y,i)=> obj[y] = Number(cols[otherColumns.length + i])||null);
      return obj;
    });

    const indicatorContainer = document.getElementById('indicatorFilters');
    const countryContainer = document.getElementById('countryFilters');
    const yearContainer = document.getElementById('yearFilters');
    const tableContainer = document.getElementById('tableContainer');
    const tbody = document.querySelector('#dataTable tbody');
    const theadRow = document.getElementById('tableHeader');
    const chartContainer = document.getElementById('chartContainer');
    const ctx = document.getElementById('chartCanvas').getContext('2d');

    function createCheckbox(name, value, container){
      const label = document.createElement('label');
      label.style.marginRight = '10px';
      label.style.display = 'block';
      label.innerHTML = `<input type="checkbox" value="${value}"> ${name}`;
      container.appendChild(label);
    }

    const indicators = [...new Set(data.map(d=>d[otherColumns[0]]))].sort();
    const countries = [...new Set(data.map(d=>d[otherColumns[2]]))].sort();
    const years = yearColumns.sort((a,b)=>a-b); // ascending order

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

      // Table header
      theadRow.innerHTML='';
      theadRow.appendChild(document.createElement('th')).textContent = otherColumns[0]; // Indicator
      theadRow.appendChild(document.createElement('th')).textContent = otherColumns[1]; // Category
      theadRow.appendChild(document.createElement('th')).textContent = otherColumns[2]; // Country
      years.forEach(y=>{
        const th = document.createElement('th');
        th.textContent = y;
        theadRow.appendChild(th);
      });
      theadRow.appendChild(document.createElement('th')).textContent = 'Notes';
      theadRow.appendChild(document.createElement('th')).textContent = 'Source';

      filtered.forEach(d=>{
        const row = document.createElement('tr');
        row.innerHTML=`<td>${d[otherColumns[0]]}</td><td>${d[otherColumns[1]]}</td><td>${d[otherColumns[2]]}</td>`;
        years.forEach(y=>{
          const td = document.createElement('td');
          td.textContent = d[y] !== null ? d[y] : '-';
          row.appendChild(td);
        });
        row.appendChild(document.createElement('td')).textContent = d['notes']||'';
        row.appendChild(document.createElement('td')).textContent = d['source']||'';
        tbody.appendChild(row);
      });

      tableContainer.style.display='block';
    }

    document.getElementById('showBtn').addEventListener('click',()=>{
      const selectedIndicators = getSelected(indicatorContainer);
      const selectedCountries = getSelected(countryContainer);
      const selectedYears = getSelected(yearContainer);

      let filtered = data.filter(d=>
        (!selectedIndicators.length || selectedIndicators.includes(d[otherColumns[0]])) &&
        (!selectedCountries.length || selectedCountries.includes(d[otherColumns[2]]))
      );

      if(selectedYears.length){
        filtered = filtered.map(d=>{
          const newObj = {...d};
          yearColumns.forEach(y=>{ if(!selectedYears.includes(y)) newObj[y]=null; });
          return newObj;
        });
      }

      displayTable(filtered);
      chartContainer.style.display='none';
    });

    document.getElementById('downloadBtn').addEventListener('click',()=>{
      let csv='data:text/csv;charset=utf-8,';
      const allHeaders = [otherColumns[0],otherColumns[1],otherColumns[2],...years,'notes','source'];
      csv += allHeaders.join(',') + '\n';
      document.querySelectorAll('#dataTable tbody tr').forEach(row=>{
        const rowText = Array.from(row.querySelectorAll('td')).map(td=>td.textContent).join(',');
        csv+= rowText + '\n';
      });
      const link = document.createElement('a');
      link.href = encodeURI(csv);
      link.download = 'data_repository.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

  })
  .catch(err=>console.error(err));
