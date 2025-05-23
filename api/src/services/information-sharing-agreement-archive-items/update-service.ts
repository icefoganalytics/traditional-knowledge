import { Attributes } from "@sequelize/core"

import db, { User, InformationSharingAgreementArchiveItem } from "@/models"
import BaseService from "@/services/base-service"

export type InformationSharingAgreementArchiveItemUpdateAttributes = Partial<
  Attributes<InformationSharingAgreementArchiveItem>
>

export class UpdateService extends BaseService {
  constructor(
    private informationSharingAgreementArchiveItem: InformationSharingAgreementArchiveItem,
    private attributes: InformationSharingAgreementArchiveItemUpdateAttributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<InformationSharingAgreementArchiveItem> {
    return db.transaction(async () => {
      await this.informationSharingAgreementArchiveItem.update(this.attributes)
      return this.informationSharingAgreementArchiveItem
    })
  }
}

export default UpdateService
