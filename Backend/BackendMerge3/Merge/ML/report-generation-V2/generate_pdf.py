from fpdf import FPDF
from PIL import Image  # For reading image sizes to preserve aspect ratio

def generate_pdf(facial_metrics, prop_results, larger_results, output_file, images=[]):
    """
    Layout:
      - Cover page + facial metrics + contextual analysis
      - Page 1 of images: 2x2 grid (#1, #2, #3, #4)
      - Page 2 of images: top row side-by-side (#5, #6), bottom row full width (#7)
    """

    # Helper function: convert pixel to mm assuming 72 dpi
    def px_to_mm(px, dpi=72):
        return px * 25.4 / dpi

    def place_image_in_cell(pdf, img_path, description, x, y, cell_w, cell_h):
        """
        Place an image (and its text) into a cell of width=cell_w, height=cell_h,
        preserving aspect ratio. The image is centered both horizontally and vertically
        within the cell (leaving room at the bottom for the description).
        """
        # A little vertical space for the text
        text_h = 10
        # We'll keep a small margin between the image and the text
        margin_below_image = 3
        
        # Calculate the maximum vertical space for the image
        available_h_for_image = cell_h - text_h - margin_below_image
        
        # Get the native size (in px) of the image
        with Image.open(img_path) as im:
            orig_px_w, orig_px_h = im.size
        
        # Convert px to mm (assuming 72 dpi). 
        # If your images use a different DPI, adjust accordingly.
        mm_w = px_to_mm(orig_px_w)
        mm_h = px_to_mm(orig_px_h)

        # Figure out the scale so the image fits within cell_w × available_h_for_image
        ratio_w = cell_w / mm_w
        ratio_h = available_h_for_image / mm_h
        scale = min(ratio_w, ratio_h)

        # Scaled dimensions
        display_w = mm_w * scale
        display_h = mm_h * scale

        # Center the image horizontally within cell_w
        offset_x = (cell_w - display_w) / 2
        # Center the image vertically within the available area
        offset_y = (available_h_for_image - display_h) / 2

        # Place the image
        pdf.image(img_path, x=x + offset_x, y=y + offset_y, w=display_w, h=display_h)

        # Place description text below the image
        pdf.set_xy(x, y + offset_y + display_h + margin_below_image)
        pdf.set_font("Times", '', 10)
        pdf.multi_cell(cell_w, 5, description, align='C')

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Use Times for a classic, professional look
    pdf.set_font("Times", '', 12)
    
    # --- Cover Page & Facial Metrics Section ---
    pdf.add_page()
    # Cover Title (centered)
    pdf.set_font("Times", 'B', 18)
    pdf.cell(0, 10, "Facial Analysis Report", ln=True, align='C')
    pdf.ln(5)
    
    # Facial Metrics header
    pdf.set_font("Times", 'B', 16)
    pdf.cell(0, 10, "Facial Metrics", ln=True)
    pdf.ln(5)
    
    # Table Header with fill color for better readability
    pdf.set_fill_color(200, 200, 200)
    pdf.set_font("Times", 'B', 12)
    pdf.cell(90, 10, "Metric", border=1, fill=True, align='C')
    pdf.cell(90, 10, "Value", border=1, fill=True, ln=True, align='C')
    
    # Table Body
    pdf.set_font("Times", '', 12)
    for item in facial_metrics:
        pdf.cell(90, 10, str(item['Metric']), border=1, align='C')
        pdf.cell(90, 10, str(item['Value']), border=1, ln=True, align='C')
    pdf.ln(10)
    
    # --- Contextual Analysis Section (combining larger context and proposition results) ---
    if larger_results or prop_results:
        pdf.set_font("Times", 'B', 16)
        pdf.cell(0, 10, "Contextual Analysis", ln=True)
        pdf.ln(5)
        
        # Larger Context Results
        if larger_results:
            pdf.set_font("Times", 'B', 14)
            pdf.cell(0, 10, "Larger Context Results", ln=True)
            pdf.ln(3)
            pdf.set_font("Times", '', 12)
            for result in larger_results:
                chunk = result.metadata.get('chunk_id', 'N/A')
                content = result.page_content.encode("latin-1", "ignore").decode("latin-1")
                pdf.multi_cell(0, 8, f"Chunk {chunk}: {content}")
                pdf.ln(2)
        
        # Proposition Results
        if prop_results:
            pdf.set_font("Times", 'B', 14)
            pdf.cell(0, 10, "Proposition Results", ln=True)
            pdf.ln(3)
            pdf.set_font("Times", '', 12)
            for result in prop_results:
                chunk = result.metadata.get('chunk_id', 'N/A')
                content = result.page_content.encode("latin-1", "ignore").decode("latin-1")
                pdf.multi_cell(0, 8, f"Chunk {chunk}: {content}")
                pdf.ln(2)
    
    # --- Images Section ---
    # Expecting at least 7 images in the list: images[i] = (img_path, description)
    # If fewer, you should add checks or conditionals.
    if len(images) >= 4:
        pdf.add_page()
        pdf.set_font("Times", 'B', 16)
        pdf.cell(0, 10, "Images", ln=True)
        pdf.ln(5)

        # Page 1 layout: 2×2 grid for images #1–#4
        x_left = pdf.l_margin
        y_top = pdf.get_y()
        page_width = pdf.w - 2*pdf.l_margin
        page_height = pdf.h - pdf.b_margin - y_top  # total vertical space left

        # Each cell is half the page width, half the page height
        cell_w = page_width / 2
        cell_h = page_height / 2

        # image #1 (top-left)
        place_image_in_cell(pdf, images[0][0], images[0][1], x_left, y_top, cell_w, cell_h)

        # image #2 (top-right)
        place_image_in_cell(pdf, images[1][0], images[1][1], x_left + cell_w, y_top, cell_w, cell_h)

        # image #3 (bottom-left)
        place_image_in_cell(pdf, images[2][0], images[2][1], x_left, y_top + cell_h, cell_w, cell_h)

        # image #4 (bottom-right)
        place_image_in_cell(pdf, images[3][0], images[3][1], x_left + cell_w, y_top + cell_h, cell_w, cell_h)

    # If there are at least 7 images, go to next page for #5, #6, #7
    if len(images) >= 7:
        pdf.add_page()
        pdf.set_font("Times", '', 10)
        
        x_left = pdf.l_margin
        y_top = pdf.get_y()
        page_width = pdf.w - 2*pdf.l_margin
        page_height = pdf.h - pdf.b_margin - y_top

        # We want #5 and #6 side by side at the top, #7 full width below.
        # Let's define row1 as ~ half the page height, row2 as the rest.
        row1_h = page_height * 0.5
        row2_h = page_height - row1_h

        # Place #5 (top-left)
        cell_w = page_width / 2
        cell_h = row1_h
        place_image_in_cell(pdf, images[4][0], images[4][1], x_left, y_top, cell_w, cell_h)

        # Place #6 (top-right)
        place_image_in_cell(pdf, images[5][0], images[5][1], x_left + cell_w, y_top, cell_w, cell_h)

        # Place #7 (bottom row, full width)
        y_bottom_row = y_top + row1_h
        place_image_in_cell(pdf, images[6][0], images[6][1], x_left, y_bottom_row, page_width, row2_h)

    pdf.output(output_file)