import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import json
import os  # Import os to handle directory creation

# Load calculated ratios from JSON file
with open("./reports/facial_metrics.json", "r") as f:
    calculated_ratios = json.load(f)

# Sample Perfect data for Testing
perfect_ratios = {
    "face_ratio": 1.6,
    "upper_ratio": 0.25,
    "middle_ratio": 0.25,
    "lower_ratio": 0.5,
    "left_eye_ratio": 0.25,
    "interpupillary_ratio": 0.5,
    "nasal_ratio": 0.25
}

# Converting the dictionaries to dataframes
df = pd.DataFrame({
    "Metric": list(calculated_ratios.keys()),
    "Calculated": list(calculated_ratios.values()),
    "Perfect": list(perfect_ratios.values())
})

# Calculate the difference and percentage difference
df["Difference"] = df["Calculated"] - df["Perfect"]
df["Percentage Difference"] = (df["Difference"] / df["Perfect"]) * 100

print(df)

# Create the comparison_graph directory if it doesn't exist
comparison_graph_dir = os.path.join('assets', 'comparison_graph')
if not os.path.exists(comparison_graph_dir):
    os.makedirs(comparison_graph_dir)

# Graphical Representation Start
fig, ax = plt.subplots(figsize=(10, 5))  # Set figure size here
x = np.arange(len(df["Metric"]))  # label location
width = 0.35

bars1 = ax.bar(x - width/2, df["Calculated"], width, label="Calculated")
bars2 = ax.bar(x + width/2, df["Perfect"], width, label="Perfect")

# texts for labels
ax.set_ylabel("Ratios")
ax.set_title("Comparison Report")
ax.set_xticks(x)
ax.set_xticklabels(df["Metric"])
ax.legend()

# Adding the value on top of the bar
def add_value_labels(bars):
    for bar in bars:
        height = bar.get_height()
        ax.annotate('{}'.format(height),
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha='center', va='bottom')

add_value_labels(bars1)
add_value_labels(bars2)

plt.tight_layout()

# Save the figure to the comparison_graph directory
plt.savefig(os.path.join(comparison_graph_dir, 'comparison_report.png'))  # Save as PNG
plt.show()

# Saving to JSON file
comparison_report = df.to_dict(orient="records")  # Corrected from to.dict
with open("./reports/comparison_report.json", "w") as f:
    json.dump(comparison_report, f, indent=4)

print("Comparison report saved to 'comparison_report.json'")
print("Graph saved to 'assets/comparison_graph/comparison_report.png'")