import { Attributes } from "@sequelize/core"
import { isNil } from "lodash"

import db, { User, InformationSharingAgreementArchiveItem } from "@/models"
import BaseService from "@/services/base-service"

export type InformationSharingAgreementArchiveItemCreationAttributes = Partial<
  Attributes<InformationSharingAgreementArchiveItem>
>

export class CreateService extends BaseService {
  constructor(
    private attributes: InformationSharingAgreementArchiveItemCreationAttributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<InformationSharingAgreementArchiveItem> {
    const { informationSharingAgreementId, archiveItemId, ...optionalAttributes } = this.attributes

    if (isNil(informationSharingAgreementId)) {
      throw new Error("Information sharing agreement is required")
    }

    if (isNil(archiveItemId)) {
      throw new Error("Archive item is required")
    }

    return db.transaction(async () => {
      const informationSharingAgreementArchiveItem =
        await InformationSharingAgreementArchiveItem.create({
          ...optionalAttributes,
          informationSharingAgreementId,
          archiveItemId,
          creatorId: this.currentUser.id,
        })

      return informationSharingAgreementArchiveItem
    })
  }
}

export default CreateService
