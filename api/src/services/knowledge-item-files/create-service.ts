import { statSync } from "fs"

import { Attributes } from "@sequelize/core"
import { isNil } from "lodash"

import { BlobStorageIntegration } from "@/integrations"

import { KnowledgeItemFile } from "@/models"
import BaseService from "@/services/base-service"

export type KnowledgeItemFileCreationAttributes = Partial<Attributes<KnowledgeItemFile>>

export class CreateService extends BaseService {
  constructor(
    private filePath: string,
    private fileName: string,
    private attributes: KnowledgeItemFileCreationAttributes
  ) {
    super()
  }

  async perform(): Promise<KnowledgeItemFile> {
    const { knowledgeItemId, ...optionalAttributes } = this.attributes

    if (isNil(knowledgeItemId)) {
      throw new Error("Knowledge item ID is required")
    }

    const originalKey = await this.uploadFileToAzureBlobStorage(this.filePath)
    const mimeType = await this.determineMimeType(this.filePath)
    const fileSize = this.determineFileSize(this.filePath)

    const knowledgeItemFile = await KnowledgeItemFile.create({
      ...optionalAttributes,
      knowledgeItemId,
      originalFileName: this.fileName,
      originalFileSize: fileSize,
      originalMimeType: mimeType,
      originalKey,
    })
    return knowledgeItemFile
  }

  private async uploadFileToAzureBlobStorage(filePath: string): Promise<string> {
    return BlobStorageIntegration.uploadFile(filePath)
  }

  private determineFileSize(filePath: string): number {
    const stats = statSync(filePath)
    return stats.size
  }

  private async determineMimeType(filePath: string): Promise<string> {
    const { fileTypeFromFile } = await import("file-type")

    const fileTypeResult = await fileTypeFromFile(filePath)
    if (isNil(fileTypeResult)) {
      return "application/octet-stream"
    }

    return fileTypeResult.mime
  }
}

export default CreateService
