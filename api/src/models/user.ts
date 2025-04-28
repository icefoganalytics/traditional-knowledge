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
import { isNil } from "lodash"

import BaseModel from "@/models/base-model"
import Group from "@/models/group"
import UserGroup from "@/models/user-group"
import UserPermission from "@/models/user-permission"

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

  get categories(): NonAttribute<number[]> {
    if (this.userPermissions) {
      return this.userPermissions
        ?.map((permission) => permission.categoryId)
        .filter((categoryId) => !isNil(categoryId))
    }
    return []
  }

  get sources(): NonAttribute<number[]> {
    if (this.userPermissions) {
      return this.userPermissions
        ?.map((permission) => permission.sourceId)
        .filter((sourceId) => !isNil(sourceId))
    }
    return []
  }

  // Associations
  @HasMany(() => UserGroup, {
    foreignKey: {
      name: "userId",
      allowNull: false,
    },
    inverse: "user",
  })
  declare userOrganizations?: NonAttribute<UserGroup[]>

  @HasMany(() => UserPermission, {
    foreignKey: "userId",
    inverse: {
      as: "user",
    },
  })
  declare userPermissions?: NonAttribute<UserPermission[]>

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

  // Scopes
  static establishScopes(): void {
    this.addSearchScope(["firstName", "lastName", "displayName"])

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
  }
}

export default User
