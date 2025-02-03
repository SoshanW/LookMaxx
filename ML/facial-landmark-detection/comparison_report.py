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