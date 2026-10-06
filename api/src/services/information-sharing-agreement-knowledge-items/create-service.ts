import { Attributes } from "@sequelize/core"
import { isNil } from "lodash"

import db, { User, InformationSharingAgreementKnowledgeItem } from "@/models"
import BaseService from "@/services/base-service"

export type InformationSharingAgreementKnowledgeItemCreationAttributes = Partial<
  Attributes<InformationSharingAgreementKnowledgeItem>
>

export class CreateService extends BaseService {
  constructor(
    private attributes: InformationSharingAgreementKnowledgeItemCreationAttributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<InformationSharingAgreementKnowledgeItem> {
    const { informationSharingAgreementId, knowledgeItemId, ...optionalAttributes } =
      this.attributes

    if (isNil(informationSharingAgreementId)) {
      throw new Error("Information sharing agreement is required")
    }

    if (isNil(knowledgeItemId)) {
      throw new Error("Knowledge item is required")
    }

    return db.transaction(async () => {
      const informationSharingAgreementKnowledgeItem =
        await InformationSharingAgreementKnowledgeItem.create({
          ...optionalAttributes,
          informationSharingAgreementId,
          knowledgeItemId,
          creatorId: this.currentUser.id,
        })

      return informationSharingAgreementKnowledgeItem
    })
  }
}

export default CreateService
