$firstNamesM = @('John', 'Alex', 'Michael', 'David', 'Robert', 'William', 'James', 'Benjamin', 'Lucas', 'Henry', 'Matthew', 'Daniel', 'Joseph', 'Samuel', 'Anthony')
$firstNamesF = @('Jane', 'Emily', 'Sarah', 'Laura', 'Emma', 'Olivia', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn', 'Abigail', 'Ella')
$lastNames = @('Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin')
$goals = @('Fat Loss', 'Muscle Gain', 'Maintenance', 'Endurance')

$csvPath = Join-Path $PSScriptRoot "..\data\medium_data.csv"
"Name,Age,Gender,Weight,Height,BodyFat,Goal" | Out-File -FilePath $csvPath -Encoding ascii

$random = New-Object System.Random
$totalRows = 1200

for ($i = 0; $i -lt $totalRows; $i++) {
    
    # 75% Male, 25% Female to skew the pie chart
    $isMale = $random.NextDouble() -lt 0.75
    
    if ($isMale) {
        $gender = 'M'
        $fName = $firstNamesM[$random.Next(0, $firstNamesM.Length)]
    } else {
        $gender = 'F'
        $fName = $firstNamesF[$random.Next(0, $firstNamesF.Length)]
    }
    
    $lName = $lastNames[$random.Next(0, $lastNames.Length)]
    $name = "$fName $lName"

    $age = $random.Next(18, 66)
    $height = $random.Next(150, 201)
    $heightM = $height / 100.0
    
    # Target specific BMI distributions for varied chart visuals
    # 25% Underweight, 35% Healthy, 40% Overweight
    $randCategory = $random.NextDouble()
    
    if ($randCategory -lt 0.25) {
        # Underweight (BMI: 15.0 - 18.4)
        $targetBMI = $random.NextDouble() * (18.4 - 15.0) + 15.0
    } elseif ($randCategory -lt 0.60) {
        # Healthy (BMI: 18.5 - 24.9)
        $targetBMI = $random.NextDouble() * (24.9 - 18.5) + 18.5
    } else {
        # Overweight (BMI: 25.0 - 35.0)
        $targetBMI = $random.NextDouble() * (35.0 - 25.0) + 25.0
    }
    
    $weight = [math]::Round(($targetBMI * $heightM * $heightM), 1)
    
    # Body fat correlation to BMI loosely
    if ($gender -eq 'M') {
        $bodyFatBase = $targetBMI - 5
    } else {
        $bodyFatBase = $targetBMI + 5
    }
    # Add slight random variance
    $bodyFat = [math]::Round(($bodyFatBase + ($random.NextDouble() * 10 - 5)), 1)
    if ($bodyFat -lt 5) { $bodyFat = 5.0 }
    
    $goal = $goals[$random.Next(0, $goals.Length)]
    
    "$name,$age,$gender,$weight,$height,$bodyFat,$goal" | Out-File -FilePath $csvPath -Append -Encoding ascii
}

# Injecting Dirty Data to demonstrate the Data Cleaning Mechanism
Write-Host "Injecting dirty data..."

# 1. Missing Goals (Will trigger 'Auto-filled Goals')
for ($i = 0; $i -lt 25; $i++) {
    $fName = $firstNamesM[$random.Next(0, $firstNamesM.Length)]
    $lName = $lastNames[$random.Next(0, $lastNames.Length)]
    $name = "$fName $lName MissingGoal"
    $age = $random.Next(20, 40)
    $gender = "M"
    $height = 180
    $weight = 80.0
    $bodyFat = 15.0
    $goal = "" # Missing goal
    "$name,$age,$gender,$weight,$height,$bodyFat,$goal" | Out-File -FilePath $csvPath -Append -Encoding ascii
}

# 2. Outliers (Will trigger 'Outliers Corrected')
# Outlier Age (< 18 or > 100)
"$fName $lName OutlierAge1,10,M,60.0,160,15.0,Maintenance" | Out-File -FilePath $csvPath -Append -Encoding ascii
"$fName $lName OutlierAge2,150,F,60.0,160,15.0,Maintenance" | Out-File -FilePath $csvPath -Append -Encoding ascii

# Outlier Weight (< 30 or > 300)
"$fName $lName OutlierWeight1,30,M,20.0,180,15.0,Maintenance" | Out-File -FilePath $csvPath -Append -Encoding ascii
"$fName $lName OutlierWeight2,30,M,400.0,180,15.0,Maintenance" | Out-File -FilePath $csvPath -Append -Encoding ascii

# 3. Duplicates (Will trigger 'Duplicates Removed')
# Appending the exact same row multiple times
$dupRow = "Duplicate Dan,35,M,85.5,175,18.0,Muscle Gain"
for ($i = 0; $i -lt 15; $i++) {
    $dupRow | Out-File -FilePath $csvPath -Append -Encoding ascii
}

Write-Host "Generated medium_data.csv with $totalRows random rows + dirty data records."
