import { type Attributes, type FindOptions, Op, sql } from "@sequelize/core"

import { type Path } from "@/utils/deep-pick"
import { ArchiveItem, User } from "@/models"
import { PolicyFactory } from "@/policies/base-policy"

// TODO: consider replacing direct "user" access with access control record
// created by archive item create service?
export class ArchiveItemsPolicy extends PolicyFactory(ArchiveItem) {
  show(): boolean {
    if (this.user.id === this.record.userId) return true
    if (this.record.hasAccessGrantFor(this.user.id)) return true

    return false
  }

  create(): boolean {
    return true
  }

  update(): boolean {
    if (this.user.id === this.record.userId) return true
    if (this.record.hasAdminAccessGrantFor(this.user.id)) return true

    return false
  }

  destroy(): boolean {
    if (this.user.id === this.record.userId) return true
    if (this.record.hasAdminAccessGrantFor(this.user.id)) return true

    return false
  }

  permittedAttributes(): Path[] {
    const attributes: (keyof Attributes<ArchiveItem>)[] = [
      "title",
      "description",
      "sharingPurpose",
      "confidentialityReceipt",
      "yukonFirstNations",
      "status",
      "securityLevel",
      "tags",
    ]

    return attributes
  }

  permittedAttributesForCreate(): Path[] {
    return [
      ...this.permittedAttributes(),
      {
        archiveItemCategoriesAttributes: ["categoryId"],
      },
      {
        archiveItemFilesAttributes: ["name", "path"],
      },
    ]
  }

  static policyScope(user: User): FindOptions<Attributes<ArchiveItem>> {
    const accessibleArchiveItemIds = sql`
      (
        SELECT
          archive_item_information_sharing_agreement_access_grants.archive_item_id
        FROM
          archive_item_information_sharing_agreement_access_grants
          INNER JOIN information_sharing_agreement_access_grants ON archive_item_information_sharing_agreement_access_grants.access_grant_id = information_sharing_agreement_access_grants.id
        WHERE
          information_sharing_agreement_access_grants.user_id = :userId
      )
    `
    return {
      where: {
        [Op.or]: [
          {
            userId: user.id,
          },
          {
            id: {
              [Op.in]: accessibleArchiveItemIds,
            },
          },
        ],
      },
      replacements: {
        userId: user.id,
      },
    }
  }
}

export default ArchiveItemsPolicy
