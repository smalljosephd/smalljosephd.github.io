# Preston Consults Data Repository

Professional data explorer with multi-timeframe analysis capabilities.

## 📁 Directory Structure

```
data-explorer/
│
├── index.html              # Home page (rename home-index.html to this)
├── home-styles.css         # Home page styles
│
├── annual/
│   ├── index.html          # Annual data explorer
│   ├── app.js              # Annual data logic
│   ├── data.csv            # Annual dataset (2018-2024)
│   └── styles.css          # Shared styles
│
├── quarterly/
│   ├── index.html          # Quarterly data explorer
│   ├── app.js              # Quarterly data logic
│   ├── data.csv            # Quarterly dataset (Q1 2018 - Q4 2024)
│   └── styles.css          # Shared styles
│
└── monthly/
    ├── index.html          # Monthly data explorer
    ├── app.js              # Monthly data logic
    ├── data.csv            # Monthly dataset (Jan 2018 - Dec 2024)
    └── styles.css          # Shared styles
```

## 🚀 Setup Instructions

### Step 1: Create Directory Structure
In your `data-explorer` folder on GitHub:

1. Rename `home-index.html` to `index.html` (this becomes your root page)
2. Keep `home-styles.css` in the root
3. Create three subdirectories: `annual/`, `quarterly/`, `monthly/`

### Step 2: Set Up Annual Directory
Copy these files into `annual/`:
- `index.html` (the one we created earlier)
- `app.js`
- `styles.css`
- `data.csv`

### Step 3: Set Up Quarterly Directory
1. Copy all files from `annual/` to `quarterly/`
2. Update `data.csv` with quarterly data structure:
   ```csv
   Indicator,Category,Country,Notes,Source,2018Q1,2018Q2,2018Q3,2018Q4,2019Q1,...,2024Q4
   ```

### Step 4: Set Up Monthly Directory
1. Copy all files from `annual/` to `monthly/`
2. Update `data.csv` with monthly data structure:
   ```csv
   Indicator,Category,Country,Notes,Source,2018-01,2018-02,2018-03,...,2024-12
   ```

## 📊 Data Format Examples

### Annual Data (Already Set Up)
```csv
Indicator,Category,Country,Notes,Source,2018,2019,2020,2021,2022,2023,2024
GDP Growth Rate,Economic,Nigeria,Annual percentage growth,World Bank,1.9,2.2,-1.8,3.6,3.3,2.9,3.2
```

### Quarterly Data (To Be Created)
```csv
Indicator,Category,Country,Notes,Source,2018Q1,2018Q2,2018Q3,2018Q4,2019Q1,2019Q2,2019Q3,2019Q4,...,2024Q4
GDP Growth Rate,Economic,Nigeria,Quarterly percentage growth,World Bank,1.8,2.0,1.9,2.0,2.1,2.3,2.2,2.1,...,3.3
```

### Monthly Data (To Be Created)
```csv
Indicator,Category,Country,Notes,Source,2018-01,2018-02,2018-03,...,2024-12
Inflation Rate,Economic,Nigeria,Monthly percentage,IMF,12.0,12.2,12.1,...,30.1
```

## 🎨 Features

### Home Page
- ✅ Professional landing page with navigation cards
- ✅ Feature highlights
- ✅ Data category preview
- ✅ Responsive design

### Data Explorers (All Timeframes)
- ✅ Accordion filters (Indicators, Countries, Years/Quarters/Months)
- ✅ Table view with frozen first column
- ✅ Pagination (10/25/50/100 rows per page)
- ✅ Chart view with dynamic dropdowns
- ✅ Export filtered data to CSV
- ✅ Search within filters
- ✅ Select All functionality

## 🔗 Navigation Flow

```
Home Page (index.html)
    ↓
    ├── Annual Data → /annual/index.html
    ├── Quarterly Data → /quarterly/index.html
    └── Monthly Data → /monthly/index.html
```

## 📝 Notes

1. **File Paths**: The home page uses relative links (`annual/index.html`, etc.)
2. **Styles**: Each subdirectory uses the same `styles.css` (you can share one or keep copies)
3. **CSV Headers**: Year columns are auto-detected by regex pattern:
   - Annual: `^\d{4}$` (e.g., 2018, 2019)
   - Quarterly: Modify to detect `^\d{4}Q[1-4]$` (e.g., 2018Q1, 2019Q2)
   - Monthly: Modify to detect `^\d{4}-\d{2}$` (e.g., 2018-01, 2024-12)

4. **Chart.js**: Already included via CDN in all pages

## 🌐 GitHub Pages Deployment

1. Commit all files to your repository
2. Go to Settings → Pages
3. Select branch (usually `main`) and root folder
4. Your site will be live at: `https://prestonconsults.github.io/data-explorer/`

## 📧 Support

Developed by: Preston Consults Ltd Research and Data Analysis Team

---

**Pro Tip**: For quarterly and monthly explorers, you may want to adjust the `app.js` regex pattern to detect the different year column formats!
