# Preston Consults Data Explorer - Unified Version

Professional single-page data explorer with dynamic timeframe switching and smart year filtering.

## 📁 File Structure

```
data-explorer/
├── index.html              # Main unified data explorer
├── about.html              # Team profiles and information
├── styles.css              # Responsive styles with mobile menu
├── app.js                  # Smart timeframe switching logic
├── annual-data.csv         # Annual data (2018-2024)
├── quarterly-data.csv      # Quarterly data (2018Q1-2024Q4)
└── monthly-data.csv        # Monthly data (2018-01 to 2024-12)
```

## 🎯 Key Features

### 1. Unified Interface
- **One page** for all timeframes (Annual/Quarterly/Monthly)
- Switch between timeframes without page reload
- Dynamic data loading based on selection

### 2. Smart Year Filtering
- Year filter always shows: `2018, 2019, 2020, ..., 2024`
- **Behind the scenes:**
  - **Annual**: Selecting "2018" → Shows column `2018`
  - **Quarterly**: Selecting "2018" → Shows `2018Q1, 2018Q2, 2018Q3, 2018Q4`
  - **Monthly**: Selecting "2018" → Shows all 12 months `2018-01` through `2018-12`

### 3. Responsive Design
- **Desktop**: Sidebar always visible
- **Tablet**: Sidebar collapsible
- **Mobile**: 
  - Hamburger menu (☰) to show/hide filters
  - Timeframe buttons fixed at bottom
  - Sidebar slides in from left
  - Click overlay to close

### 4. Complete Features
- ✅ Table view with frozen first column
- ✅ Pagination (10/25/50/100 rows per page)
- ✅ Chart view with dropdown selectors
- ✅ Export filtered data to CSV
- ✅ Search within filters
- ✅ Accordion filters
- ✅ About page with team profiles

## 🚀 Setup Instructions

### Quick Start

1. **Upload all files** to your `data-explorer` directory on GitHub:
   ```
   - index.html
   - about.html
   - styles.css
   - app.js
   - annual-data.csv
   - quarterly-data.csv
   - monthly-data.csv
   ```

2. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Select `main` branch and `/ (root)` folder
   - Save

3. **Access your site**:
   ```
   https://prestonconsults.github.io/data-explorer/
   ```

That's it! No subdirectories, no complex structure.

## 📊 Data File Formats

### Annual Data (annual-data.csv)
```csv
Indicator,Category,Country,Notes,Source,2018,2019,2020,2021,2022,2023,2024
GDP Growth Rate,Economic,Nigeria,Annual percentage growth,World Bank,1.9,2.2,-1.8,3.6,3.3,2.9,3.2
```
- **Column format**: `YYYY` (e.g., 2018, 2019)
- **7 year columns**: 2018 through 2024

### Quarterly Data (quarterly-data.csv)
```csv
Indicator,Category,Country,Notes,Source,2018Q1,2018Q2,2018Q3,2018Q4,...,2024Q4
GDP Growth Rate,Economic,Nigeria,Quarterly growth,World Bank,1.8,1.9,2.0,1.9,...,3.3
```
- **Column format**: `YYYYQ#` (e.g., 2018Q1, 2019Q2)
- **28 quarter columns**: 2018Q1 through 2024Q4

### Monthly Data (monthly-data.csv)
```csv
Indicator,Category,Country,Notes,Source,2018-01,2018-02,2018-03,...,2024-12
Inflation Rate,Economic,Nigeria,Monthly CPI,IMF,11.7,11.8,11.9,...,30.6
```
- **Column format**: `YYYY-MM` (e.g., 2018-01, 2019-12)
- **84 month columns**: 2018-01 through 2024-12

## 🎨 User Interface

### Header
```
┌──────────────────────────────────────────────────────┐
│ [☰] Preston Consults | [Annual|Quarterly|Monthly] | About │
└──────────────────────────────────────────────────────┘
```

