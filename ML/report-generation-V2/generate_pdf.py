from fpdf import FPDF
import boto3
from urllib.parse import urlparse
from config2 import AWS
import tempfile
import os

def download_s3_image(s3_url):
    """Download image from S3 URL and return as a temp file path"""
    # Parse S3 URL
    parsed = urlparse(s3_url)
    bucket = parsed.netloc
    key = parsed.path.lstrip('/')
    
    # Use AWS credentials directly from config2
    s3_client = boto3.client(
        's3',
        aws_access_key_id=AWS.AWS_ACCESS_KEY,
        aws_secret_access_key=AWS.AWS_SECRET_ACCESS_KEY,
        region_name=AWS.AWS_REGION
    )
    
    # Create temp file to store the image
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
    
    try:
        s3_client.download_file(bucket, key, temp_file.name)
        return temp_file.name
    except Exception as e:
        print(f"Error downloading from S3: {e}")
        temp_file.close()
        os.unlink(temp_file.name)
        return None

def generate_pdf(prop_results, larger_results, output_file, images=[]):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)

    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0, 10, "Larger Context Results", ln=True)
    pdf.ln(5)

    pdf.set_font("Arial", size=12)
    for results in larger_results:
        chunk = results.metadata.get('chunk_id', 'N/A')
        content = results.page_content.encode("latin-1", "ignore").decode("latin-1")
        pdf.multi_cell(0, 10, f"Chunk {chunk}: {content}")
        pdf.ln(2)

    pdf.add_page()
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(0, 10, "Proposition Results", ln=True)
    pdf.ln(5)

    pdf.set_font("Arial", size=12)
    for results in prop_results:
        chunk = results.metadata.get('chunk_id', 'N/A')
        content = results.page_content.encode("latin-1", "ignore").decode("latin-1")
        pdf.multi_cell(0, 10, f"Chunk {chunk}: {content}")
        pdf.ln(2)

    if images and len(images) > 0:
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(0, 10, "Images", ln=True)
        pdf.ln(5)

        num_columns = 2
        effective_width = pdf.w - 2 * pdf.l_margin
        cell_width = effective_width / num_columns
        image_width = cell_width
        image_height = 60
        description_height = 10
        block_height = image_height + description_height + 5

        start_x = pdf.l_margin
        start_y = pdf.get_y()

        for idx, (img_path, description) in enumerate(images):
            col = idx % num_columns
            row = idx // num_columns
            x = start_x + col * cell_width
            y = start_y + row * block_height

            pdf.image(img_path, x=x + 5, y=y, w=image_width, h=image_height)

            pdf.set_xy(x, y + image_height + 2)
            pdf.set_font("Arial", size=10)
            pdf.multi_cell(cell_width, 5, description, border=0, align='C')

    pdf.output(output_file)