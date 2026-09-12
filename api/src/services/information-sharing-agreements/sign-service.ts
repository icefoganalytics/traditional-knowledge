import { DateTime } from "luxon"
import { isNil, truncate } from "lodash"

import db, {
  Attachment,
  InformationSharingAgreement,
  InformationSharingAgreementAudit,
  User,
} from "@/models"
import BaseService from "@/services/base-service"
import { Attachments, InformationSharingAgreements } from "@/services"

export type SignServiceAttributes = Partial<
  Omit<
    InformationSharingAgreement,
    "signedConfidentialityAcknowledgement" | "signedConfidentialityReceipt"
  >
> &
  Partial<{
    signedConfidentialityAcknowledgement: {
      path: string
    }
    signedConfidentialityReceipt: {
      path: string
    }
  }>

export class SignService extends BaseService {
  constructor(
    private informationSharingAgreement: InformationSharingAgreement,
    private attributes: SignServiceAttributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<InformationSharingAgreement> {
    if (!this.informationSharingAgreement.isDraft()) {
      throw new Error("Only draft agreements can be signed.")
    }

    const { signedConfidentialityAcknowledgement } = this.attributes
    if (isNil(signedConfidentialityAcknowledgement)) {
      throw new Error("A signed confidentiality acknowledgement file is required.")
    }

    const { path: signedConfidentialityAcknowledgementFilePath } =
      signedConfidentialityAcknowledgement

    const { confidentialityType } = this.informationSharingAgreement
    const isConfidentialityTypeAcceptedInConfidence =
      confidentialityType ===
      InformationSharingAgreement.ConfidentialityTypes.ACCEPTED_IN_CONFIDENCE

    const { signedConfidentialityReceipt } = this.attributes
    let signedConfidentialityReceiptFilePath: string | null = null
    if (isConfidentialityTypeAcceptedInConfidence) {
      if (isNil(signedConfidentialityReceipt)) {
        throw new Error(
          "A signed confidentiality receipt is required when the agreement is accepted in confidence."
        )
      }

      signedConfidentialityReceiptFilePath = signedConfidentialityReceipt.path
    }

    const { title } = this.informationSharingAgreement
    const safeTitle = this.buildSafeTitle(title)
    const confidentialityAcknowledgementFileName =
      this.buildConfidentialityAcknowledgementFileName(safeTitle)

    return db.transaction(async () => {
      await Attachments.UpsertService.perform(
        signedConfidentialityAcknowledgementFilePath,
        confidentialityAcknowledgementFileName,
        {
          targetId: this.informationSharingAgreement.id,
          targetType: Attachment.TargetTypes.InformationSharingAgreement,
          associationName: "signedConfidentialityAcknowledgement",
        }
      )

      if (!isNil(signedConfidentialityReceiptFilePath)) {
        const confidentialityReceiptFileName =
          this.buildConfidentialityReceiptFileName(safeTitle)
        await Attachments.UpsertService.perform(
          signedConfidentialityReceiptFilePath,
          confidentialityReceiptFileName,
          {
            targetId: this.informationSharingAgreement.id,
            targetType: Attachment.TargetTypes.InformationSharingAgreement,
            associationName: "signedConfidentialityReceipt",
          }
        )
      }

      await this.informationSharingAgreement.update({
        status: InformationSharingAgreement.Status.SIGNED,
        signedById: this.currentUser.id,
        signedAt: new Date(),
        auditEnabled: true,
      })

      await InformationSharingAgreementAudit.create({
        informationSharingAgreementId: this.informationSharingAgreement.id,
        userId: this.currentUser.id,
        action: "Signed",
        description: `${this.currentUser.displayName} signed the agreement`,
      })

      await this.createGroups(this.informationSharingAgreement, this.currentUser)

      return this.informationSharingAgreement.reload({
        include: [
          "accessGrants",
          "signedConfidentialityAcknowledgement",
          "signedConfidentialityReceipt",
        ],
      })
    })
  }

  private async createGroups(
    informationSharingAgreement: InformationSharingAgreement,
    currentUser: User
  ): Promise<void> {
    await InformationSharingAgreements.CreateGroupsService.perform(
      informationSharingAgreement,
      currentUser
    )
  }

  private buildConfidentialityAcknowledgementFileName(safeTitle: string): string {
    const date = DateTime.now().toFormat("yyyy-MM-dd")
    return `Signed Confidentiality Acknowledgement, ${safeTitle}, ${date}`
  }

  private buildConfidentialityReceiptFileName(safeTitle: string): string {
    const date = DateTime.now().toFormat("yyyy-MM-dd")
    return `Signed Confidentiality Receipt, ${safeTitle}, ${date}`
  }

  private buildSafeTitle(title: string): string {
    return truncate(title, {
      length: 60,
      separator: /,? +/,
      omission: "",
    })
  }
}

export default SignService
