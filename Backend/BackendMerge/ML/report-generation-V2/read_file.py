import json

try:
    with open('report.json', 'r') as file:
        data = json.load(file) 
except FileNotFoundError:
    print("File not found!")
except json.JSONDecodeError:
    print("Error decoding JSON!")

def find_metric(metric_name):
    return next((item for item in data if item["Metric"] == metric_name), None)

face_ratio_data = find_metric("upper_ratio")
if face_ratio_data:
    print(face_ratio_data)  # Output: 0.89