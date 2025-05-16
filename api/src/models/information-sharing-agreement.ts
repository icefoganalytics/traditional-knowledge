import {
  DataTypes,
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
  Default,
  NotNull,
  PrimaryKey,
} from "@sequelize/core/decorators-legacy"

import BaseModel from "@/models/base-model"
import Group from "@/models/group"
import User from "@/models/user"

export class InformationSharingAgreement extends BaseModel<
  InferAttributes<InformationSharingAgreement>,
  InferCreationAttributes<InformationSharingAgreement>
> {
  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare creatorId: number

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare sharingGroupId: number

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare sharingGroupContactId: number

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare receivingGroupId: number

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare receivingGroupContactId: number

  @Attribute(DataTypes.STRING)
  @NotNull
  declare title: string

  @Attribute(DataTypes.TEXT)
  declare description: string | null

  @Attribute(DataTypes.DATE)
  @NotNull
  declare startDate: Date

  @Attribute(DataTypes.DATE)
  @NotNull
  declare endDate: Date

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
      as: "createdInformationSharingAgreements",
      type: "hasMany",
    },
  })
  declare creator?: NonAttribute<User>

  @BelongsTo(() => Group, {
    foreignKey: "sharingGroupId",
    inverse: {
      as: "sharedInformationAgreements",
      type: "hasMany",
    },
  })
  declare sharingGroup?: NonAttribute<Group>

  @BelongsTo(() => User, {
    foreignKey: "sharingGroupContactId",
    inverse: {
      as: "sharedInformationAgreementAsContact",
      type: "hasMany",
    },
  })
  declare sharingGroupContact?: NonAttribute<User>

  @BelongsTo(() => Group, {
    foreignKey: "receivingGroupId",
    inverse: {
      as: "receivedInformationAgreements",
      type: "hasMany",
    },
  })
  declare receivingGroup?: NonAttribute<Group>

  @BelongsTo(() => User, {
    foreignKey: "receivingGroupContactId",
    inverse: {
      as: "receivedInformationAgreementAsContact",
      type: "hasMany",
    },
  })
  declare receivingGroupContact?: NonAttribute<User>

  // Scopes
  static establishScopes(): void {
    // add as needed
  }
}

export default InformationSharingAgreement
