import { isNil } from "lodash"
import { writeFileSync } from "fs"

import { FileStorageService } from "@/services"
import { KnowledgeItemFile } from "@/models"
import cache from "@/db/cache-client"

import { bufferToPdf } from "@/utils/buffer-to-pdf"
import { signPDFWithPAdES } from "@/utils/pdf-signer"
import logger from "@/utils/logger"

export class PDFConverterJob {
  name = "pdf-converter"
  schedule = "*/1 * * * *"

  constructor() {}

  async run(statDate: Date) {
    const toConvert = await cache.getKeysByPattern(`CONVERT_`)
    const fileStore = new FileStorageService()

    for (const key of toConvert) {
      logger.info(`Processing PDF conversion for key: ${key} on ${statDate}`)
      const data = await cache.getValue(key)

      if (isNil(data)) return

      const fileInfo = JSON.parse(data)
      const file = await fileStore.downloadFile(fileInfo.originalKey)
      const fileRecord = await KnowledgeItemFile.findBySlugOrPk(fileInfo.id)
      if (!fileRecord) return

      const folderKey = fileInfo.originalKey.substring(0, fileInfo.originalKey.indexOf("/"))
      const convertedPdfKey = `${folderKey}/${fileStore.makeKey()}`

      const fileAsPDF = await bufferToPdf(file)

      const pdfPath = "/tmp/input.pdf"
      const convertedAndSignedFile = "/tmp/output.pdf"

      writeFileSync(pdfPath, fileAsPDF)

      await signPDFWithPAdES(pdfPath, convertedAndSignedFile)

      const uploadResp = await fileStore.uploadFile(convertedPdfKey, convertedAndSignedFile)

      if (uploadResp.errorCode) {
        throw Error("File upload error")
      }

      await fileRecord.update({
        pdfKey: convertedPdfKey,
        pdfFileName: `${fileRecord.originalFileName}_SIGNED.pdf`,
        pdfMimeType: "application/pdf",
        pdfFileSize: convertedAndSignedFile.length,
      })

      cache.deleteValue(key)
    }
  }
}
