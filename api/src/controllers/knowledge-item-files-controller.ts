import { isEmpty, isNil } from "lodash"

import logger from "@/utils/logger"
import { KnowledgeItem, KnowledgeItemAudit, KnowledgeItemFile } from "@/models"
import { BlobStorageIntegration } from "@/integrations"
import { KnowledgeItemsPolicy } from "@/policies"
import { KnowledgeItemFiles } from "@/services"
import BaseController from "@/controllers/base-controller"

export class KnowledgeItemFilesController extends BaseController<KnowledgeItem> {
  async create() {
    try {
      const knowledgeItem = await this.loadKnowledgeItem()
      if (isNil(knowledgeItem)) {
        return this.response.status(404).json({
          message: "Knowledge item not found",
        })
      }

      const policy = this.buildPolicy(knowledgeItem)
      if (!policy.update()) {
        return this.response.status(403).json({
          message: "You are not authorized to attach files to this item",
        })
      }

      const files = this.request.body.files
      if (isNil(files) || isEmpty(files)) {
        return this.response.status(422).json({
          message: "At least one file is required",
        })
      }

      const knowledgeItemFiles: KnowledgeItemFile[] = []
      for (const file of files) {
        const knowledgeItemFile = await KnowledgeItemFiles.CreateService.perform(
          file.path,
          file.name,
          {
            knowledgeItemId: knowledgeItem.id,
          }
        )
        knowledgeItemFiles.push(knowledgeItemFile)

        await KnowledgeItemAudit.create({
          knowledgeItemId: knowledgeItem.id,
          knowledgeItemFileId: knowledgeItemFile.id,
          action: `Uploaded ${knowledgeItemFile.originalFileName}`,
          userId: this.currentUser.id,
        })
      }

      return this.response.status(201).json({
        knowledgeItemFiles,
      })
    } catch (error) {
      logger.error(`Error attaching file: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error attaching file: ${error}`,
      })
    }
  }

  async show() {
    try {
      const knowledgeItem = await this.loadKnowledgeItem()
      if (isNil(knowledgeItem)) {
        return this.response.status(404).json({
          message: "Knowledge item not found",
        })
      }

      const policy = this.buildPolicy(knowledgeItem)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this item",
        })
      }

      if (isNil(this.params.fileId)) {
        return this.response.status(404).json({
          message: "Selected file not found",
        })
      }

      const fileId = this.params.fileId.toString()
      const selectedFile = knowledgeItem.files?.find((f) => f.id == parseInt(fileId))

      if (selectedFile) {
        const { format } = this.request.query

        await KnowledgeItemAudit.create({
          knowledgeItemId: knowledgeItem.id,
          knowledgeItemFileId: selectedFile.id,
          action: `Viewed ${selectedFile.originalFileName}`,
          userId: this.currentUser.id,
        })

        if (format === "protected" && !isNil(selectedFile.pdfKey)) {
          const fileResponse = await BlobStorageIntegration.downloadFile(selectedFile.pdfKey)
          this.response.setHeader(
            "Content-Disposition",
            `attachment;filename="${selectedFile.pdfFileName}"`
          )
          this.response.setHeader("Content-Type", selectedFile.pdfMimeType ?? "application/pdf")
          return this.response.send(fileResponse)
        } else {
          const fileResponse = await BlobStorageIntegration.downloadFile(selectedFile.originalKey)
          this.response.setHeader(
            "Content-Disposition",
            `attachment;filename="${selectedFile.originalFileName}"`
          )
          this.response.setHeader("Content-Type", selectedFile.originalMimeType)
          return this.response.send(fileResponse)
        }
      }
    } catch (error) {
      logger.error("Error fetching item" + error)
      return this.response.status(400).json({
        message: `Error fetching item: ${error}`,
      })
    }
  }

  private async loadKnowledgeItem() {
    const item = await KnowledgeItem.findByPk(this.params.knowledgeItemId, {
      include: [
        "files",
        {
          association: "accessGrants",
          through: {
            attributes: [],
          },
        },
      ],
    })
    if (isNil(item)) return null

    return item
  }

  private buildPolicy(knowledgeItem: KnowledgeItem = KnowledgeItem.build()) {
    return new KnowledgeItemsPolicy(this.currentUser, knowledgeItem)
  }
}

export default KnowledgeItemFilesController
