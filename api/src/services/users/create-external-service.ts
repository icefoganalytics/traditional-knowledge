import { type Attributes } from "@sequelize/core"
import { isNil } from "lodash"

import db, { User } from "@/models"
import BaseService from "@/services/base-service"

export type UserExternalCreationAttributes = Partial<Attributes<User>>

export class CreateExternalService extends BaseService {
  constructor(
    private attributes: UserExternalCreationAttributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<User> {
    const {
      email,
      externalOrganizationId,
      auth0Subject,
      firstName,
      lastName,
      displayName,
      roles,
      ...optionalAttributes
    } = this.attributes

    if (isNil(email)) {
      throw new Error("Email is required")
    }

    if (isNil(externalOrganizationId)) {
      throw new Error("External organization is required")
    }

    if (isNil(firstName)) {
      throw new Error("First name is required")
    }

    if (isNil(lastName)) {
      throw new Error("Last name is required")
    }

    const auth0SubjectOrFallback = auth0Subject || email
    const displayNameOrFallback = displayName || `${firstName} ${lastName}`
    const rolesOrFallback = roles ?? [User.Roles.USER]

    return db.transaction(async () => {
      const user = await User.create({
        ...optionalAttributes,
        email,
        externalOrganizationId,
        auth0Subject: auth0SubjectOrFallback,
        firstName,
        lastName,
        displayName: displayNameOrFallback,
        roles: rolesOrFallback,
        isExternal: true,
        creatorId: this.currentUser.id,
      })

      return user.reload({
        include: ["adminGroups", "adminInformationSharingAgreementAccessGrants"],
      })
    })
  }
}

export default CreateExternalService
