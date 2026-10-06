import { Factory } from "fishery"

import { InformationSharingAgreementKnowledgeItem } from "@/models"
import { nestedSaveAndAssociateIfNew } from "@/tests/factories/helpers"
import knowledgeItemFactory from "@/tests/factories/knowledge-item-factory"
import informationSharingAgreementFactory from "@/tests/factories/information-sharing-agreement-factory"
import userFactory from "@/tests/factories/user-factory"

export const informationSharingAgreementKnowledgeItemFactory =
  Factory.define<InformationSharingAgreementKnowledgeItem>(({ associations, onCreate }) => {
    onCreate(async (informationSharingAgreementKnowledgeItem) => {
      try {
        await nestedSaveAndAssociateIfNew(informationSharingAgreementKnowledgeItem)
        return informationSharingAgreementKnowledgeItem
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create InformationSharingAgreementKnowledgeItem with attributes: ${JSON.stringify(informationSharingAgreementKnowledgeItem.dataValues, null, 2)}`
        )
      }
    })

    const informationSharingAgreement =
      associations.informationSharingAgreement ??
      informationSharingAgreementFactory.build({
        id: undefined,
      })

    const knowledgeItem =
      associations.knowledgeItem ??
      knowledgeItemFactory.build({
        id: undefined,
      })

    const creator =
      associations.creator ??
      userFactory.build({
        id: undefined,
      })

    const informationSharingAgreementKnowledgeItem = InformationSharingAgreementKnowledgeItem.build(
      {
        informationSharingAgreementId: informationSharingAgreement.id,
        knowledgeItemId: knowledgeItem.id,
        creatorId: creator.id,
      }
    )

    informationSharingAgreementKnowledgeItem.informationSharingAgreement =
      informationSharingAgreement
    informationSharingAgreementKnowledgeItem.knowledgeItem = knowledgeItem
    informationSharingAgreementKnowledgeItem.creator = creator

    return informationSharingAgreementKnowledgeItem
  })

export default informationSharingAgreementKnowledgeItemFactory
