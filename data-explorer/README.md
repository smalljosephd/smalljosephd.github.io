# Preston Consults Internal Data Repository
---

### Welcome to the Preston Consults Ltd Internal Data Repository


This repository is set up to securely store relevant trade, investment, and macroeconomic datasets for ininternal usage.

### This repository is currently managed by [Joseph David](https://smalljosephd.github.io/) and Nonso Nwanosike. If you experience any issues working with this repository, please contact either Joseph or Nonso for assistance.

---

## 📁 File Structure

```
data-explorer/
│
├── index.html              # Home page (landing)
├── all-data.html           # All data explorer
├── trade-data.html         # Trade data explorer
├── about.html              # Team profiles
├── faq.html                # FAQ page
│
├── styles.css              # Shared CSS (includes dark mode)
├── app.js                  # Shared data explorer logic
├── theme.js                # Dark mode functionality
├── navigation.js           # Hamburger menu & scroll behavior
│
└── data/                   # Data files folder
    ├── all-annual-data.csv
    ├── all-quarterly-data.csv
    ├── all-monthly-data.csv
    ├── trade-annual-data.csv
    ├── trade-quarterly-data.csv
    └── trade-monthly-data.csv
```

---

## 🎨 Key Features

### 1. **Home Page** (index.html)
- Hero section
- "Explore Data by Type" cards (All Data & Trade Data)
- Repository features grid
- Data sources section
- Comprehensive footer
- Responsive navigation

### 2. **Shared Header (All Pages)**
**Desktop:**
```
Preston Consults Data Repository | Home | All Data | Trade Data | About | FAQ | Contact | ☀️ |
```

**After Scrolling:**
```
Data Repository | Home | All Data | Trade Data | About | FAQ | Contact | ☀️ |
```

**Mobile:**
```
Data Repository | ☀️ | ☰
```
Click ☰ → Full navigation slides in

### 3. **Dark Mode**
- Click sun/moon icon (☀️/🌙) to toggle
- Preference saved in localStorage
- Works across all pages

### 4. **All Data Explorer** (all-data.html)
- Comprehensive multi-sector data
- Annual/Quarterly/Monthly timeframes
- Table & Chart views
- Export functionality

### 5. **Trade Data Explorer** (trade-data.html)
- Trade-specific indicators
- Same features as All Data Explorer
- Separate data source

### 6. **FAQ Page** (faq.html)
- Accordion-style questions
- Organized by category
- Comprehensive answers

---

## 🚀 Setup Instructions

### Step 1: Upload Your Files

**Required Files (11 total):**
1. index.html (new home page)
2. all-data.html (explorer)
3. trade-data.html (trade explorer)
4. about.html (about team page)
5. faq.html
6. styles.css 
7. app.js 
8. theme.js 
9. navigation.js 
10. Data CSVs (organize in `/data` folder)

### Step 2: Update about.html


### Step 2: Organize Data Files

Create a `data/` folder with:
```
data/
├── all-annual-data.csv (your current annual-data.csv)
├── all-quarterly-data.csv (your current quarterly-data.csv)
├── all-monthly-data.csv (your current monthly-data.csv)
├── trade-annual-data.csv (provided)
├── trade-quarterly-data.csv (create following same pattern)
└── trade-monthly-data.csv (create following same pattern)
```

---

## 🌓 Dark Mode Implementation

**Light Mode (default):**
- Background: #f5f7fa
- Text: #333
- Cards: white
- Headers: Blue gradient

**Dark Mode:**
- Background: #1a1d23
- Text: #e4e6eb
- Cards: #242830
- Headers: Dark blue gradient

**How it works:**
```html
<html data-theme="light">  <!-- or "dark" -->
```

CSS uses:
```css
[data-theme="light"] {
  --bg-primary: #f5f7fa;
  --text-primary: #333;
}

[data-theme="dark"] {
  --bg-primary: #1a1d23;
  --text-primary: #e4e6eb;
}
```

---

## 📱 Responsive Breakpoints

- **Desktop (>1024px):** Full navigation, sidebar visible
- **Tablet (768px-1024px):** Compact header, collapsible sidebar
- **Mobile (<768px):** Hamburger menu, slide-in navigation

---

## 🔧 What Each File Does

| File | Purpose |
|------|---------|
| index.html | Home/landing page |
| all-data.html | Multi-sector data explorer |
| trade-data.html | Trade-specific data explorer |
| about.html | Team profiles |
| faq.html | Frequently asked questions |
| styles.css | All styling (light & dark modes) |
| app.js | Explorer logic (filters, charts, tables) |
| theme.js | Dark mode toggle |
| navigation.js | Menu & header scroll behavior |

---

## 🎯 Navigation Flow

```
Home (index.html)
  ├── All Data Explorer (all-data.html)
  ├── Trade Data Explorer (trade-data.html)
  ├── About Team (about.html)
  ├── FAQ (faq.html)
  └── Contact (index.html#contact)
```


---

## 📧 Need Help?

The structure is now professional and scalable. You can easily:
- Add more explorer pages (e.g., health-data.html)
- Add more data files to /data folder
- Customize dark mode colors
- Add more FAQ questions

---

## 📧 SUPPORT

If you need help or want to add features:

**Email:** info@prestonconsultsltd.com  

--- 

**Developed by:** Preston Consults Ltd Research and Data Analysis Team
