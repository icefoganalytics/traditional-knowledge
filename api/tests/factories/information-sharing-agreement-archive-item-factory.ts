import { Factory } from "fishery"

import { InformationSharingAgreementArchiveItem } from "@/models"
import { nestedSaveAndAssociateIfNew } from "@/tests/factories/helpers"
import archiveItemFactory from "@/tests/factories/archive-item-factory"
import informationSharingAgreementFactory from "@/tests/factories/information-sharing-agreement-factory"
import userFactory from "@/tests/factories/user-factory"

export const informationSharingAgreementArchiveItemFactory =
  Factory.define<InformationSharingAgreementArchiveItem>(({ associations, onCreate }) => {
    onCreate(async (informationSharingAgreementArchiveItem) => {
      try {
        await nestedSaveAndAssociateIfNew(informationSharingAgreementArchiveItem)
        return informationSharingAgreementArchiveItem
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create InformationSharingAgreementArchiveItem with attributes: ${JSON.stringify(informationSharingAgreementArchiveItem.dataValues, null, 2)}`
        )
      }
    })

    const informationSharingAgreement =
      associations.informationSharingAgreement ??
      informationSharingAgreementFactory.build({
        id: undefined,
      })

    const archiveItem =
      associations.archiveItem ??
      archiveItemFactory.build({
        id: undefined,
      })

    const creator =
      associations.creator ??
      userFactory.build({
        id: undefined,
      })

    const informationSharingAgreementArchiveItem = InformationSharingAgreementArchiveItem.build({
      informationSharingAgreementId: informationSharingAgreement.id,
      archiveItemId: archiveItem.id,
      creatorId: creator.id,
    })

    informationSharingAgreementArchiveItem.informationSharingAgreement =
      informationSharingAgreement
    informationSharingAgreementArchiveItem.archiveItem = archiveItem
    informationSharingAgreementArchiveItem.creator = creator

    return informationSharingAgreementArchiveItem
  })

export default informationSharingAgreementArchiveItemFactory
