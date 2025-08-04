from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import uuid
from pathlib import Path
import PyPDF2
import io
from typing import List

router = APIRouter()

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/files/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    """Upload and process files (PDFs, text files, images)."""
    
    processed_files = []
    
    for file in files:
        try:
            # Generate unique filename
            file_id = str(uuid.uuid4())
            file_extension = Path(file.filename).suffix
            unique_filename = f"{file_id}{file_extension}"
            file_path = UPLOAD_DIR / unique_filename
            
            # Save file
            content = await file.read()
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Process file based on type
            processed_content = ""
            file_type = file.content_type
            
            if file_type == "application/pdf":
                # Extract text from PDF
                try:
                    pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
                    text_content = []
                    for page in pdf_reader.pages:
                        text_content.append(page.extract_text())
                    processed_content = "\n".join(text_content)
                except Exception as e:
                    processed_content = f"PDF processing failed: {str(e)}"
                    
            elif file_type.startswith("text/") or file_extension in [".txt", ".md", ".py", ".js", ".json"]:
                # Handle text files
                try:
                    processed_content = content.decode('utf-8')
                except UnicodeDecodeError:
                    processed_content = content.decode('latin-1')
                    
            elif file_type.startswith("image/"):
                # For images, we'll just note that it's an image
                # In a real implementation, you might use OCR or image analysis
                processed_content = f"Image file: {file.filename} ({len(content)} bytes)"
                
            else:
                processed_content = f"File type {file_type} - content extraction not supported"
            
            processed_files.append({
                "id": file_id,
                "filename": file.filename,
                "size": len(content),
                "type": file_type,
                "content": processed_content[:5000],  # Limit content length
                "file_path": str(file_path)
            })
            
        except Exception as e:
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
    
    # This would typically query a database
    # For now, we'll return basic info if file exists
    for file_path in UPLOAD_DIR.glob(f"{file_id}.*"):
        return JSONResponse({
            "id": file_id,
            "exists": True,
            "path": str(file_path),
            "size": file_path.stat().st_size
        })
    
    raise HTTPException(status_code=404, detail="File not found")
