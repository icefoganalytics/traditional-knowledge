import {
  DataTypes,
  Op,
  sql,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type NonAttribute,
} from "@sequelize/core"
import {
  Attribute,
  AutoIncrement,
  BelongsToMany,
  Default,
  HasMany,
  Index,
  NotNull,
  PrimaryKey,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"
import { isEmpty, isNil, isUndefined } from "lodash"

import BaseModel from "@/models/base-model"
import Group from "@/models/group"
import InformationSharingAgreement from "@/models/information-sharing-agreement"
import InformationSharingAgreementAccessGrant from "@/models/information-sharing-agreement-access-grant"
import UserGroup from "@/models/user-group"

/** Keep in sync with web/src/api/users-api.ts */
export enum UserRoles {
  SYSTEM_ADMIN = "system_admin",
  USER = "user",
}

export class User extends BaseModel<InferAttributes<User>, InferCreationAttributes<User>> {
  static readonly Roles = UserRoles

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.STRING(100))
  @NotNull
  @Index({ unique: true })
  declare email: string

  @Attribute(DataTypes.STRING(100))
  @NotNull
  @Index({ unique: true })
  declare auth0Subject: string

  @Attribute(DataTypes.STRING(100))
  @NotNull
  declare firstName: string

  @Attribute(DataTypes.STRING(100))
  @NotNull
  declare lastName: string

  @Attribute(DataTypes.STRING(200))
  @NotNull
  declare displayName: string

  @Attribute({
    type: DataTypes.STRING(255),
    get() {
      const roles = this.getDataValue("roles")
      if (isNil(roles)) {
        return []
      }
      return roles.split(",")
    },
    set(value: string[]) {
      this.setDataValue("roles", value.join(","))
    },
  })
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(UserRoles)],
      msg: `Role must be one of ${Object.values(UserRoles).join(", ")}`,
    },
  })
  declare roles: string[]

  @Attribute(DataTypes.STRING(100))
  declare title: string | null

  @Attribute(DataTypes.STRING(100))
  declare department: string | null

  @Attribute(DataTypes.STRING(100))
  declare division: string | null

  @Attribute(DataTypes.STRING(100))
  declare branch: string | null

  @Attribute(DataTypes.STRING(100))
  declare unit: string | null

  @Attribute(DataTypes.DATE(0))
  declare deactivatedAt: Date | null

  @Attribute(DataTypes.DATE(0))
  @NotNull
  @Default(sql.fn("getutcdate"))
  declare createdAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE(0))
  @NotNull
  @Default(sql.fn("getutcdate"))
  declare updatedAt: CreationOptional<Date>

  @Attribute(DataTypes.DATE(0))
  declare deletedAt: Date | null

  // Magic Attributes
  get isSystemAdmin(): NonAttribute<boolean | undefined> {
    return this.roles?.some((role) => role === UserRoles.SYSTEM_ADMIN)
  }

  get isGroupAdmin(): NonAttribute<boolean | undefined> {
    if (isUndefined(this.adminGroups)) {
      throw new Error("Expected adminGroups association to be pre-loaded.")
    }

    return !isEmpty(this.adminGroups)
  }

  // Helper functions
  isGroupAdminOf(groupId: number): boolean {
    if (isUndefined(this.adminGroups)) {
      throw new Error("Expected adminGroups association to be pre-loaded.")
    }

    return this.adminGroups.some((group) => group.id === groupId)
  }

  isAdminForInformationSharingAgreement(informationSharingAgreementId: number): boolean {
    if (isUndefined(this.adminInformationSharingAgreementAccessGrants)) {
      throw new Error(
        "Expected adminInformationSharingAgreementAccessGrants association to be pre-loaded."
      )
    }

    return this.adminInformationSharingAgreementAccessGrants.some(
      (accessGrant) => accessGrant.informationSharingAgreementId === informationSharingAgreementId
    )
  }

  // Associations
  @HasMany(() => InformationSharingAgreement, {
    foreignKey: "creatorId",
    inverse: "creator",
  })
  declare createdInformationSharingAgreements?: NonAttribute<InformationSharingAgreement[]>

  @HasMany(() => InformationSharingAgreement, {
    foreignKey: "sharingGroupContactId",
    inverse: "sharingGroupContact",
  })
  declare sharedInformationAgreementAsContact?: NonAttribute<InformationSharingAgreement[]>

  @HasMany(() => InformationSharingAgreement, {
    foreignKey: "receivingGroupContactId",
    inverse: "receivingGroupContact",
  })
  declare receivedInformationAgreementAsContact?: NonAttribute<InformationSharingAgreement[]>

  @HasMany(() => InformationSharingAgreementAccessGrant, {
    foreignKey: "userId",
    inverse: "user",
  })
  declare informationSharingAgreementAccessGrants?: NonAttribute<
    InformationSharingAgreementAccessGrant[]
  >

  @HasMany(() => InformationSharingAgreementAccessGrant, {
    foreignKey: "userId",
    inverse: "user",
    scope: {
      // I would prefer to use InformationSharingAgreementAccessGrant.AccessLevels.ADMIN,
      // but this causes a circular dependency. Sequelize does not seem to support
      // lazy evaluation of scopes.
      accessLevel: "admin",
    },
  })
  declare adminInformationSharingAgreementAccessGrants?: NonAttribute<
    InformationSharingAgreementAccessGrant[]
  >

  @HasMany(() => InformationSharingAgreementAccessGrant, {
    foreignKey: "creatorId",
    inverse: "creator",
  })
  declare createdInformationSharingAgreementAccessGrants?: NonAttribute<
    InformationSharingAgreementAccessGrant[]
  >

  @HasMany(() => UserGroup, {
    foreignKey: {
      name: "userId",
      allowNull: false,
    },
    inverse: "user",
  })
  declare userOrganizations?: NonAttribute<UserGroup[]>

  @HasMany(() => UserGroup, {
    foreignKey: {
      name: "userId",
      allowNull: false,
    },
    inverse: "user",
  })
  declare userGroups?: NonAttribute<UserGroup[]>

  @HasMany(() => UserGroup, {
    foreignKey: {
      name: "userId",
      allowNull: false,
    },
    inverse: "user",
    scope: {
      isAdmin: true,
    },
  })
  declare adminUserGroups?: NonAttribute<UserGroup[]>

  @BelongsToMany(() => Group, {
    through: () => UserGroup,
    foreignKey: "userId",
    otherKey: "groupId",
    inverse: "users",
    throughAssociations: {
      fromSource: "userGroups",
      toSource: "user",
      fromTarget: "userGroups",
      toTarget: "group",
    },
  })
  declare groups?: NonAttribute<Group[]>
  /**
   * Created by User.belongsToMany(Group), refers to a direct connection to a given User
   * Populated by by { include: [{ association: "groups", through: { attributes: [xxx] } }] }
   * See https://sequelize.org/docs/v7/querying/select-in-depth/#eager-loading-the-belongstomany-through-model
   */
  declare userGroup?: NonAttribute<UserGroup>

  @BelongsToMany(() => Group, {
    through: {
      model: () => UserGroup,
      scope: {
        isAdmin: true,
      },
    },
    foreignKey: "userId",
    otherKey: "groupId",
    // TODO: set inverse to "adminUsers" once https://github.com/sequelize/sequelize/issues/16034 is fixed
    // This workaround is necessary because the inverse fails to define symetrically so is never valid.
    inverse: "inverseAdminGroups",
  })
  declare adminGroups?: NonAttribute<Group[]>

  // Scopes
  static establishScopes(): void {
    this.addSearchScope(["firstName", "lastName", "displayName", "email"])

    this.addScope("inGroup", (groupId: number) => {
      return {
        include: [
          {
            association: "userGroup",
            where: {
              groupId,
            },
          },
        ],
      }
    })
    this.addScope("notInGroup", (groupId) => {
      return {
        where: {
          id: {
            [Op.notIn]: sql`
              (
                SELECT
                  user_id
                FROM
                  user_groups
                WHERE
                  deleted_at IS NULL
                  AND group_id = :groupId
              )
            `,
          },
        },
        replacements: {
          groupId,
        },
      }
    })

    this.addScope("withoutAccessGrantFor", (informationSharingAgreementId: number) => {
      return {
        where: {
          id: {
            [Op.notIn]: sql`
              (
                SELECT
                  user_id
                FROM
                  information_sharing_agreement_access_grants
                WHERE
                  deleted_at IS NULL
                  AND information_sharing_agreement_id = :informationSharingAgreementId
              )
            `,
          },
        },
        replacements: {
          informationSharingAgreementId,
        },
      }
    })
  }
}

export default User
