import { Attributes } from "@sequelize/core"

import db, { User, InformationSharingAgreementKnowledgeItem } from "@/models"
import BaseService from "@/services/base-service"

export type InformationSharingAgreementKnowledgeItemUpdateAttributes = Partial<
  Attributes<InformationSharingAgreementKnowledgeItem>
>

export class UpdateService extends BaseService {
  constructor(
    private informationSharingAgreementKnowledgeItem: InformationSharingAgreementKnowledgeItem,
    private attributes: InformationSharingAgreementKnowledgeItemUpdateAttributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<InformationSharingAgreementKnowledgeItem> {
    return db.transaction(async () => {
      await this.informationSharingAgreementKnowledgeItem.update(this.attributes)
      return this.informationSharingAgreementKnowledgeItem
    })
  }
}

export default UpdateService
