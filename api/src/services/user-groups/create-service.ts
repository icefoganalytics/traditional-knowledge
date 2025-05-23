import { Attributes } from "@sequelize/core"
import { isNil } from "lodash"

import db, { Group, User, UserGroup } from "@/models"
import BaseService from "@/services/base-service"
import { Notifications } from "@/services"

export type UserGroupCreationAttributes = Partial<Attributes<UserGroup>>

export class CreateService extends BaseService {
  constructor(
    private attributes: UserGroupCreationAttributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<UserGroup> {
    const { userId, groupId, ...optionalAttributes } = this.attributes

    if (isNil(userId)) {
      throw new Error("User ID is required")
    }

    if (isNil(groupId)) {
      throw new Error("Group ID is required")
    }

    return db.transaction(async () => {
      // _TODO_ can I eager load the user and group?
      const userGroup = await UserGroup.create({
        creatorId: this.currentUser.id,
        userId,
        groupId,
        ...optionalAttributes,
      })

      const user = await User.findByPk(userId)
      const group = await Group.findByPk(groupId)

      if (isNil(user)) {
        throw new Error("User not found")
      }

      if (isNil(group)) {
        throw new Error("Group not found")
      }

      await Notifications.Groups.NotifyUserOfMembershipService.perform(
        user,
        group,
        this.currentUser
      )

      return userGroup
    })
  }
}

export default CreateService
