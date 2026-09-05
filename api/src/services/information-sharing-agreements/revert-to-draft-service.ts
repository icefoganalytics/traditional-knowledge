import db, { InformationSharingAgreement, User } from "@/models"
import BaseService from "@/services/base-service"
import { InformationSharingAgreements } from "@/services"

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

    return db.transaction(async () => {
      // The groups (and their access grants) are removed on revert, but signed documents and
      // any linked knowledge items are intentionally kept so that amending a signed agreement
      // does not lose them. See TK-32.
      await this.destroyGroups(this.informationSharingAgreement, this.currentUser)
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
