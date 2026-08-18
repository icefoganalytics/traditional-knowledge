import { isNil } from "lodash"

import logger from "@/utils/logger"
import { Attachment } from "@/models"
import { AttachmentTargetTypes } from "@/models/attachment"
import { AttachmentPolicy } from "@/policies"
import { DestroyService } from "@/services/attachments"
import BaseController from "@/controllers/base-controller"

export class AttachmentsController extends BaseController<Attachment> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopedAttachments = AttachmentPolicy.applyScope([], this.currentUser)

      const totalCount = await scopedAttachments.count({ where })
      const attachments = await scopedAttachments.findAll({
        where,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
        order: [["createdAt", "DESC"]],
      })

      return this.response.json({ attachments, totalCount })
    } catch (error) {
      logger.error(`Error fetching attachments: ${error}`, { error })
      return this.response.status(400).json({
        message: `Error fetching attachments: ${error}`,
      })
    }
  }

  async show() {
    try {
      const attachment = await this.loadAttachment()
      if (isNil(attachment)) {
        return this.response.status(404).json({ message: "Attachment not found" })
      }

      const policy = this.buildPolicy(attachment)
      if (!policy.show()) {
        return this.response.status(403).json({
          message: "You are not authorized to view this attachment",
        })
      }

      return this.response.json({ attachment, policy })
    } catch (error) {
      logger.error(`Error fetching attachment: ${error}`, { error })
      return this.response.status(400).json({
        message: `Error fetching attachment: ${error}`,
      })
    }
  }

  async destroy() {
    try {
      const attachment = await this.loadAttachment()
      if (isNil(attachment)) {
        return this.response.status(404).json({ message: "Attachment not found" })
      }

      const policy = this.buildPolicy(attachment)
      if (!policy.destroy()) {
        return this.response.status(403).json({
          message: "You are not authorized to delete this attachment",
        })
      }

      await DestroyService.perform(attachment, this.currentUser)
      return this.response.status(204).send()
    } catch (error) {
      logger.error(`Error deleting attachment: ${error}`, { error })
      return this.response.status(422).json({
        message: `Error deleting attachment: ${error}`,
      })
    }
  }

  private async loadAttachment(): Promise<Attachment | null> {
    return Attachment.findOne({
      where: {
        id: this.params.attachmentId,
        targetType: AttachmentTargetTypes.InformationSharingAgreement,
      },
      include: ["informationSharingAgreement"],
    })
  }

  private buildPolicy(attachment: Attachment = Attachment.build()) {
    return new AttachmentPolicy(this.currentUser, attachment)
  }
}

export default AttachmentsController
