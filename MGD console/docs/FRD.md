FUNCTIONAL REQUIREMENT DOCUMENT (FRD)

Now we define exact system behavior.

1. CSV Upload Module
Input:

CSV file (.csv format)

Required Columns:

Name

Age

Gender

Weight

Height

BodyFat

Goal

System Behavior:

Validate file format

Check required columns

Display error if missing

Load into memory for processing

2. Data Cleaning Module

System must:

Remove rows with missing required values

Convert numeric columns to float or integer

Standardize Gender values (Male/Female)

Trim extra spaces in text fields

3. Feature Engineering Module
BMI Calculation

Formula:

BMI = Weight (kg) / (Height in meters)^2

Height must be converted from cm to meters.

Store result in new column:

BMI

4. BMI Classification Logic

Apply following rules:

BMI < 18.5 → Underweight

18.5 ≤ BMI < 25 → Normal

BMI ≥ 25 → Overweight

Store result in:

BMI_Category

5. Dashboard Metrics Module

System must compute:

Total Clients

Male Count

Female Count

Average Weight

Average BMI

Most Common Goal

6. Visualization Module

System must generate:

Gender Distribution (Pie Chart)

BMI Category Distribution (Bar Chart)

Goal Distribution (Bar Chart)

Weight Distribution (Histogram)

Charts must reflect processed data.

7. Client Listing Module

System must:

Display all clients in tabular format

Allow clicking on a client name

8. Client Detail Module

On client selection, system must display:

Name

Age

Gender

Weight

Height

Body Fat %

BMI

BMI Category

Goal

9. Insight Generation Module (Rule-Based)

System must evaluate:

Rule 1

If Overweight clients > 50%
→ Display insight:
"Majority of clients fall in the overweight category."

Rule 2

If Fat Loss goal > 60%
→ Display insight:
"Most clients are focused on fat reduction."

Rule 3

If Average BMI > 25
→ Display:
"Overall client BMI indicates elevated weight trends."

Insights must be dynamically generated.

📊 DATA SCHEMA

This defines exact dataset structure.

Expected CSV Schema
Column Name	Data Type	Required	Description
Name	String	Yes	Client full name
Age	Integer	Yes	Age in years
Gender	String	Yes	Male / Female
Weight	Float	Yes	Weight in kg
Height	Float	Yes	Height in cm
BodyFat	Float	Optional	Body fat percentage
Goal	String	Yes	Fitness goal
Derived Columns (System Generated)
Column Name	Data Type	Description
BMI	Float	Calculated body mass index
BMI_Category	String	Underweight / Normal / Overweight