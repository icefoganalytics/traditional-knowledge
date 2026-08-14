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
    // The view already exposes user_id and filters out soft-deleted grants and links,
    // so no join back to information_sharing_agreement_access_grants is needed.
    //
    // The user id is interpolated rather than passed via `replacements` so this scope
    // stays self-contained: replacements are not honoured when a scope is spread into
    // an `include`, as InformationSharingAgreementArchiveItemPolicy does. See TK-24.
    const accessibleArchiveItemIds = sql`
      (
        SELECT
          archive_item_information_sharing_agreement_access_grants.archive_item_id
        FROM
          archive_item_information_sharing_agreement_access_grants
        WHERE
          archive_item_information_sharing_agreement_access_grants.user_id = ${user.id}
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
    }
  }
}

export default ArchiveItemsPolicy
