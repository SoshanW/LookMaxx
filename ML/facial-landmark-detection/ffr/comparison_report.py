import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import json
import matplotlib
matplotlib.use('Agg')
import os  # Import os to handle directory creation
import boto3
import os
from botocore.exceptions import ClientError
from werkzeug.utils import secure_filename
from .config import AWS

def upload_to_s3(local_file, s3_file, aws_config):
    """
    Upload a file to an S3 bucket
    
    :param local_file: File to upload
    :param s3_file: S3 object name
    :param aws_config: AWS configuration
    :return: True if file was uploaded, else False
    """
    s3_client = boto3.client(
        's3',
        aws_access_key_id=aws_config.AWS_ACCESS_KEY,
        aws_secret_access_key=aws_config.AWS_SECRET_ACCESS_KEY,
        region_name=aws_config.AWS_REGION
    )

    try:
        s3_client.upload_file(local_file, aws_config.S3_BUCKET, s3_file)
        print(f"Upload Successful: {s3_file}")
        return True
    except FileNotFoundError:
        print(f"The file {local_file} was not found")
        return False
        return False
    except Exception as e:
        print(f"Error uploading to S3: {str(e)}")
        return False

# Load calculated ratios from JSON file
def generate_comparison_report(facial_metrics, username, gender):
    # Load calculated ratios from JSON file
    calculated_ratios = facial_metrics

    # Define perfect ratios for males and females
    perfect_ratios_male = {
        "face_ratio": 0.8,
        "upper_ratio": 0.31,
        "middle_ratio": 0.30,
        "lower_ratio": 0.38,
        "left_eye_ratio": 0.34,
        "interpupillary_ratio": 0.36,
        "nasal_ratio": 0.62,
        "lip_ratio": 0.75
    }

    perfect_ratios_female = {
        "face_ratio": 0.7,
        "upper_ratio": 0.29,
        "middle_ratio": 0.32,
        "lower_ratio": 0.39,
        "left_eye_ratio": 0.33,
        "interpupillary_ratio": 0.35,
        "nasal_ratio": 0.60,
        "lip_ratio": 0.78
    }

    # Select the appropriate perfect ratios based on gender
    if gender.lower() == "male":
        perfect_ratios = perfect_ratios_male
    else:
        perfect_ratios = perfect_ratios_female

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
    fig, ax = plt.subplots(figsize=(12, 5))  # Set figure size here
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
    viz_path = os.path.join(comparison_graph_dir, 'comparison_report.png')
    plt.savefig(viz_path)
    plt.close()

    # Saving to JSON file
    comparison_report = df.to_dict(orient="records")  # Corrected from to.dict
    with open("./reports/comparison_report.json", "w") as f:
        json.dump(comparison_report, f, indent=4)

    # Upload to S3
    aws_config = AWS()
    s3_file_path = f"{aws_config.S3_FFR_PICTURES_GENERATED}{username}_comparison_report.png"
    
    # Upload the graph to S3
    upload_success = upload_to_s3(viz_path, s3_file_path, aws_config)
    
    if upload_success:
        s3_url = f"https://{aws_config.S3_BUCKET}.s3.{aws_config.AWS_REGION}.amazonaws.com/{s3_file_path}"
        print(f"Graph uploaded to S3: {s3_url}")
    else:
        s3_url = None
        print("Failed to upload graph to S3")

    print("Comparison report saved to 'comparison_report.json'")
    print("Graph saved to 'assets/comparison_graph/comparison_report.png'")

    return{
        'comparison_data': comparison_report,
        'visualization_path': viz_path,
        's3_visualization_path': s3_url
    }