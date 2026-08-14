import { isUndefined } from "lodash"

import db, {
  Attachment,
  InformationSharingAgreement,
  User,
  InformationSharingAgreementArchiveItem,
} from "@/models"
import { AttachmentTargetTypes } from "@/models/attachment"
import BaseService from "@/services/base-service"
import { Attachments, InformationSharingAgreements } from "@/services"

export class RevertToDraftService extends BaseService {
  constructor(
    private informationSharingAgreement: InformationSharingAgreement,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<InformationSharingAgreement> {
    if (!this.informationSharingAgreement.isSigned()) {
      throw new Error("Only signed agreements can be reverted to draft.")
    }

    const { informationSharingAgreementArchiveItems } = this.informationSharingAgreement
    if (isUndefined(informationSharingAgreementArchiveItems)) {
      throw new Error(
        "Expected informationSharingAgreementArchiveItems association to be pre-loaded."
      )
    }
    this.assertNoArchiveItemsLinked(informationSharingAgreementArchiveItems)

    return db.transaction(async () => {
      await this.destroyGroups(this.informationSharingAgreement, this.currentUser)
      // Destroyed one at a time through the service so each removal notifies the
      // designated contacts, as a bulk destroy would not. See TK-6.
      await Attachment.findEach(
        {
          where: {
            targetId: this.informationSharingAgreement.id,
            targetType: AttachmentTargetTypes.InformationSharingAgreement,
            associationName: "signedConfidentialityAcknowledgement",
          },
        },
        async (attachment) => {
          await Attachments.DestroyService.perform(attachment, this.currentUser)
        }
      )
      await this.informationSharingAgreement.update({
        status: InformationSharingAgreement.Status.DRAFT,
        signedById: null,
        signedAt: null,
      })
      return this.informationSharingAgreement.reload({
        include: [
          "accessGrants",
          "signedConfidentialityAcknowledgement",
          "signedConfidentialityReceipt",
        ],
      })
    })
  }

  private assertNoArchiveItemsLinked(
    informationSharingAgreementArchiveItems: InformationSharingAgreementArchiveItem[]
  ): void {
    if (informationSharingAgreementArchiveItems.length > 0) {
      throw new Error("Cannot revert to draft because archive items are linked to this agreement.")
    }
  }

  private async destroyGroups(
    informationSharingAgreement: InformationSharingAgreement,
    currentUser: User
  ): Promise<void> {
    await InformationSharingAgreements.DestroyGroupsService.perform(
      informationSharingAgreement,
      currentUser
    )
  }
}

export default RevertToDraftService
