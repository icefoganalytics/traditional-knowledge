import { faker } from "@faker-js/faker"
import { Factory } from "fishery"

import { KnowledgeItem } from "@/models"
import { nestedSaveAndAssociateIfNew } from "@/tests/factories/helpers"
import userFactory from "@/tests/factories/user-factory"

export const knowledgeItemFactory = Factory.define<KnowledgeItem>(
  ({ sequence, params, associations, onCreate }) => {
    onCreate(async (knowledgeItem) => {
      try {
        await nestedSaveAndAssociateIfNew(knowledgeItem)
        return knowledgeItem
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create KnowledgeItem with attributes: ${JSON.stringify(knowledgeItem.dataValues, null, 2)}`
        )
      }
    })

    const user =
      associations.user ??
      userFactory.build({
        id: params.userId,
      })

    const knowledgeItem = KnowledgeItem.build({
      isDecision: false,
      confidentialityReceipt: false,
      title: `${faker.lorem.sentence()}-${sequence}`,
      status: KnowledgeItem.Statuses.ACCEPTED,
      securityLevel: KnowledgeItem.Levels.LOW,
      userId: user.id,
    })

    knowledgeItem.user = user

    return knowledgeItem
  }
)

export default knowledgeItemFactory
