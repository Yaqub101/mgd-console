import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "report_screenshots")
os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"Output directory for report screenshots: {OUTPUT_DIR}")

options = Options()
options.add_argument("--headless=new")
options.add_argument("--window-size=1600,1050")
options.add_argument("--device-scale-factor=2")
options.add_argument("--force-device-scale-factor=2")
options.add_argument("--disable-gpu")
options.add_argument("--hide-scrollbars")

driver = webdriver.Chrome(options=options)
wait = WebDriverWait(driver, 10)

def snap_element_or_screen(name, element=None):
    time.sleep(0.5)
    filepath = os.path.join(OUTPUT_DIR, f"{name}.png")
    if element:
        element.screenshot(filepath)
    else:
        driver.save_screenshot(filepath)
    size_kb = os.path.getsize(filepath) / 1024
    print(f"  [+] Saved {name}.png ({size_kb:.1f} KB)")

try:
    print("[1/18] Loading MyGymDiary Console at http://localhost:8080 ...")
    driver.get("http://localhost:8080")
    time.sleep(2)

    # Ensure sample data is loaded
    driver.execute_script("""
        if (!window.LAST_RESULT) {
            const btn = document.getElementById('btn-load-sample');
            if (btn) btn.click();
        }
    """)
    time.sleep(2)

    # 1. Full Dashboard Overview
    print("[2/18] Capturing 01_Dashboard_Overview ...")
    driver.execute_script("window.switchView('dashboard');")
    time.sleep(1)
    snap_element_or_screen("01_Dashboard_Overview")

    # 2. Gender & BMI Categories (Element crop)
    print("[3/18] Capturing 02_Dashboard_Gender_and_BMI ...")
    try:
        charts_grid = driver.find_elements(By.CSS_SELECTOR, "#view-dashboard .charts-grid")
        if charts_grid:
            snap_element_or_screen("02_Dashboard_Gender_and_BMI", charts_grid[0])
    except Exception as e:
        print("    Warning on 02:", e)

    # 3. Fitness Goals & Weight Distribution (Element crop)
    print("[4/18] Capturing 03_Dashboard_Goals_and_Weight ...")
    try:
        charts_grid = driver.find_elements(By.CSS_SELECTOR, "#view-dashboard .charts-grid")
        if len(charts_grid) > 1:
            snap_element_or_screen("03_Dashboard_Goals_and_Weight", charts_grid[1])
    except Exception as e:
        print("    Warning on 03:", e)

    # 4. Biometric Correlation Scatter Plot (Height vs Weight)
    print("[5/18] Capturing 04_Dashboard_Biometric_Scatter ...")
    try:
        scatter_card = driver.find_element(By.CSS_SELECTOR, "#view-dashboard .chart-card:has(#scatter-chart)")
        snap_element_or_screen("04_Dashboard_Biometric_Scatter", scatter_card)
    except Exception:
        # Fallback to canvas parent
        canvas = driver.find_element(By.ID, "scatter-chart")
        parent = driver.execute_script("return arguments[0].closest('.chart-card');", canvas)
        snap_element_or_screen("04_Dashboard_Biometric_Scatter", parent)

    # Switch to Practicals Hub
    print("[6/18] Navigating to Practicals Hub (P1-P10) ...")
    driver.execute_script("window.switchView('practicals');")
    time.sleep(1)

    # 5. P1: Stakeholder Story & Big Idea
    print("[7/18] Capturing 05_Practical_P1_Stakeholder_Story ...")
    driver.execute_script("""
        document.querySelector('[data-ptarget="p1"]').click();
    """)
    time.sleep(0.8)
    p1_section = driver.find_element(By.ID, "psection-p1")
    snap_element_or_screen("05_Practical_P1_Stakeholder_Story", p1_section)

    # 6. P2: Audience Adaptation & Visual Selection
    print("[8/18] Capturing 06_Practical_P2_Audience_Tone ...")
    driver.execute_script("""
        document.querySelector('[data-ptarget="p2"]').click();
    """)
    time.sleep(0.8)
    p2_section = driver.find_element(By.ID, "psection-p2")
    snap_element_or_screen("06_Practical_P2_Audience_Tone", p2_section)

    # 7. P3: Clutter Elimination & Pre-Attentive Highlighting
    print("[9/18] Capturing 07_Practical_P3_Declutter_Comparison ...")
    driver.execute_script("""
        document.querySelector('[data-ptarget="p3"]').click();
    """)
    time.sleep(1)
    p3_section = driver.find_element(By.ID, "psection-p3")
    snap_element_or_screen("07_Practical_P3_Declutter_Comparison", p3_section)

    # 8. P4: Operational Incident Deep-Dive Timeline Curve
    print("[10/18] Capturing 08_Practical_P4_Incident_Timeline ...")
    driver.execute_script("""
        document.querySelector('[data-ptarget="p4"]').click();
    """)
    time.sleep(1)
    p4_section = driver.find_element(By.ID, "psection-p4")
    snap_element_or_screen("08_Practical_P4_Incident_Timeline", p4_section)

    # 9. P5: 3-Part Video Presentation Storyteller
    print("[11/18] Capturing 09_Practical_P5_Video_Storyteller ...")
    driver.execute_script("""
        document.querySelector('[data-ptarget="p5"]').click();
    """)
    time.sleep(0.8)
    p5_section = driver.find_element(By.ID, "psection-p5")
    snap_element_or_screen("09_Practical_P5_Video_Storyteller", p5_section)

    # 10. P6: MyGymDiary Wrapped (Personalized Spotify-Style Case Study)
    print("[12/18] Capturing 10_Practical_P6_Spotify_Wrapped ...")
    driver.execute_script("""
        document.querySelector('[data-ptarget="p6"]').click();
    """)
    time.sleep(1)
    p6_section = driver.find_element(By.ID, "psection-p6")
    snap_element_or_screen("10_Practical_P6_Spotify_Wrapped", p6_section)

    # 11. P7: Data Quality Profiler & Tukey IQR Outliers
    print("[13/18] Capturing 11_Practical_P7_Data_Quality_IQR ...")
    driver.execute_script("""
        document.querySelector('[data-ptarget="p7"]').click();
    """)
    time.sleep(1)
    p7_section = driver.find_element(By.ID, "psection-p7")
    snap_element_or_screen("11_Practical_P7_Data_Quality_IQR", p7_section)

    # 12. P8: Dynamic Histogram & Bell Curve Overlay
    print("[14/18] Capturing 12_Practical_P8_Dynamic_Histogram_BellCurve ...")
    driver.execute_script("""
        document.querySelector('[data-ptarget="p8"]').click();
    """)
    time.sleep(1)
    p8_section = driver.find_element(By.ID, "psection-p8")
    snap_element_or_screen("12_Practical_P8_Dynamic_Histogram_BellCurve", p8_section)

    # 13. P9: Multi-Distribution & Box Plot
    print("[15/18] Capturing 13_Practical_P9_Comparative_BoxPlot ...")
    driver.execute_script("""
        document.querySelector('[data-ptarget="p9"]').click();
    """)
    time.sleep(1)
    p9_section = driver.find_element(By.ID, "psection-p9")
    snap_element_or_screen("13_Practical_P9_Comparative_BoxPlot", p9_section)

    # 14. P10: Proportional Analysis Arena (Pie vs Horizontal Bar)
    print("[16/18] Capturing 14_Practical_P10_Pie_vs_HorizontalBar ...")
    driver.execute_script("""
        document.querySelector('[data-ptarget="p10"]').click();
    """)
    time.sleep(1)
    p10_section = driver.find_element(By.ID, "psection-p10")
    snap_element_or_screen("14_Practical_P10_Pie_vs_HorizontalBar", p10_section)

    # 15. Client Roster & Athlete Table
    print("[17/18] Capturing 15_Client_Roster_Table ...")
    driver.execute_script("window.switchView('clients');")
    time.sleep(1)
    snap_element_or_screen("15_Client_Roster_Table")

    # 16. Athlete Dossier Modal (with Weight History Line Chart)
    print("[18/18] Capturing 16_Athlete_Dossier_Modal_Chart ...")
    try:
        driver.execute_script("window.switchView('clients');")
        time.sleep(0.8)
        cell = driver.find_element(By.CSS_SELECTOR, ".client-name-cell")
        cell.click()
        time.sleep(1)
        modal_content = driver.find_element(By.CSS_SELECTOR, "#client-modal .modal-content")
        snap_element_or_screen("16_Athlete_Dossier_Modal_Chart", modal_content)
        driver.execute_script("document.getElementById('close-modal').click();")
        time.sleep(0.5)
    except Exception as e:
        print("    Warning on 16:", e)

    # 17. Goal Prediction Feasibility Simulation
    print("[Bonus 1] Capturing 17_Goal_Feasibility_Prediction ...")
    try:
        driver.execute_script("window.switchView('prediction');")
        time.sleep(0.8)
        driver.execute_script("""
            const sel = document.getElementById('pred-client-select');
            if (sel && sel.options.length > 1) {
                sel.selectedIndex = 1;
                sel.dispatchEvent(new Event('change'));
            }
            const btn = document.getElementById('btn-analyze-prediction');
            if (btn) btn.click();
        """)
        time.sleep(1)
        snap_element_or_screen("17_Goal_Feasibility_Prediction")
    except Exception as e:
        print("    Warning on 17:", e)

    # 18. High Contrast Older-Monitor Theme Comparison
    print("[Bonus 2] Capturing 18_High_Contrast_Mode_Display ...")
    try:
        driver.execute_script("window.switchView('dashboard');")
        time.sleep(0.5)
        driver.execute_script("document.getElementById('btn-toggle-contrast').click();")
        time.sleep(1)
        snap_element_or_screen("18_High_Contrast_Mode_Display")
    except Exception as e:
        print("    Warning on 18:", e)

    print("\n[SUCCESS] All screenshots captured successfully in:", OUTPUT_DIR)

finally:
    driver.quit()
