from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import uuid
from pathlib import Path
import io
from typing import List

router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


def extract_pdf_text(content: bytes, filename: str) -> str:
    """
    Extract text from PDF using multiple methods for best results.
    Tries pdfplumber first (best for most PDFs), then PyMuPDF, then PyPDF2.
    """
    extracted_text = ""
    extraction_method = ""
    
    # Method 1: Try pdfplumber (best for tables and complex layouts)
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            text_parts = []
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(f"--- Page {i+1} ---\n{page_text}")
                
                # Also extract tables if present
                tables = page.extract_tables()
                for table in tables:
                    if table:
                        table_text = "\n".join([" | ".join([str(cell) if cell else "" for cell in row]) for row in table])
                        text_parts.append(f"\n[Table]\n{table_text}\n")
            
            extracted_text = "\n\n".join(text_parts)
            extraction_method = "pdfplumber"
    except ImportError:
        pass
    except Exception as e:
        print(f"pdfplumber failed: {e}")
    
    # Method 2: Try PyMuPDF (fitz) if pdfplumber didn't get text
    if not extracted_text.strip():
        try:
            import fitz  # PyMuPDF
            doc = fitz.open(stream=content, filetype="pdf")
            text_parts = []
            for i, page in enumerate(doc):
                page_text = page.get_text()
                if page_text:
                    text_parts.append(f"--- Page {i+1} ---\n{page_text}")
            doc.close()
            extracted_text = "\n\n".join(text_parts)
            extraction_method = "PyMuPDF"
        except ImportError:
            pass
        except Exception as e:
            print(f"PyMuPDF failed: {e}")
    
    # Method 3: Fall back to PyPDF2
    if not extracted_text.strip():
        try:
            import PyPDF2
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
            text_parts = []
            for i, page in enumerate(pdf_reader.pages):
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(f"--- Page {i+1} ---\n{page_text}")
            extracted_text = "\n\n".join(text_parts)
            extraction_method = "PyPDF2"
        except Exception as e:
            print(f"PyPDF2 failed: {e}")
    
    # If still no text, the PDF might be image-based (scanned)
    if not extracted_text.strip():
        extracted_text = f"[Note: Could not extract text from '{filename}'. This PDF may be image-based/scanned. Please copy and paste the relevant text manually, or use a PDF with selectable text.]"
        extraction_method = "none"
    else:
        # Add extraction info
        extracted_text = f"[Extracted from: {filename} using {extraction_method}]\n\n{extracted_text}"
    
    return extracted_text


def get_pdf_metadata(content: bytes) -> dict:
    """Extract PDF metadata."""
    metadata = {}
    try:
        import PyPDF2
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        metadata = {
            "pages": len(pdf_reader.pages),
            "info": dict(pdf_reader.metadata) if pdf_reader.metadata else {}
        }
    except Exception:
        pass
    return metadata


@router.post("/files/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    """Upload and process files (PDFs, text files, images)."""
    
    processed_files = []
    
    for file in files:
        try:
            # Generate unique filename
            file_id = str(uuid.uuid4())
            file_extension = Path(file.filename).suffix.lower()
            unique_filename = f"{file_id}{file_extension}"
            file_path = UPLOAD_DIR / unique_filename
            
            # Save file
            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Process file based on type
            processed_content = ""
            file_type = file.content_type or ""
            metadata = {}
            
            # Handle PDFs
            if file_type == "application/pdf" or file_extension == ".pdf":
                processed_content = extract_pdf_text(content, file.filename)
                metadata = get_pdf_metadata(content)
                    
            # Handle text files
            elif file_type.startswith("text/") or file_extension in [".txt", ".md", ".py", ".js", ".jsx", ".ts", ".tsx", ".json", ".csv", ".xml", ".html", ".css"]:
                try:
                    processed_content = content.decode('utf-8')
                except UnicodeDecodeError:
                    try:
                        processed_content = content.decode('latin-1')
                    except:
                        processed_content = content.decode('utf-8', errors='ignore')
                processed_content = f"[File: {file.filename}]\n\n{processed_content}"
                    
            # Handle Word documents
            elif file_extension in [".docx", ".doc"]:
                try:
                    import docx
                    doc = docx.Document(io.BytesIO(content))
                    paragraphs = [para.text for para in doc.paragraphs if para.text.strip()]
                    processed_content = f"[Word Document: {file.filename}]\n\n" + "\n\n".join(paragraphs)
                except ImportError:
                    processed_content = f"[Word Document: {file.filename}] - Install python-docx to extract content"
                except Exception as e:
                    processed_content = f"[Word Document: {file.filename}] - Error: {str(e)}"
                    
            # Handle images
            elif file_type.startswith("image/") or file_extension in [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"]:
                processed_content = f"[Image file: {file.filename}]\nSize: {len(content)} bytes\nType: {file_type}\n\nNote: Image content analysis is not available. Please describe the image content if you'd like assistance with it."
                
            else:
                processed_content = f"[File: {file.filename}]\nType: {file_type}\nSize: {len(content)} bytes\n\nThis file type is not directly supported for text extraction."
            
            # Limit content length for very large files
            max_content_length = 50000  # 50KB of text
            if len(processed_content) > max_content_length:
                processed_content = processed_content[:max_content_length] + f"\n\n[Content truncated - showing first {max_content_length} characters of {len(processed_content)} total]"
            
            processed_files.append({
                "id": file_id,
                "filename": file.filename,
                "size": len(content),
                "type": file_type,
                "content": processed_content,
                "file_path": str(file_path),
                "metadata": metadata
            })
            
        except Exception as e:
            print(f"Error processing file {file.filename}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Error processing file {file.filename}: {str(e)}")
    
    return JSONResponse({
        "success": True,
        "files": processed_files,
        "message": f"Successfully processed {len(processed_files)} file(s)"
    })


@router.delete("/files/{file_id}")
async def delete_file(file_id: str):
    """Delete an uploaded file."""
    
    # Find and delete the file
    for file_path in UPLOAD_DIR.glob(f"{file_id}.*"):
        try:
            file_path.unlink()
            return JSONResponse({
                "success": True,
                "message": f"File {file_id} deleted successfully"
            })
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")
    
    raise HTTPException(status_code=404, detail="File not found")


@router.get("/files/{file_id}")
async def get_file_info(file_id: str):
    """Get information about an uploaded file."""
    
    for file_path in UPLOAD_DIR.glob(f"{file_id}.*"):
        return JSONResponse({
            "id": file_id,
            "exists": True,
            "path": str(file_path),
            "size": file_path.stat().st_size
        })
    
    raise HTTPException(status_code=404, detail="File not found")


@router.get("/files/supported-types")
async def get_supported_types():
    """Get list of supported file types."""
    return JSONResponse({
        "supported_types": [
            {"type": "PDF", "extensions": [".pdf"], "description": "PDF documents with text extraction"},
            {"type": "Text", "extensions": [".txt", ".md"], "description": "Plain text and Markdown files"},
            {"type": "Code", "extensions": [".py", ".js", ".jsx", ".ts", ".tsx", ".json", ".html", ".css"], "description": "Source code files"},
            {"type": "Word", "extensions": [".docx"], "description": "Microsoft Word documents"},
            {"type": "Images", "extensions": [".png", ".jpg", ".jpeg", ".gif"], "description": "Image files (no OCR)"},
        ]
    })
