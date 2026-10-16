import csv
import random
import os

names_first = ['John', 'Jane', 'Alex', 'Emily', 'Michael', 'Sarah', 'David', 'Laura', 'Robert', 'Emma', 'William', 'Olivia', 'James', 'Sophia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Charlotte']
names_last = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
goals = ['Fat Loss', 'Muscle Gain', 'Maintenance', 'Endurance']
genders = ['M', 'F']

rows = []
for i in range(1200):
    name = f"{random.choice(names_first)} {random.choice(names_last)} {i}"
    age = random.randint(18, 65)
    gender = random.choice(genders)
    height = random.randint(150, 200)
    # Generate somewhat realistic weight based on height
    base_weight = (height - 100)
    weight = round(random.uniform(base_weight * 0.8, base_weight * 1.5), 1)
    body_fat = round(random.uniform(8, 35), 1)
    goal = random.choice(goals)
    
    rows.append([name, age, gender, weight, height, body_fat, goal])

script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, '..', 'data', 'medium_data.csv')

with open(csv_path, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['Name', 'Age', 'Gender', 'Weight', 'Height', 'BodyFat', 'Goal'])
    writer.writerows(rows)

print(f"Generated medium_data.csv at {csv_path} with 1200 rows.")
