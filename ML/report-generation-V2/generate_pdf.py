from fpdf import FPDF

def generate_pdf(prop_results, larger_results, output_file):
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

    pdf.output(output_file)