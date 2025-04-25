import { Attributes } from "@sequelize/core"
import { isNil } from "lodash"

import { User, Group } from "@/models"
import BaseService from "@/services/base-service"

export type GroupCreationAttributes = Partial<Attributes<Group>>

export class CreateService extends BaseService {
  constructor(
    private attributes: GroupCreationAttributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<Group> {
    const { name, ...optionalAttributes } = this.attributes

    if (isNil(name)) {
      throw new Error("Name is required")
    }

    const group = await Group.create({
      creatorId: this.currentUser.id,
      name,
      ...optionalAttributes,
    })

    return group
  }
}

export default CreateService
