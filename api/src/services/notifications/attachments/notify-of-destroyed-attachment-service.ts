import { isNil } from "lodash"

import { InformationSharingAgreement, Notification, User } from "@/models"
import { AttachmentTargetTypes } from "@/models/attachment"

import BaseService from "@/services/base-service"
import { Notifications } from "@/services"

export type DestroyedAttachmentDetails = {
  id: number
  name: string
  targetId: number
  targetType: string
  associationName: string
}

export class NotifyOfDestroyedAttachmentService extends BaseService {
  constructor(
    private attachment: DestroyedAttachmentDetails,
    private currentUser: User
  ) {
    super()
  }

  async perform() {
    const informationSharingAgreement = await this.loadInformationSharingAgreement()
    if (isNil(informationSharingAgreement)) return

    const recipients = await this.buildRecipients(informationSharingAgreement)

    const { id: informationSharingAgreementId } = informationSharingAgreement
    const safeTitle = Notification.sanitizeAttribute(
      "title",
      `Attachment Removed: ${this.attachment.name}`
    )

    for (const recipient of recipients) {
      await Notifications.CreateService.perform(
        {
          title: safeTitle,
          subtitle: `Removed from agreement #ISA-${informationSharingAgreementId} by ${this.currentUser.displayName}.`,
          href: `/information-sharing-agreements/${informationSharingAgreementId}`,
          userId: recipient.id,
          sourceType: Notification.SourceTypes.ATTACHMENT,
          sourceId: this.attachment.id,
          sourceKey: "destroyed",
        },
        this.currentUser
      )
    }
  }

  /** Attachments are polymorphic; only agreements carry them today. */
  private async loadInformationSharingAgreement(): Promise<InformationSharingAgreement | null> {
    if (this.attachment.targetType !== AttachmentTargetTypes.InformationSharingAgreement) {
      return null
    }

    return InformationSharingAgreement.findByPk(this.attachment.targetId, {
      include: ["creator", "externalGroupContact", "internalGroupContact"],
    })
  }

  /** The people named on the agreement, excluding whoever performed the deletion. */
  private async buildRecipients(
    informationSharingAgreement: InformationSharingAgreement
  ): Promise<User[]> {
    const named = [
      informationSharingAgreement.creator,
      informationSharingAgreement.externalGroupContact,
      informationSharingAgreement.internalGroupContact,
    ]

    const recipientsById = new Map<number, User>()
    for (const recipient of named) {
      if (isNil(recipient)) continue
      if (recipient.id === this.currentUser.id) continue

      recipientsById.set(recipient.id, recipient)
    }

    return [...recipientsById.values()]
  }
}

export default NotifyOfDestroyedAttachmentService
