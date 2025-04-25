import { Attributes } from "@sequelize/core"
import { isNil } from "lodash"

import { User, UserGroup } from "@/models"
import BaseService from "@/services/base-service"

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

    const userGroup = await UserGroup.create({
      creatorId: this.currentUser.id,
      userId,
      groupId,
      ...optionalAttributes,
    })

    return userGroup
  }
}

export default CreateService
