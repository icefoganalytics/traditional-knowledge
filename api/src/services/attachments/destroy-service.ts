import logger from "@/utils/logger"
import db, { Attachment, User } from "@/models"
import BaseService from "@/services/base-service"
import { Notifications } from "@/services"
import { Attachments as AttachmentMailers } from "@/mailers"

export class DestroyService extends BaseService {
  constructor(
    private attachment: Attachment,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<void> {
    // Captured before destroy: the notification describes what was removed, and the
    // record is gone by the time it is sent. See TK-6.
    const { id, name, targetId, targetType, associationName } = this.attachment

    await db.transaction(async () => {
      await this.attachment.destroy()
    })

    await this.safeAttemptNotify({ id, name, targetId, targetType, associationName })
  }

  /** A failed notification must not undo a completed deletion. */
  private async safeAttemptNotify(details: {
    id: number
    name: string
    targetId: number
    targetType: string
    associationName: string
  }): Promise<void> {
    try {
      await Notifications.Attachments.NotifyOfDestroyedAttachmentService.perform(
        details,
        this.currentUser
      )
      await AttachmentMailers.NotifyOfDestroyedAttachmentMailer.perform(details, this.currentUser)
    } catch (error) {
      logger.error(`Failed to notify of destroyed attachment ${details.id}: ${error}`, { error })
    }
  }
}

export default DestroyService
