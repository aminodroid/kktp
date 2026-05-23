import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Configure local worker using Vite's asset URL resolution referencing node_modules directly as requested
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

/**
 * Extracts raw text content from a PDF File using local pdfjs-dist.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  
  try {
    const pdf = await loadingTask.promise;
    let fullText = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || "")
        .join(" ");
      fullText += pageText + "\n";
    }
    
    return fullText.trim();
  } catch (error: any) {
    console.error("Error parsing PDF via local worker:", error);
    throw new Error("Gagal membaca dokumen PDF menggunakan worker lokal: " + error.message);
  }
}

/**
 * Extracts raw text content from a DOCX (Word) File using mammoth.
 */
export async function extractTextFromWord(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || "";
  } catch (error: any) {
    console.error("Error parsing DOCX via mammoth:", error);
    throw new Error("Gagal membaca dokumen Word (.docx): " + error.message);
  }
}
