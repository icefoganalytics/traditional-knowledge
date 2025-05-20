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
  NotNull,
  PrimaryKey,
} from "@sequelize/core/decorators-legacy"

import arrayWrap from "@/utils/array-wrap"

import BaseModel from "@/models/base-model"
import InformationSharingAgreement from "@/models/information-sharing-agreement"
import User from "@/models/user"
import UserGroup from "@/models/user-group"

export class Group extends BaseModel<InferAttributes<Group>, InferCreationAttributes<Group>> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare creatorId: number

  @Attribute(DataTypes.STRING(100))
  @NotNull
  @Index({
    unique: true,
    name: "groups_name_unique",
    where: {
      deletedAt: null,
    },
  })
  declare name: string

  @Attribute(DataTypes.STRING(255))
  declare acronym: string | null

  @Attribute(DataTypes.TEXT)
  declare description: string | null

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare isHost: CreationOptional<boolean>

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

  // Associations
  @BelongsTo(() => User, {
    foreignKey: "creatorId",
    inverse: {
      as: "createdGroups",
      type: "hasMany",
    },
  })
  declare creator?: NonAttribute<User>

  @HasMany(() => InformationSharingAgreement, {
    foreignKey: "sharingGroupId",
    inverse: "sharingGroup",
  })
  declare sharedInformationAgreements?: NonAttribute<InformationSharingAgreement[]>

  @HasMany(() => InformationSharingAgreement, {
    foreignKey: "receivingGroupId",
    inverse: "receivingGroup",
  })
  declare receivedInformationAgreements?: NonAttribute<InformationSharingAgreement[]>

  @HasMany(() => UserGroup, {
    foreignKey: {
      name: "groupId",
      allowNull: false,
    },
    inverse: "group",
  })
  declare userGroups?: NonAttribute<UserGroup[]>

  @HasMany(() => UserGroup, {
    foreignKey: {
      name: "groupId",
      allowNull: false,
    },
    inverse: "group",
    scope: {
      isAdmin: true,
    },
  })
  declare adminUserGroups?: NonAttribute<UserGroup[]>

  @BelongsToMany(() => User, {
    through: () => UserGroup,
    foreignKey: "groupId",
    otherKey: "userId",
    inverse: "groups",
    throughAssociations: {
      fromSource: "userGroups",
      toSource: "group",
      fromTarget: "userGroups",
      toTarget: "user",
    },
  })
  declare users?: NonAttribute<User[]>
  /**
   * Created by Group.belongsToMany(User), refers to a direct connection to a given User
   * Populated by by { include: [{ association: "users", through: { attributes: [xxx] } }] }
   * See https://sequelize.org/docs/v7/querying/select-in-depth/#eager-loading-the-belongstomany-through-model
   */
  declare userGroup?: NonAttribute<UserGroup>

  @BelongsToMany(() => User, {
    through: {
      model: () => UserGroup,
      scope: {
        isAdmin: true,
      },
    },
    foreignKey: "groupId",
    otherKey: "userId",
    // TODO: set inverse to "adminGroups" once https://github.com/sequelize/sequelize/issues/16034 is fixed
    // This workaround is necessary because the inverse fails to define symetrically so is never valid.
    inverse: "inverseAdminUsers",
  })
  declare adminUsers?: NonAttribute<User[]>

  // Scopes
  static establishScopes(): void {
    this.addSearchScope(["name", "acronym", "description"])

    this.addScope("excludeById", (idOrIds: number) => {
      const ids = arrayWrap(idOrIds)
      return {
        where: {
          id: {
            [Op.notIn]: ids,
          },
        },
      }
    })
  }
}

export default Group
