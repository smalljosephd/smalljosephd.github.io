let chartInstance = null;

const sheetURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTKDHY91czNF0C9f3wTswf9uKTvipREeIuQZJT-zgELMRO6fS1bQUWTSdE30bo7TYlTaZaujWxCkjbh/pub?output=csv";

Papa.parse(sheetURL, {
  download: true,
  header: true,
  skipEmptyLines: true,
  complete: function (results) {
    const rawData = results.data;

    // Detect year columns EXACTLY from headers
    const headers = results.meta.fields;
    const yearColumns = headers.filter(h => /^\d{4}$/.test(h));
    const yearColumnsSorted = yearColumns.sort((a, b) => Number(a) - Number(b));

    const indicatorKey = "Indicator";
    const categoryKey = "Category";
    const countryKey = "Country";
    const notesKey = "Notes";
    const sourceKey = "Source";

    const indicatorContainer = document.getElementById("indicatorFilters");
    const countryContainer = document.getElementById("countryFilters");
    const yearContainer = document.getElementById("yearFilters");
    const tableContainer = document.getElementById("tableContainer");
    const tbody = document.querySelector("#dataTable tbody");
    const theadRow = document.getElementById("tableHeader");
    const chartContainer = document.getElementById("chartContainer");
    const ctx = document.getElementById("chartCanvas").getContext("2d");

    function createCheckbox(value, container) {
      const label = document.createElement("label");
      label.style.display = "block";
      label.innerHTML = `<input type="checkbox" value="${value}"> ${value}`;
      container.appendChild(label);
    }

    // Populate filters
    [...new Set(rawData.map(d => d[indicatorKey]))]
      .sort()
      .forEach(v => createCheckbox(v, indicatorContainer));

    [...new Set(rawData.map(d => d[countryKey]))]
      .sort()
      .forEach(v => createCheckbox(v, countryContainer));

    yearColumnsSorted.forEach(y => createCheckbox(y, yearContainer));

    function setupSelectAll(id, container) {
      document.getElementById(id).addEventListener("change", e => {
        container.querySelectorAll("input").forEach(cb => {
          cb.checked = e.target.checked;
        });
      });
    }

    setupSelectAll("indicatorSelectAll", indicatorContainer);
    setupSelectAll("countrySelectAll", countryContainer);
    setupSelectAll("yearSelectAll", yearContainer);

    function getSelected(container) {
      return Array.from(container.querySelectorAll("input:checked")).map(
        cb => cb.value
      );
    }

    function renderTable(data, selectedYears) {
      tbody.innerHTML = "";
      theadRow.innerHTML = "";

      ["Indicator", "Category", "Country", "Notes", "Source"].forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        theadRow.appendChild(th);
      });

      selectedYears.forEach(y => {
        const th = document.createElement("th");
        th.textContent = y;
        theadRow.appendChild(th);
      });

      data.forEach(row => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td>${row[indicatorKey]}</td>
          <td>${row[categoryKey]}</td>
          <td>${row[countryKey]}</td>
          <td>${row[notesKey] || ""}</td>
          <td>${row[sourceKey] || ""}</td>
        `;

        selectedYears.forEach(y => {
          const td = document.createElement("td");
          td.textContent = row[y] !== "" && row[y] != null ? row[y] : "...";
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });

      tableContainer.style.display = "block";
    }

    function renderChart(data, selectedYears) {
      if (!data.length) return;

      const first = data[0];
      const values = selectedYears.map(y => Number(first[y]) || null);

      if (chartInstance) chartInstance.destroy();

      chartInstance = new Chart(ctx, {
        type: "line",
        data: {
          labels: selectedYears,
          datasets: [
            {
              label: first[indicatorKey],
              data: values,
              borderWidth: 2,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: true } }
        }
      });

      chartContainer.style.display = "block";
    }

    document.getElementById("showBtn").addEventListener("click", () => {
      const indicators = getSelected(indicatorContainer);
      const countries = getSelected(countryContainer);
      const years = getSelected(yearContainer);

      const filtered = rawData.filter(d =>
        (!indicators.length || indicators.includes(d[indicatorKey])) &&
        (!countries.length || countries.includes(d[countryKey]))
      );

      renderTable(filtered, years.length ? years : yearColumnsSorted);
      renderChart(filtered, years.length ? years : yearColumnsSorted);
    });
  }
});
