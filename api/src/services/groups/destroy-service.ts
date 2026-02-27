import { Op } from "@sequelize/core"

import db, { Group, UserGroup, User, InformationSharingAgreement } from "@/models"
import BaseService from "@/services/base-service"
import { UserGroups } from "@/services"

export class DestroyService extends BaseService {
  constructor(
    private group: Group,
    private currentUser: User
  ) {
    super()
  }

  async perform() {
    const { id: groupId } = this.group
    return db.transaction(async () => {
      await this.assertNoDependentEntitiesExist(groupId)
      await this.cleanupUserGroups(groupId)
      await this.group.destroy()
    })
  }

  private async assertNoDependentEntitiesExist(groupId: number) {
    await this.assertNoDependentInformationSharingAgreementsExist(groupId)
  }

  private async assertNoDependentInformationSharingAgreementsExist(groupId: number) {
    const dependentInformationSharingAgreementsCount = await InformationSharingAgreement.count({
      where: {
        [Op.or]: [
          {
            externalGroupId: groupId,
          },
          {
            internalGroupId: groupId,
          },
        ],
      },
    })
    if (dependentInformationSharingAgreementsCount > 0) {
      throw new Error("Groups with dependent information sharing agreements cannot be deleted")
    }
  }

  private async cleanupUserGroups(groupId: number) {
    await UserGroup.findEach(
      {
        where: {
          groupId,
        },
        include: ["user", "group"],
      },
      async (userGroup) => {
        await UserGroups.DestroyService.perform(userGroup, this.currentUser)
      }
    )
  }
}

export default DestroyService
