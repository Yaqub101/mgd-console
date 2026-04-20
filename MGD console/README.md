# MGD Console

Trainer Analytics Dashboard - A web-based descriptive analytics system designed for fitness trainers to analyze client data using structured CSV input.

## Features

- **CSV Upload:** Simple drag-and-drop or file selection for client data.
- **Data Cleaning:** Automatically handles missing values and standardizes inputs.
- **Feature Engineering:** Instantly calculates BMI and assigns categories (Underweight, Healthy, Overweight).
- **Dashboard Metrics:** Overview of Total Clients, Average Weight, Average BMI, and Most Common Goals.
- **Data Visualization:** Interactive charts for Demographics, BMI Classification, Weight Distribution, and Primary Goals.
- **Client Roster:** Detailed tabular view of all uploaded clients with clickable names.
- **Automated Insights:** Rule-based engine providing actionable summaries based on user data.

## Architecture

This application strictly adheres to a **3-Layer Architecture**:
1. **Presentation Layer:** Vanilla HTML/CSS/JS with a clean SaaS dashboard layout.
2. **Application Layer:** Javascript Processing Engine performing stateless, in-memory descriptive analytics.
3. **Data Layer:** User-provided CSV source.

*Note: The application uses local memory only. There is no database or persistent storage.*

## Installation & Setup

Because this is a stateless, client-side only Single Page Application (SPA), there is **no complex installation required**.

1. Download or clone this repository.
2. Ensure you have the following folder structure:
   ```
   mgd-console/
   ├── index.html          # Main Application Entry
   ├── Run_On_Laptop.bat   # One-click Windows Server
   ├── data/               # CSV Datasets
   ├── docs/               # Project Documentation
   ├── scripts/            # Generation Scripts
   ├── css/                # Styling
   └── js/                 # Logic
   ```

## Running the Application

You can run this application using any local web server. 

**Option 1: Node.js / NPX (Recommended)**
```bash
npx serve .
```
Then navigate to `http://localhost:3000`

**Option 2: Python**
```bash
python -m http.server 8000
```
Then navigate to `http://localhost:8000`

**Option 3: Windows Batch Script (Easiest)**
1. Double-click the **`Run_On_Laptop.bat`** file in the project folder.
2. It will automatically start a local server and open your browser to the project.

**Option 4: VS Code**
Install the "Live Server" extension, right-click `index.html`, and select "Open with Live Server".

## Transferring to another Laptop/PC

1. **Copy Folder:** Copy the entire `MGD console` folder to a USB drive or upload it to Google Drive/GitHub.
2. **Move:** Paste the folder onto your laptop (e.g., on the Desktop).
3. **Run:** Open the folder on your laptop and double-click **`Run_On_Laptop.bat`**. No installation is required!

## Dependencies

The project uses zero build-tools and relies on CDN-hosted scripts for maximum simplicity and modularity:

- **[Chart.js](https://www.chartjs.org/)** (v4+): For data visualization.
- **[PapaParse](https://www.papaparse.com/)** (v5.4.1): For robust, in-browser CSV parsing.
- **[Lucide Icons](https://lucide.dev/)**: For lightweight SVG icons.
- **Google Fonts**: Inter.

## Usage Guide

1. Open the application in your browser.
2. Click the **"Upload Data"** tab in the sidebar.
3. Upload a CSV from the **`data/`** folder (use `medium_data.csv` for the best demonstration).
4. The system will automatically process the data and redirect you to the **Dashboard**.
5. Navigate to the **Client List** to view detailed individual records. Click a client's name to see their full profile.

## Data Schema Requirements

The uploaded `.csv` must contain the following headers:
- `Name` (String)
- `Age` (Integer)
- `Gender` (String: Male/Female)
- `Weight` (Float, kg)
- `Height` (Float, cm)
- `Goal` (String)
- `BodyFat` (Float, Optional)
