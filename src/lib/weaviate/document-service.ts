import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import * as mammoth from 'mammoth'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { ProcessedDocument } from '@/types/knowledge-graph.types'
import { TextItem } from 'pdfjs-dist/types/src/display/api'
import { knowledgeGraphService } from './knowledge-graph-service'

// Configure PDF.js worker
GlobalWorkerOptions.workerSrc =
  '//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'

export class DocumentProcessorService {
  private textSplitter: RecursiveCharacterTextSplitter

  constructor() {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
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
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await getDocument({ data: arrayBuffer }).promise
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items
        .filter((item): item is TextItem => 'str' in item)
        .map((item) => item.str)
        .join(' ')
      fullText += pageText + '\n'
    }

    return fullText
  }

  private async readWordFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  }

  private async readFileContent(file: File): Promise<string> {
    const fileType = file.type
    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    if (fileType === 'application/pdf' || fileExtension === 'pdf') {
      return this.readPdfFile(file)
    } else if (
      fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileExtension === 'docx' ||
      fileType === 'application/msword' ||
      fileExtension === 'doc'
    ) {
      return this.readWordFile(file)
    } else {
      // Default to text file reading
      return this.readTextFile(file)
    }
  }

  async processDocument(
    file: File,
    metadata: { name: string; tags?: string[] },
  ): Promise<ProcessedDocument[]> {
    const content = await this.readFileContent(file)
    const chunks = await this.textSplitter.createDocuments(
      [content],
      [metadata],
    )

    return chunks.map((chunk, index) => ({
      id: `${metadata.name}-${index}`,
      content: chunk.pageContent,
      metadata: {
        name: metadata.name,
        file: file.name,
        tags: metadata.tags,
        chunkIndex: index,
        totalChunks: chunks.length,
      },
    }))
  }

  async storeDocumentChunks(
    userId: string,
    chunks: ProcessedDocument[],
  ): Promise<void> {
    // Store chunks in Weaviate
    for (const chunk of chunks) {
      await knowledgeGraphService.createDocumentChunk({
        userId,
        content: chunk.content,
        chunkIndex: chunk.metadata.chunkIndex,
        metadata: chunk.metadata,
        contextPackId: chunk.metadata.name,
      })
    }
  }

  async searchRelevantChunks(
    query: string,
    userId: string,
    limit: number = 5,
  ): Promise<ProcessedDocument[]> {
    return knowledgeGraphService.searchDocumentChunks(query, userId, limit)
  }
}

export const documentProcessorService = new DocumentProcessorService()
