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
  Default,
  HasMany,
  HasOne,
  NotNull,
  PrimaryKey,
  Table,
  ValidateAttribute,
} from "@sequelize/core/decorators-legacy"
import { isUndefined } from "lodash"

import Attachment, { AttachmentTargetTypes } from "@/models/attachment"
import BaseModel from "@/models/base-model"
import Group from "@/models/group"
import InformationSharingAgreementAccessGrant from "@/models/information-sharing-agreement-access-grant"
import InformationSharingAgreementArchiveItem from "@/models/information-sharing-agreement-archive-item"
import User from "@/models/user"

export enum InformationSharingAgreementAccessLevels {
  INTERNAL = "internal",
  PROTECTED_AND_LIMITED = "protected_and_limited",
  CONFIDENTIAL_AND_RESTRICTED = "confidential_and_restricted",
}

export enum InformationSharingAgreementExpirationConditions {
  COMPLETION_OF_PURPOSE = "completion_of_purpose",
  EXPIRATION_DATE = "expiration_date",
  UNDETERMINED_WITH_DEFAULT_EXPIRATION = "undetermined_with_default_expiration",
}

export enum InformationSharingAgreementConfidentialityType {
  ACCORDANCE = "ACCORDANCE",
  ACCEPTED_IN_CONFIDENCE = "ACCEPTED_IN_CONFIDENCE",
}

export enum InformationSharingAgreementStatuses {
  DRAFT = "draft",
  SIGNED = "signed",
  CLOSED = "closed",
}

@Table({
  tableName: "information_sharing_agreements",
})
export class InformationSharingAgreement extends BaseModel<
  InferAttributes<InformationSharingAgreement>,
  InferCreationAttributes<InformationSharingAgreement>
