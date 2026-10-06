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
  BelongsToMany,
  Default,
  HasMany,
  NotNull,
  PrimaryKey,
  Table,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"
import { isEmpty, isNil, isUndefined } from "lodash"

import BaseModel from "@/models/base-model"
import KnowledgeItemFile from "@/models/knowledge-item-file"
import InformationSharingAgreementKnowledgeItem from "@/models/information-sharing-agreement-knowledge-item"
import User from "@/models/user"
import InformationSharingAgreementAccessGrant from "@/models/information-sharing-agreement-access-grant"
import KnowledgeItemInformationSharingAgreementAccessGrant from "@/models/knowledge-item-information-sharing-agreement-access-grant"
import Category from "@/models/category"
import KnowledgeItemCategory from "@/models/knowledge-item-category"

/** Keep in sync with web/src/api/users-api.ts */
export enum SecurityLevels {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

export enum KnowledgeItemStatuses {
  ACCEPTED = "Accepted",
  REVIEWED = "Reviewed",
  LOCKED = "Locked",
  HIDDEN = "Hidden",
}

// TODO: remove tableName/ColumnName pins once the archive_* tables are renamed to knowledge_*.
@Table({
  tableName: "archive_items",
})
export class KnowledgeItem extends BaseModel<
  InferAttributes<KnowledgeItem>,
  InferCreationAttributes<KnowledgeItem>
> {
  static readonly Levels = SecurityLevels
  static readonly Statuses = KnowledgeItemStatuses

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  declare isDecision: boolean

  @Attribute(DataTypes.STRING(255))
  declare decisionText: string | null

  // TODO: rename this to "creatorId" and make it required
  @Attribute(DataTypes.INTEGER)
  declare userId: number | null

  @Attribute(DataTypes.STRING(2000))
  @NotNull
  declare title: string

  @Attribute(DataTypes.STRING(2000))
  declare sharingPurpose: string | null

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  declare confidentialityReceipt: boolean

  @Attribute(DataTypes.TEXT)
  declare description: string | null

  @Attribute(DataTypes.TEXT)
  declare summary: string | null

  @Attribute(DataTypes.STRING(100))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(KnowledgeItemStatuses)],
      msg: `Status must be one of ${Object.values(KnowledgeItemStatuses).join(", ")}`,
    },
  })
  declare status: KnowledgeItemStatuses

  @Attribute(DataTypes.INTEGER)
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(SecurityLevels)],
      msg: `Security Level must be one of ${Object.values(SecurityLevels).join(", ")}`,
    },
  })
  declare securityLevel: SecurityLevels

  @Attribute({
    type: DataTypes.STRING(255),
    get(): string[] | null {
      const yukonFirstNations = this.getDataValue("yukonFirstNations")
      if (isNil(yukonFirstNations) || isEmpty(yukonFirstNations)) {
        return []
      }
      return yukonFirstNations.split(",")
    },
    set(value: string[] | null) {
      if (value === null) {
        this.setDataValue("yukonFirstNations", null)
        return
      }
      const values = value.join(",")
      this.setDataValue("yukonFirstNations", values)
    },
  })
  declare yukonFirstNations: string[] | null

  @Attribute({
    type: DataTypes.STRING(255),
    get(): string[] | null {
      const tags = this.getDataValue("tags")
      if (isNil(tags) || isEmpty(tags)) {
        return []
      }
      return tags.split(",")
    },
    set(value: string[] | null) {
      if (value === null) {
        this.setDataValue("tags", null)
        return
      }
      const values = value.join(",")
      this.setDataValue("tags", values)
    },
  })
  declare tags: string[] | null

  @Attribute(DataTypes.DATE(0))
  @NotNull
  @Default(sql.fn("getutcdate"))
  declare submittedAt: CreationOptional<Date>

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
  declare knowledgeItemFileCount?: number

  // Helper functions
  hasAccessGrantFor(userId: number): boolean {
    if (isUndefined(this.accessGrants)) {
      throw new Error("Expected accessGrants association to be pre-loaded.")
    }

    return this.accessGrants.some((accessGrant) => accessGrant.userId === userId)
  }

  hasAdminAccessGrantFor(userId: number): boolean {
    if (isUndefined(this.accessGrants)) {
      throw new Error("Expected accessGrants association to be pre-loaded.")
    }

    return this.accessGrants.some(
      (accessGrant) =>
        accessGrant.userId === userId &&
        accessGrant.accessLevel === InformationSharingAgreementAccessGrant.AccessLevels.ADMIN
    )
  }

  // Associations
  @HasMany(() => KnowledgeItemFile, {
    foreignKey: "knowledgeItemId",
    inverse: "knowledgeItem",
  })
  declare files?: NonAttribute<KnowledgeItemFile[]>

  @BelongsTo(() => User, {
    foreignKey: "userId",
    inverse: {
      as: "createdKnowledgeItems",
      type: "hasMany",
    },
  })
  declare user?: NonAttribute<User>

  @BelongsToMany(() => Category, {
    through: () => KnowledgeItemCategory,
    foreignKey: "knowledgeItemId",
    otherKey: "categoryId",
    throughAssociations: {
      fromSource: "knowledgeItemCategories",
      toSource: "knowledgeItem",
      fromTarget: "knowledgeItemCategories",
      toTarget: "category",
    },
  })
  declare categories?: NonAttribute<Category[]>

  @HasMany(() => InformationSharingAgreementKnowledgeItem, {
    foreignKey: "knowledgeItemId",
    inverse: "knowledgeItem",
  })
  declare informationSharingAgreementKnowledgeItems?: NonAttribute<
    InformationSharingAgreementKnowledgeItem[]
  >

  @BelongsToMany(() => InformationSharingAgreementAccessGrant, {
    through: () => KnowledgeItemInformationSharingAgreementAccessGrant,
    foreignKey: "knowledgeItemId",
    otherKey: "accessGrantId",
    inverse: "knowledgeItems",
    throughAssociations: {
      fromSource: "knowledgeItemAccessGrants",
      toSource: "knowledgeItem",
      fromTarget: "knowledgeItemAccessGrants",
      toTarget: "informationSharingAgreementAccessGrant",
    },
  })
  declare accessGrants?: NonAttribute<InformationSharingAgreementAccessGrant[]>
  /**
   * Created by KnowledgeItem.belongsToMany(InformationSharingAgreementAccessGrant), refers to a direct connection to a given InformationSharingAgreementAccessGrant
   * Populated by by { include: [{ association: "informationSharingAgreementAccessGrants", through: { attributes: [xxx] } }] }
   * See https://sequelize.org/docs/v7/querying/select-in-depth/#eager-loading-the-belongstomany-through-model
   */
  declare accessGrant?: NonAttribute<InformationSharingAgreementAccessGrant[]>

  // Scopes
  static establishScopes(): void {
    this.addSearchScope(["title", "description", "tags"])
    this.addScope("DecisionsOnly", { where: { isDecision: true } })
    this.addScope("KnowledgeItemsOnly", { where: { isDecision: false } })
    this.addScope("ExpiringSoon", { where: { status: "Expiring Soon" } })

    const tableAlias = sql.literal(this.name)
    this.addScope("withKnowledgeItemFileCounts", {
      attributes: {
        include: [
          [
            sql`
              (
                SELECT
                  COUNT(*)
                FROM
                  archive_item_files
                WHERE
                  archive_item_files.archive_item_id = ${tableAlias}.id
                  AND archive_item_files.deleted_at IS NULL
              )
            `,
            "knowledgeItemFileCount",
          ],
        ],
      },
    })
  }
}

export default KnowledgeItem
