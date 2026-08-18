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
  BelongsTo,
  BelongsToMany,
  Default,
  HasMany,
  Index,
  ModelValidator,
  NotNull,
  PrimaryKey,
  Table,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"
import { isEmpty, isNil, isUndefined } from "lodash"

import { UserActiveDirectoryIdentifierUniqueIndex } from "@/models/indexes"

import BaseModel from "@/models/base-model"
import Group from "@/models/group"
import InformationSharingAgreement from "@/models/information-sharing-agreement"
import InformationSharingAgreementAccessGrant from "@/models/information-sharing-agreement-access-grant"
import UserGroup from "@/models/user-group"
import ExternalOrganization from "@/models/external-organization"

/** Keep in sync with web/src/api/users-api.ts */
export enum UserRoles {
  SYSTEM_ADMIN = "system_admin",
  /** Manages internal (Yukon Government) users only. */
  ADMIN = "admin",
  /** Manages external (First Nation and Indigenous Government) users only. */
  EXTERNAL_ADMIN = "external_admin",
  USER = "user",
}

/**
 * roles is a comma-joined string, so matching must respect the delimiters.
 * A naive '%admin%' would also match system_admin and external_admin.
 */
function buildWithRoleScope(role: string) {
  return {
    where: {
      [Op.or]: [
        { roles: role },
        { roles: { [Op.like]: `${role},%` } },
        { roles: { [Op.like]: `%,${role}` } },
        { roles: { [Op.like]: `%,${role},%` } },
      ],
    },
  }
}

@Table({
  tableName: "users",
})
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

  @Attribute(DataTypes.UUID)
  @UserActiveDirectoryIdentifierUniqueIndex
  declare activeDirectoryIdentifier: string | null

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare isExternal: CreationOptional<boolean>

  @Attribute(DataTypes.INTEGER)
  declare externalOrganizationId: number | null

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
    // Validates each role, not the comma-joined string, so a user may hold more than
    // one role. isIn would compare against "user,admin" as a whole and always fail.
    isEachRoleValid(value: unknown) {
      const roles = Array.isArray(value) ? value : String(value).split(",")
      const permittedRoles = Object.values(UserRoles) as string[]

      const invalidRole = roles.find((role) => !permittedRoles.includes(role))
      if (!isUndefined(invalidRole)) {
        throw new Error(`Role must be one of ${permittedRoles.join(", ")}`)
      }
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

  @Attribute(DataTypes.STRING(50))
  declare phoneNumber: string | null

  @Attribute(DataTypes.DATE(0))
  declare lastSyncSuccessAt: Date | null

  @Attribute(DataTypes.DATE(0))
  declare lastSyncFailureAt: Date | null

  @Attribute(DataTypes.DATE(0))
  declare deactivatedAt: Date | null

  @Attribute(DataTypes.TEXT)
  declare deactivationReason: string | null

  @Attribute(DataTypes.DATE(0))
  declare lastActiveAt: Date | null

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare emailNotificationsEnabled: CreationOptional<boolean>

  @Attribute(DataTypes.INTEGER)
  declare creatorId: number | null

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
  get isSystemAdmin(): NonAttribute<boolean> {
    return this.roles.some((role) => role === UserRoles.SYSTEM_ADMIN)
  }

  get isAdmin(): NonAttribute<boolean> {
    return this.roles.some((role) => role === UserRoles.ADMIN)
  }

  get isExternalAdmin(): NonAttribute<boolean> {
    return this.roles.some((role) => role === UserRoles.EXTERNAL_ADMIN)
  }

  /**
   * The user administration matrix, in one place so policies, services and the UI
   * cannot drift apart. See TK-36.
   */
  canManageUser(target: User): boolean {
    if (this.isSystemAdmin) return true
    if (this.isAdmin && target.isExternal !== true) return true
    if (this.isExternalAdmin && target.isExternal === true) return true

    return false
  }

  /** Only a system admin may create or revoke another system admin. */
  canGrantRole(role: string): boolean {
    if (this.isSystemAdmin) return true

    return role !== UserRoles.SYSTEM_ADMIN
  }

  get isGroupAdmin(): NonAttribute<boolean> {
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

  isMemberOfGroup(groupId: number | null): boolean {
    if (isUndefined(this.groups)) {
      throw new Error("Expected groups association to be pre-loaded.")
    }

    return this.groups.some((group) => group.id === groupId)
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

  // Model Validators
  @ModelValidator
  ensureUserDeactivatedAtDeactivationReasonConsistency() {
    if (!isNil(this.deactivatedAt) && isNil(this.deactivationReason)) {
      throw new Error("Deactivation reason is required when deactivating a user")
    }

    if (isNil(this.deactivatedAt) && !isNil(this.deactivationReason)) {
      throw new Error("Deactivation reason should not be present for active users")
    }
  }

  @ModelValidator
  ensureIsExternalUserHasExternalOrganization() {
    if (this.isExternal && isNil(this.externalOrganizationId)) {
      throw new Error("External user must have an external organization")
    }

    if (!this.isExternal && !isNil(this.externalOrganizationId)) {
      throw new Error("Non-external user must not reference an external organization")
    }
  }

  // Associations
  @BelongsTo(() => ExternalOrganization, {
    foreignKey: "externalOrganizationId",
    inverse: {
      as: "users",
      type: "hasMany",
    },
  })
  declare externalOrganization?: NonAttribute<ExternalOrganization>

  @HasMany(() => InformationSharingAgreement, {
    foreignKey: "creatorId",
    inverse: "creator",
  })
  declare createdInformationSharingAgreements?: NonAttribute<InformationSharingAgreement[]>

  @HasMany(() => InformationSharingAgreement, {
    foreignKey: "externalGroupContactId",
    inverse: "externalGroupContact",
  })
  declare externalInformationAgreementAsContact?: NonAttribute<InformationSharingAgreement[]>

  @HasMany(() => InformationSharingAgreement, {
    foreignKey: "internalGroupContactId",
    inverse: "internalGroupContact",
  })
  declare internalInformationAgreementAsContact?: NonAttribute<InformationSharingAgreement[]>

  @HasMany(() => InformationSharingAgreement, {
    foreignKey: "internalGroupSecondaryContactId",
    inverse: "internalGroupSecondaryContact",
  })
  declare internalInformationAgreementAsSecondaryContact?: NonAttribute<
    InformationSharingAgreement[]
  >

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

  // NOTE: order of definition seem to matter for parent-child relationships?
  @HasMany(() => User, {
    foreignKey: "creatorId",
    inverse: "creator",
  })
  declare createdUsers?: NonAttribute<User[]>

  // NOTE: order of definition seem to matter for parent-child relationships?
  @BelongsTo(() => User, {
    foreignKey: "creatorId",
    inverse: {
      as: "createdUsers",
      type: "hasMany",
    },
  })
  declare creator?: NonAttribute<User>

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

    this.addScope("withRole", (role: string) => buildWithRoleScope(role))

    this.addScope("isSystemAdmin", () => buildWithRoleScope(UserRoles.SYSTEM_ADMIN))

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

    this.addScope("withSameTypeAsGroup", (groupId: number) => {
      return {
        where: sql`
          ${sql.attribute("isExternal")} = (
            SELECT
              is_external
            FROM
              [groups]
            WHERE
              deleted_at IS NULL
              AND id = ${groupId}
          )
        `,
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
