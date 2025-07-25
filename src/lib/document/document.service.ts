import * as pdfjsLib from 'pdfjs-dist'
import * as mammoth from 'mammoth'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

// Configure PDF.js worker
const initializePdfWorker = () => {
  if (typeof window === 'undefined') return

  try {
    const workerSrc = '/pdf.worker.min.js'

    // Set the worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc
  } catch (error) {
    console.error('Failed to initialize PDF.js worker:', error)
  }
}

// Initialize the worker when the module loads
if (typeof window !== 'undefined') {
  initializePdfWorker()
}

export class DocumentProcessorService {
  private textSplitter: RecursiveCharacterTextSplitter

  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 50,
    })
  }

  private async readTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        resolve(content)
      }
      reader.onerror = (e) => reject(e)
      reader.readAsText(file)
    })
  }

  private async readPdfFile(file: File): Promise<string> {
    // Verify file is a PDF
    if (
      !file.type.includes('pdf') &&
      !file.name.toLowerCase().endsWith('.pdf')
    ) {
      throw new Error('File is not a PDF. Please upload a valid PDF file.')
    }

    try {
      // Verify PDF.js is properly initialized
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        console.warn(
          'PDF.js worker not properly initialized, trying to initialize now',
        )
        try {
          // Try to reinitialize the worker
          initializePdfWorker()

          if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
            throw new Error('Failed to initialize PDF.js worker')
          }
        } catch (error) {
          console.error('Failed to initialize PDF.js worker:', error)
          throw new Error(
            'PDF processing is currently unavailable. Please try again later or use a different file format.',
          )
        }
      }

      const arrayBuffer = await file.arrayBuffer()
      try {
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer })
        const pdf = await loadingTask.promise

        let fullText = ''
        const pageCount = Math.min(pdf.numPages, 100) // Limit to first 100 pages for safety

        for (let i = 1; i <= pageCount; i++) {
          try {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            // Extract text from PDF page items
            const pageText = textContent.items
              .map((item) => {
                if (
                  typeof item === 'object' &&
                  item !== null &&
                  'str' in item
                ) {
                  const textItem = item as { str: string }
                  return textItem.str
                }
                return ''
              })
              .filter(Boolean)
              .join(' ')
            fullText += pageText + '\n'
          } catch (pageError) {
            console.error(`Error processing page ${i}:`, pageError)
            // Continue with next page even if one page fails
            continue
          }
        }

        if (!fullText.trim()) {
          throw new Error('Extracted text is empty')
        }

        return fullText
      } catch (innerError) {
        console.error('Error in PDF processing:', innerError)
        throw new Error(
          `PDF processing failed: ${
            innerError instanceof Error ? innerError.message : 'Unknown error'
          }`,
        )
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to read PDF file:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        error: errorMessage,
        errorObject: error,
      })
      throw new Error(`Failed to process PDF file: ${errorMessage}`)
    }
  }

  private async readWordFile(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      return result.value
    } catch (error) {
      console.error('Error reading Word file:', error)
      throw new Error('Failed to process Word document')
    }
  }

  private async readFileContent(file: File): Promise<string> {
    try {
      if (file.type === 'application/pdf') {
        return await this.readPdfFile(file)
      } else if (
        file.type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ) {
        return await this.readWordFile(file)
      } else if (file.type === 'text/plain') {
        return await this.readTextFile(file)
      } else {
        throw new Error('Unsupported file type')
      }
    } catch (error) {
      console.error('Error reading file:', error)
      throw new Error(
        `Failed to read file: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      )
    }
  }

  async processDocument(
    file: File,
  ): Promise<string[]> {
    const content = await this.readFileContent(file)
    const chunks = await this.textSplitter.createDocuments(
      [content],
    )
    return chunks.map((chunk) => chunk.pageContent)
  }
}

export const documentProcessorService = new DocumentProcessorService()
