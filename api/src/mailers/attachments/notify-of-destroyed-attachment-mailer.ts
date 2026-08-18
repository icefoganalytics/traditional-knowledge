import { isNil } from "lodash"

import { APPLICATION_NAME } from "@/config"

import { InformationSharingAgreement, User } from "@/models"
import { AttachmentTargetTypes } from "@/models/attachment"
import ApplicationMailer from "@/mailers/application-mailer"
import { type DestroyedAttachmentDetails } from "@/services/notifications/attachments"

export class NotifyOfDestroyedAttachmentMailer extends ApplicationMailer {
  constructor(
    private attachment: DestroyedAttachmentDetails,
    private currentUser: User
  ) {
    super(__filename)
  }

  async perform() {
    if (this.attachment.targetType !== AttachmentTargetTypes.InformationSharingAgreement) {
      return
    }

    const informationSharingAgreement = await InformationSharingAgreement.findByPk(
      this.attachment.targetId,
      {
        include: ["creator", "externalGroupContact", "internalGroupContact"],
      }
    )
    if (isNil(informationSharingAgreement)) return

    const recipients = [
      informationSharingAgreement.creator,
      informationSharingAgreement.externalGroupContact,
      informationSharingAgreement.internalGroupContact,
    ].filter((recipient): recipient is User => {
      if (isNil(recipient)) return false

      return recipient.id !== this.currentUser.id
    })

    const to = this.buildTo(recipients)
    const identifier = `#ISA-${informationSharingAgreement.id}`
    const subject = `${APPLICATION_NAME}: An attachment was removed from agreement ${identifier}`

    const data = {
      identifier,
      title: informationSharingAgreement.title,
      attachmentName: this.attachment.name,
      removedBy: this.currentUser.displayName,
      informationSharingAgreementId: informationSharingAgreement.id,
    }

    return this.mail({ to, subject }, data)
  }
}

export default NotifyOfDestroyedAttachmentMailer
