export type KnowledgeItemFile = {
  id: number
  knowledgeItemId: number | null
  bucket: string | null
  originalKey: string | null
  originalFileName: string | null
  originalMimeType: string
  originalFileSize: number
  pdfKey: string | null
  pdfFileName: string | null
  pdfMimeType: string | null
  pdfFileSize: number | null
  comment: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

// API does not currently exist
