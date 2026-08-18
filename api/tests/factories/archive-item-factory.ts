import { faker } from "@faker-js/faker"
import { Factory } from "fishery"

import { ArchiveItem } from "@/models"
import { nestedSaveAndAssociateIfNew } from "@/tests/factories/helpers"
import userFactory from "@/tests/factories/user-factory"

export const archiveItemFactory = Factory.define<ArchiveItem>(
  ({ sequence, params, associations, onCreate }) => {
    onCreate(async (archiveItem) => {
      try {
        await nestedSaveAndAssociateIfNew(archiveItem)
        return archiveItem
      } catch (error) {
        console.error(error)
        throw new Error(
          `Could not create ArchiveItem with attributes: ${JSON.stringify(archiveItem.dataValues, null, 2)}`
        )
      }
    })

    const user =
      associations.user ??
      userFactory.build({
        id: params.userId,
      })

    const archiveItem = ArchiveItem.build({
      isDecision: false,
      confidentialityReceipt: false,
      title: `${faker.lorem.sentence()}-${sequence}`,
      status: ArchiveItem.Statuses.ACCEPTED,
      securityLevel: ArchiveItem.Levels.LOW,
      userId: user.id,
    })

    archiveItem.user = user

    return archiveItem
  }
)

export default archiveItemFactory
