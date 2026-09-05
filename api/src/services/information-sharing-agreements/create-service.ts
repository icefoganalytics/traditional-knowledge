import { Attributes } from "@sequelize/core"
import { isNil } from "lodash"

import db, { User, InformationSharingAgreement } from "@/models"
import BaseService from "@/services/base-service"

export type InformationSharingAgreementCreationAttributes = Partial<
  Attributes<InformationSharingAgreement>
>

export class CreateService extends BaseService {
  constructor(
    private attributes: InformationSharingAgreementCreationAttributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<InformationSharingAgreement> {
    const { title, ...optionalAttributes } = this.attributes

    if (isNil(title)) {
      throw new Error("Title is required")
    }

    return db.transaction(async () => {
      const informationSharingAgreement = await InformationSharingAgreement.create({
        ...optionalAttributes,
        creatorId: this.currentUser.id,
        title,
        status: InformationSharingAgreement.Status.DRAFT,
      })

      return informationSharingAgreement.reload({
        include: [
          "accessGrants",
          "signedConfidentialityAcknowledgement",
          "signedConfidentialityReceipt",
        ],
      })
    })
  }
}

export default CreateService
