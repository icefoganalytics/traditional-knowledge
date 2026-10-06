import { isNil } from "lodash"

import logger from "@/utils/logger"

import { BlobStorageIntegration } from "@/integrations"

import { KnowledgeItemFile, User } from "@/models"
import BaseService from "@/services/base-service"

/**
 * Destroy service for KnowledgeItemFile records.
 *
 * NOTE: File cleanup operations (blob storage deletion) are non-reversible regardless
 * of transaction effects. Once files are deleted from blob storage, they cannot be
 * recovered even if the database transaction rolls back.
 */
export class DestroyService extends BaseService {
  constructor(
    private knowledgeItemFile: KnowledgeItemFile,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    const { originalKey, pdfKey } = this.knowledgeItemFile

    if (!isNil(originalKey)) {
      await this.deleteOriginalFile(originalKey)
    }

    if (!isNil(pdfKey)) {
      await this.deletePdfFile(pdfKey)
    }

    await this.knowledgeItemFile.destroy()
  }

  private async deleteOriginalFile(originalKey: string): Promise<void> {
    try {
      await BlobStorageIntegration.deleteFile(originalKey)
    } catch (error) {
      logger.warn(`Failed to delete original file from blob storage: ${originalKey}: ${error}`, {
        error,
      })
    }
  }

  private async deletePdfFile(pdfKey: string): Promise<void> {
    try {
      await BlobStorageIntegration.deleteFile(pdfKey)
    } catch (error) {
      logger.warn(`Failed to delete PDF file from blob storage: ${pdfKey}: ${error}`, { error })
    }
  }
}

export default DestroyService
