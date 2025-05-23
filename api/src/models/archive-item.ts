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
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"
import { isEmpty, isNil } from "lodash"

import BaseModel from "@/models/base-model"
import ArchiveItemFile from "@/models/archive-item-file"
import InformationSharingAgreementArchiveItem from "@/models/information-sharing-agreement-archive-item"
import User from "@/models/user"
import InformationSharingAgreementAccessGrant from "@/models/information-sharing-agreement-access-grant"
import ArchiveItemInformationSharingAgreementAccessGrant from "@/models/archive-item-information-sharing-agreement-access-grant"

/** Keep in sync with web/src/api/users-api.ts */
export enum SecurityLevel {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
}

export enum ArchiveItemStatus {
  ACCEPTED = "Accepted",
  REVIEWED = "Reviewed",
  LOCKED = "Locked",
  HIDDEN = "Hidden",
}

export class ArchiveItem extends BaseModel<
  InferAttributes<ArchiveItem>,
  InferCreationAttributes<ArchiveItem>
> {
  static readonly SecurityLevel = SecurityLevel
  static readonly ArchiveItemStatus = ArchiveItemStatus

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  declare isDecision: boolean

  @Attribute(DataTypes.STRING(255))
  declare decisionText: string | null

  @Attribute(DataTypes.INTEGER)
  declare userId: number | null

  @Attribute(DataTypes.STRING(2000))
  @NotNull
  declare title: string

  @Attribute(DataTypes.TEXT)
  declare description: string | null

  @Attribute(DataTypes.TEXT)
  declare summary: string | null

  @Attribute(DataTypes.STRING(100))
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(ArchiveItemStatus)],
      msg: `Status must be one of ${Object.values(ArchiveItemStatus).join(", ")}`,
    },
  })
  declare status: ArchiveItemStatus

  @Attribute(DataTypes.INTEGER)
  @NotNull
  @ValidateAttribute({
    isIn: {
      args: [Object.values(SecurityLevel)],
      msg: `Security Level must be one of ${Object.values(SecurityLevel).join(", ")}`,
    },
  })
  declare securityLevel: SecurityLevel

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
  declare archiveItemFileCount?: number

  // Associations
  @HasMany(() => ArchiveItemFile, {
    foreignKey: "archiveItemId",
    inverse: "archiveItem",
  })
  declare files?: NonAttribute<ArchiveItemFile[]>

  @BelongsTo(() => User, {
    foreignKey: "userId",
    inverse: {
      as: "createdArchiveItems",
      type: "hasMany",
    },
  })
  declare user?: NonAttribute<User>

  @HasMany(() => InformationSharingAgreementArchiveItem, {
    foreignKey: "archiveItemId",
    inverse: "archiveItem",
  })
  declare informationSharingAgreementArchiveItems?: NonAttribute<
    InformationSharingAgreementArchiveItem[]
  >

  @BelongsToMany(() => InformationSharingAgreementAccessGrant, {
    through: () => ArchiveItemInformationSharingAgreementAccessGrant,
    foreignKey: "archiveItemId",
    otherKey: "informationSharingAgreementAccessGrantId",
    inverse: "archiveItems",
  })
  declare informationSharingAgreementAccessGrants?: NonAttribute<
    InformationSharingAgreementAccessGrant[]
  >
  /**
   * Created by ArchiveItem.belongsToMany(InformationSharingAgreementAccessGrant), refers to a direct connection to a given InformationSharingAgreementAccessGrant
   * Populated by by { include: [{ association: "informationSharingAgreementAccessGrants", through: { attributes: [xxx] } }] }
   * See https://sequelize.org/docs/v7/querying/select-in-depth/#eager-loading-the-belongstomany-through-model
   */
  declare informationSharingAgreementAccessGrant?: NonAttribute<
    InformationSharingAgreementAccessGrant[]
  >

  // Scopes
  static establishScopes(): void {
    this.addSearchScope(["title", "description", "tags"])
    this.addScope("DecisionsOnly", { where: { isDecision: true } })
    this.addScope("ArchiveItemsOnly", { where: { isDecision: false } })
    this.addScope("ExpiringSoon", { where: { status: "Expiring Soon" } })

    const tableAlias = sql.literal(this.name)
    this.addScope("withArchiveItemFileCounts", {
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
            "archiveItemFileCount",
          ],
        ],
      },
    })
  }
}

export default ArchiveItem
