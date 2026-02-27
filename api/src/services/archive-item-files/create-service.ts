import { statSync } from "fs"

import { Attributes } from "@sequelize/core"
import { isNil } from "lodash"

import { BlobStorageIntegration } from "@/integrations"

import { ArchiveItemFile } from "@/models"
import BaseService from "@/services/base-service"

export type ArchiveItemFileCreationAttributes = Partial<Attributes<ArchiveItemFile>>

export class CreateService extends BaseService {
  constructor(
    private filePath: string,
    private fileName: string,
    private attributes: ArchiveItemFileCreationAttributes
  ) {
    super()
  }

  async perform(): Promise<ArchiveItemFile> {
    const { archiveItemId, ...optionalAttributes } = this.attributes

    if (isNil(archiveItemId)) {
      throw new Error("Archive item ID is required")
    }

    const originalKey = await this.uploadFileToAzureBlobStorage(this.filePath)
    const mimeType = await this.determineMimeType(this.filePath)
    const fileSize = this.determineFileSize(this.filePath)

    const archiveItemFile = await ArchiveItemFile.create({
      ...optionalAttributes,
      archiveItemId,
      originalFileName: this.fileName,
      originalFileSize: fileSize,
      originalMimeType: mimeType,
      originalKey,
    })
    return archiveItemFile
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
