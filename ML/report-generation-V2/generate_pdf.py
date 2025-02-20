from fpdf import FPDF
import os

def generate_pdf(text, output_file):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.set_font("Arial", size=12)

    pdf.multi_cell(0, 10, text)

    pdf.output(output_file)

if __name__ == "__main__":

    final_output = (
        "this is the final output of the RAG system.\n\n"
        "It contains the information extracted and processed from the documents,"
        "formatted as a coherent report. You can customize the text and formatting as needed."
    )

    output_dir = "pdf"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "final_output.pdf")

    generate_pdf(final_output, output_path)
    print(f"PDF generated and stored at {output_path}")