### Desktop Layout
```
┌─────────────┬────────────────────────────────────┐
│  Filters    │  [Table View | Chart View]        │
│  Sidebar    │                                    │
│             │  Content Area                      │
│  - Indicator│  (Table or Chart)                  │
│  - Country  │                                    │
│  - Year     │                                    │
│             │                                    │
│ [Show]      │                                    │
└─────────────┴────────────────────────────────────┘
```

### Mobile Layout
```
┌────────────────────────┐
│ [☰] Preston Consults   │  ← Click ☰ to show filters
├────────────────────────┤
│                        │
│  Content Area          │
│  (Full width)          │
│                        │
│                        │
├────────────────────────┤
│ [Annual|Quarter|Month] │  ← Fixed at bottom
└────────────────────────┘
```

## 💡 How It Works

### 1. Timeframe Switching

When user clicks **Quarterly**:
```javascript
1. Button becomes active
2. Loads quarterly-data.csv
3. Parses columns using regex /^\d{4}Q[1-4]$/
4. Extracts unique years (2018, 2019, etc.)
5. Populates year filter with just years
6. Resets UI
```

### 2. Year Expansion

User selects years `[2018, 2020]` and clicks "Show Results":

**Annual mode**:
- Shows columns: `2018, 2020`

**Quarterly mode**:
- Expands to: `2018Q1, 2018Q2, 2018Q3, 2018Q4, 2020Q1, 2020Q2, 2020Q3, 2020Q4`

**Monthly mode**:
- Expands to: `2018-01, 2018-02, ..., 2018-12, 2020-01, 2020-02, ..., 2020-12`

### 3. Data Flow

```
User Action → Filter Selection → Year Expansion → Data Filtering → Display
```

## 🔧 Technical Details

### Regex Patterns
```javascript
annual: /^\d{4}$/              // Matches: 2018, 2019
quarterly: /^\d{4}Q[1-4]$/      // Matches: 2018Q1, 2019Q2
monthly: /^\d{4}-\d{2}$/        // Matches: 2018-01, 2019-12
```

### Year Expansion Logic
```javascript
// Annual
expandYear('2018') → ['2018']

// Quarterly
expandYear('2018') → ['2018Q1', '2018Q2', '2018Q3', '2018Q4']

// Monthly
expandYear('2018') → ['2018-01', '2018-02', ..., '2018-12']
```

## 📱 Responsive Breakpoints

- **Desktop** (>1024px): Sidebar always visible, 3-button timeframe
- **Tablet** (768px-1024px): Collapsible sidebar
- **Mobile** (<768px): 
  - Hamburger menu
  - Slide-in sidebar
  - Fixed bottom timeframe selector
  - Vertical timeframe buttons

## 🎓 About Page

Located at `about.html`:
- Team member profiles (4 members)
- Expertise areas
- Mission statement
- Approach methodology
- Data sources
- Contact information

**Navigation**: Click "About Team" in header

## 🚢 Deployment Checklist

- [ ] All 7 files uploaded to repository
- [ ] GitHub Pages enabled
- [ ] Test annual data loads
- [ ] Test quarterly data loads
- [ ] Test monthly data loads
- [ ] Test on mobile device
- [ ] Test hamburger menu
- [ ] Test About page link
- [ ] Test data export

## 🆚 Advantages Over Multi-Directory Approach

| Feature | Unified (New) | Multi-Directory (Old) |
|---------|--------------|----------------------|
| Files to maintain | 7 | 15+ |
| Code duplication | None | 3x app.js |
| User navigation | Single page | Multiple pages |
| Timeframe switching | Instant | Page reload |
| Mobile experience | Optimized | Standard |
| Year filtering | Smart | Manual |
| Updates | One place | Three places |

## 📧 Support

**Developed by**: Preston Consults Ltd Research and Data Analysis Team  
**Email**: research@prestonconsults.com  
**GitHub**: https://github.com/prestonconsults/data-explorer

## 📝 License

© 2025 Preston Consults Ltd. All rights reserved.

---

**Enjoy your unified, professional data explorer! 🎉**
