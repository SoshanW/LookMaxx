import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import json

#Sample Date for Testing
calculated_ratios = {
  "face_ratio": 1.5,
  "upper_ratio": 0.35,
  "middle_ratio": 0.15,
  "lower_ratio": 0.9,
  "left_eye_ratio": 0.3,
  "interpupillary_ratio": 0.7
}

#Sample Perfect data for Testing
perfect_ratios = {
  "face_ratio": 1.6,
  "upper_ratio": 0.25,
  "middle_ratio": 0.25,
  "lower_ratio": 0.5,
  "left_eye_ratio": 0.25,
  "interpupillary_ratio": 0.5
}

#Converting the dictionaries to dataframes
df = pd.DataFrame({
  "Metric": list(calculated_ratios.keys()),
  "Calculated": list(calculated_ratios.values()),
  "Perfect": list(perfect_ratios.values())
})

#Calculate the difference and percentage difference
df["Difference"] = df["Calculated"] - df["Perfect"]
df["Percentage Difference"] = (df["Difference"] / df["Perfect"]) * 100

print(df)


#Graphical Representation Start
plt.figure(figsize=(15, 15))
x= np.arange(len(df["Metric"])) #label location
width = 0.35

fig, ax =  plt.subplots()
bars1 = ax.bar(x - width/2, df["Calculated"], width, label="Calculated")
bars2 = ax.bar(x + width/2, df["Perfect"], width, label="Perfect")

#texts for labels
ax.set_ylabel("Ratios")
ax.set_title("Comparison Report")
ax.set_xticks(x)
ax.set_xticklabels(df["Metric"])
ax.legend()

#Adding the value in top of the bar
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
plt.show()

#Saving to Json file
comparison_report = df.to.dict(orient="records")
with open("comparison_report.json", "w") as f:
  json.dump(comparison_report, f, indent=4)

print("Comparison report saved to 'comparison_report.json'")