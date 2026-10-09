import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up pdfjs worker using CDN for reliable browser loading without bundler worker-loader complexity
if (typeof window !== 'undefined' && pdfjsLib) {
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

export async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // 1. Plain text or markdown
  if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
    const text = await file.text();
    if (!text.trim()) {
      throw new Error('The uploaded text file is empty. Please choose a valid resume.');
    }
    return text.trim();
  }

  // 2. DOCX file
  if (fileName.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value.trim();
      if (!text) {
        throw new Error('Could not extract readable text from this DOCX file. It may be empty or contain only images.');
      }
      return text;
    } catch (err: any) {
      console.error('Error parsing DOCX:', err);
      throw new Error(err.message || 'Failed to extract text from DOCX file. Please upload a PDF or plain text resume.');
    }
  }

  // 3. PDF file
  if (fileName.endsWith('.pdf') || file.type === 'application/pdf') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const typedArray = new Uint8Array(arrayBuffer);
      const loadingTask = pdfjsLib.getDocument({ data: typedArray });
      const pdf = await loadingTask.promise;

      let extractedFullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        extractedFullText += pageText + '\n\n';
      }

      const cleanedText = extractedFullText.trim();
      if (!cleanedText || cleanedText.length < 20) {
        throw new Error('This PDF appears to be a scanned image or empty. Please use a text-based PDF or DOCX file.');
      }
      return cleanedText;
    } catch (err: any) {
      console.error('Error parsing PDF:', err);
      if (err.message && err.message.includes('scanned image')) {
        throw err;
      }
      throw new Error('Could not extract text from this PDF file. Please ensure it is not password protected, or upload as DOCX/text.');
    }
  }

  throw new Error('Unsupported file format. Please upload a PDF (.pdf) or Word document (.docx).');
}
