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
  HasMany,
  NotNull,
  PrimaryKey,
} from "@sequelize/core/decorators-legacy"
import { isUndefined } from "lodash"

import BaseModel from "@/models/base-model"
import Group from "@/models/group"
import InformationSharingAgreementAccessGrant from "@/models/information-sharing-agreement-access-grant"
import InformationSharingAgreementArchiveItem from "@/models/information-sharing-agreement-archive-item"
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

  // Helper functions
  hasAccessGrantFor(userId: number): boolean {
    if (isUndefined(this.accessGrants)) {
      throw new Error("Expected accessGrants association to be pre-loaded.")
    }

    return this.accessGrants.some((accessGrant) => accessGrant.userId === userId)
  }

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

  @HasMany(() => InformationSharingAgreementAccessGrant, {
    foreignKey: "informationSharingAgreementId",
    inverse: "informationSharingAgreement",
  })
  declare accessGrants?: NonAttribute<InformationSharingAgreementAccessGrant[]>

  @HasMany(() => InformationSharingAgreementArchiveItem, {
    foreignKey: "informationSharingAgreementId",
    inverse: "informationSharingAgreement",
  })
  declare informationSharingAgreementArchiveItems?: NonAttribute<
    InformationSharingAgreementArchiveItem[]
  >

  // Scopes
  static establishScopes(): void {
    this.addSearchScope(["title", "description"])
  }
}

export default InformationSharingAgreement