> {
  static readonly AccessLevels = InformationSharingAgreementAccessLevels
  static readonly ExpirationConditions = InformationSharingAgreementExpirationConditions
  static readonly ConfidentialityTypes = InformationSharingAgreementConfidentialityType
  static readonly Status = InformationSharingAgreementStatuses

  @Attribute(DataTypes.INTEGER)
  @PrimaryKey
  @AutoIncrement
  declare id: CreationOptional<number>

  @Attribute(DataTypes.INTEGER)
  @NotNull
  declare creatorId: number

  @Attribute(DataTypes.INTEGER)
  declare externalGroupId: number | null

  @Attribute(DataTypes.INTEGER)
  declare externalGroupContactId: number | null

  @Attribute(DataTypes.INTEGER)
  declare internalGroupId: number | null

  @Attribute(DataTypes.INTEGER)
  declare internalGroupContactId: number | null

  @Attribute(DataTypes.INTEGER)
  declare internalGroupSecondaryContactId: number | null

  @Attribute(DataTypes.STRING)
  @NotNull
  @Default("draft")
  declare status: CreationOptional<InformationSharingAgreementStatuses>

  @Attribute(DataTypes.BOOLEAN)
  @NotNull
  @Default(false)
  declare auditEnabled: CreationOptional<boolean>

  @Attribute(DataTypes.STRING(100))
  declare identifier: string | null

  @Attribute(DataTypes.TEXT)
  declare externalGroupInfo: string | null

  @Attribute(DataTypes.TEXT)
  declare internalGroupInfo: string | null

  @Attribute(DataTypes.STRING)
  declare externalGroupContactName: string | null

  @Attribute(DataTypes.STRING)
  declare internalGroupContactName: string | null

  @Attribute(DataTypes.STRING)
  declare externalGroupContactTitle: string | null

  @Attribute(DataTypes.STRING)
  declare internalGroupContactTitle: string | null

  @Attribute(DataTypes.INTEGER)
  declare signedById: number | null

  @Attribute(DataTypes.DATE(0))
  declare signedAt: Date | null

  @Attribute(DataTypes.STRING)
  @NotNull
  declare title: string

  @Attribute(DataTypes.TEXT)
  declare description: string | null

  @Attribute(DataTypes.TEXT)
  declare purpose: string | null

  @Attribute(DataTypes.STRING(250))
  declare detailLevel: string | null

  @Attribute(DataTypes.TEXT)
  declare detailNotes: string | null

  @Attribute(DataTypes.STRING(500))
  declare formats: string | null

  @Attribute(DataTypes.STRING(500))
  @ValidateAttribute({
    isIn: {
      args: [[...Object.values(InformationSharingAgreementAccessLevels), null]],
      msg: `Access level must be one of ${[...Object.values(InformationSharingAgreementAccessLevels), null].join(", ")}`,
    },
  })
  declare accessLevel: InformationSharingAgreementAccessLevels | null

  @Attribute(DataTypes.STRING)
  declare accessLevelDepartmentRestriction: string | null

  @Attribute(DataTypes.STRING)
  declare accessLevelBranchRestriction: string | null

  @Attribute(DataTypes.STRING)
  declare accessLevelUnitRestriction: string | null

  @Attribute(DataTypes.BOOLEAN)
  declare hasAdditionalAccessRestrictions: boolean | null

  @Attribute(DataTypes.TEXT)
  declare additionalAccessRestrictions: string | null

  @Attribute(DataTypes.STRING(500))
  declare confidentialityType: InformationSharingAgreementConfidentialityType | null

  @Attribute(DataTypes.TEXT)
  declare authorizedApplication: string | null

  @Attribute(DataTypes.STRING(500))
  declare creditLines: string | null

  @Attribute(DataTypes.TEXT)
  declare creditNotes: string | null

  @Attribute(DataTypes.STRING(500))
  declare expirationActions: string | null

  @Attribute(DataTypes.TEXT)
  declare expirationNotes: string | null

  @Attribute(DataTypes.STRING(500))
  declare breachActions: string | null

  @Attribute(DataTypes.TEXT)
  declare breachNotes: string | null

  @Attribute(DataTypes.TEXT)
  declare disclosureNotes: string | null

  @Attribute(DataTypes.DATE)
  declare startDate: Date | null

  @Attribute(DataTypes.DATE)
  declare endDate: Date | null

  @Attribute(DataTypes.STRING(50))
  @ValidateAttribute({
    isIn: {
      args: [[...Object.values(InformationSharingAgreementExpirationConditions), null]],
      msg: `Expiration condition must be one of ${[...Object.values(InformationSharingAgreementExpirationConditions), null].join(", ")}`,
    },
  })
  declare expirationCondition: InformationSharingAgreementExpirationConditions | null

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

  isDraft(): boolean {
    return this.status === InformationSharingAgreement.Status.DRAFT
  }

  isSigned(): boolean {
    return this.status === InformationSharingAgreement.Status.SIGNED
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
    foreignKey: "externalGroupId",
    inverse: {
      as: "externalInformationAgreements",
      type: "hasMany",
    },
  })
  declare externalGroup?: NonAttribute<Group>

  @BelongsTo(() => User, {
    foreignKey: "externalGroupContactId",
    inverse: {
      as: "externalInformationAgreementAsContact",
      type: "hasMany",
    },
  })
  declare externalGroupContact?: NonAttribute<User>

  @BelongsTo(() => Group, {
    foreignKey: "internalGroupId",
    inverse: {
      as: "internalInformationAgreements",
      type: "hasMany",
    },
  })
  declare internalGroup?: NonAttribute<Group>

  @BelongsTo(() => User, {
    foreignKey: "internalGroupContactId",
    inverse: {
      as: "internalInformationAgreementAsContact",
      type: "hasMany",
    },
  })
  declare internalGroupContact?: NonAttribute<User>

  @BelongsTo(() => User, {
    foreignKey: "internalGroupSecondaryContactId",
    inverse: {
      as: "internalInformationAgreementAsSecondaryContact",
      type: "hasMany",
    },
  })
  declare internalGroupSecondaryContact?: NonAttribute<User>

  @BelongsTo(() => User, {
    foreignKey: "signedById",
    inverse: {
      as: "signedInformationSharingAgreements",
      type: "hasMany",
    },
  })
  declare signedBy?: NonAttribute<User>

  @HasOne(() => Attachment, {
    foreignKey: {
      name: "targetId",
      allowNull: true,
    },
    foreignKeyConstraints: false,
    inverse: "informationSharingAgreement",
    scope: {
      targetType: AttachmentTargetTypes.InformationSharingAgreement,
      associationName: "signedConfidentialityAcknowledgement",
    },
  })
  declare signedConfidentialityAcknowledgement?: NonAttribute<Attachment | null>

  @HasOne(() => Attachment, {
    foreignKey: {
      name: "targetId",
      allowNull: true,
    },
    foreignKeyConstraints: false,
    inverse: "informationSharingAgreement",
    scope: {
      targetType: AttachmentTargetTypes.InformationSharingAgreement,
      associationName: "signedConfidentialityReceipt",
    },
  })
  declare signedConfidentialityReceipt?: NonAttribute<Attachment | null>

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

    this.addScope("notAssociatedWithArchiveItem", (archiveItemId: number) => {
      return {
        where: {
          id: {
            [Op.notIn]: sql`
              (
                SELECT
                  information_sharing_agreement_id
                FROM
                  information_sharing_agreement_archive_items
                WHERE
                  archive_item_id = :archiveItemId
                  AND deleted_at IS NULL
              )
            `,
          },
        },
        replacements: {
          archiveItemId,
        },
      }
    })

    this.addScope("notLinkedToAnyArchiveItem", () => {
      return {
        where: {
          [Op.and]: sql`
            NOT EXISTS (
              SELECT
                1
              FROM
                information_sharing_agreement_archive_items
              WHERE
                information_sharing_agreement_archive_items.information_sharing_agreement_id = ${sql.attribute(
                  "id"
                )}
                AND information_sharing_agreement_archive_items.deleted_at IS NULL
            )
          `,
        },
      }
    })
  }
}

export default InformationSharingAgreement
