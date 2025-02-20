from fpdf import FPDF
import os

def generate_pdf(text, output_file):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font("Arial", size=12)

    pdf.multi_cell(0, 10, text)

    pdf.output(output_file)   