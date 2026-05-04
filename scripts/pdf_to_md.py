import fitz  # PyMuPDF
import sys
import os
import re

def clean_text(text):
    # Limpieza de saltos de línea extraños
    text = re.sub(r'\n\s*\n', '\n\n', text)
    # Detectar artículos y ponerlos como encabezados
    text = re.sub(r'(Artículo\s+\d+[:.]?)', r'## \1', text, flags=re.IGNORECASE)
    # Eliminar posibles encabezados de página repetitivos (ej: "Gaceta Oficial...")
    # Esto es opcional, depende de la ley
    return text

def convert_pdf_to_md(pdf_path, output_path):
    try:
        doc = fitz.open(pdf_path)
        total_pages = len(doc)
        print(f"Abriendo PDF: {pdf_path} ({total_pages} páginas)")
        
        md_content = f"# {os.path.basename(pdf_path).replace('.pdf', '')}\n\n"
        
        for page_num in range(total_pages):
            page = doc.load_page(page_num)
            # Extraemos por bloques para mantener mejor el orden
            blocks = page.get_text("blocks")
            page_text = ""
            
            for b in blocks:
                # b[4] es el texto del bloque
                page_text += b[4] + "\n"
            
            cleaned_page = clean_text(page_text)
            md_content += f"\n<!-- INICIO PÁGINA {page_num + 1} -->\n"
            md_content += cleaned_page
            md_content += f"\n<!-- FIN PÁGINA {page_num + 1} -->\n"
            
            if page_num % 10 == 0:
                print(f"Procesadas {page_num}/{total_pages} páginas...")

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(md_content)
            
        print(f"Conversión finalizada con éxito: {output_path}")
        return True
    except Exception as e:
        print(f"ERROR CRÍTICO: {str(e)}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python pdf_to_md.py <input_pdf> <output_md>")
        sys.exit(1)
        
    input_pdf = sys.argv[1]
    output_md = sys.argv[2]
    
    if convert_pdf_to_md(input_pdf, output_md):
        sys.exit(0)
    else:
        sys.exit(1)
