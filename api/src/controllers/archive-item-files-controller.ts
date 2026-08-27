import { isEmpty, isNil } from "lodash"

import logger from "@/utils/logger"
import { ArchiveItem, ArchiveItemAudit, ArchiveItemFile } from "@/models"
import { ArchiveItemsPolicy } from "@/policies"
import { ArchiveItemFiles, FileStorageService } from "@/services"
import BaseController from "@/controllers/base-controller"

export class ArchiveItemFilesController extends BaseController<ArchiveItem> {
  async create() {
    try {
      const archiveItem = await this.loadArchiveItem()
      if (isNil(archiveItem)) {
        return this.response.status(404).json({
          message: "Archive item not found",
        })
      }

      const policy = this.buildPolicy(archiveItem)
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

      const archiveItemFiles: ArchiveItemFile[] = []
      for (const file of files) {
        const archiveItemFile = await ArchiveItemFiles.CreateService.perform(file.path, file.name, {
          archiveItemId: archiveItem.id,
        })
        archiveItemFiles.push(archiveItemFile)

        await ArchiveItemAudit.create({
          archiveItemId: archiveItem.id,
          archiveItemFileId: archiveItemFile.id,
          action: `Uploaded ${archiveItemFile.originalFileName}`,
          userId: this.currentUser.id,
        })
      }

      return this.response.status(201).json({
        archiveItemFiles,
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
      const archiveItem = await this.loadArchiveItem()
      if (isNil(archiveItem)) {
        return this.response.status(404).json({
          message: "Archive item not found",
        })
      }

      const policy = this.buildPolicy(archiveItem)
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
      const selectedFile = archiveItem.files?.find((f) => f.id == parseInt(fileId))

      if (selectedFile) {
        const fileService = new FileStorageService()
        const { format } = this.request.query

        await ArchiveItemAudit.create({
          archiveItemId: archiveItem.id,
          archiveItemFileId: selectedFile.id,
          action: `Viewed ${selectedFile.originalFileName}`,
          userId: this.currentUser.id,
        })

        if (format === "protected" && !isNil(selectedFile.pdfKey)) {
          const fileResponse = await fileService.downloadFile(selectedFile.pdfKey)
          this.response.setHeader(
            "Content-Disposition",
            `attachment;filename="${selectedFile.pdfFileName}"`
          )
          this.response.setHeader("Content-Type", selectedFile.pdfMimeType ?? "application/pdf")
          return this.response.send(fileResponse)
        } else {
          const fileResponse = await fileService.downloadFile(selectedFile.originalKey)
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

  private async loadArchiveItem() {
    const item = await ArchiveItem.findByPk(this.params.archiveItemId, {
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

  private buildPolicy(archiveItem: ArchiveItem = ArchiveItem.build()) {
    return new ArchiveItemsPolicy(this.currentUser, archiveItem)
  }
}

export default ArchiveItemFilesController
