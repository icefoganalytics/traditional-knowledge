import { type Attributes, type FindOptions } from "@sequelize/core"

import { type Path } from "@/utils/deep-pick"
import { InformationSharingAgreement, User } from "@/models"
import { ALL_RECORDS_SCOPE, PolicyFactory } from "@/policies/base-policy"

export class InformationSharingAgreementPolicy extends PolicyFactory(InformationSharingAgreement) {
  show(): boolean {
    if (this.user.isSystemAdmin) return true
    if (this.record.creatorId === this.user.id) return true
    if (this.record.sharingGroupContactId === this.user.id) return true
    if (this.record.receivingGroupContactId === this.user.id) return true

    // TODO: Allow users to view agreements that they have an associated information sharing agreement access grant for.

    return false
  }

  create(): boolean {
    if (this.user.isSystemAdmin) return true
    if (this.user.isGroupAdminOf(this.record.sharingGroupId)) return true
    // TODO: Add ability for non-host group admin to create information sharing agreements.

    return false
  }

  update(): boolean {
    if (this.user.isSystemAdmin) return true
    if (this.record.creatorId === this.user.id) return true
    if (this.record.sharingGroupContactId === this.user.id) return true
    // TODO: Add ability for non-host group admin to update information sharing agreements.

    return false
  }

  destroy(): boolean {
    if (this.user.isSystemAdmin) return true
    if (this.record.creatorId === this.user.id) return true
    if (this.record.sharingGroupContactId === this.user.id) return true
    // TODO: Add ability for non-host group admin to destroy information sharing agreements.

    return false
  }

  permittedAttributes(): Path[] {
    return [
      "sharingGroupContactId",
      "receivingGroupContactId",
      "title",
      "description",
      "startDate",
      "endDate",
    ]
  }

  permittedAttributesForCreate(): Path[] {
    return ["sharingGroupId", "receivingGroupId", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<InformationSharingAgreement>> {
    if (user.isSystemAdmin) {
      return ALL_RECORDS_SCOPE
    }

    // TODO: Allow users to view agreements that they have an associated information sharing agreement access grant for.
    return {
      where: {
        creatorId: user.id,
        sharingGroupContactId: user.id,
        receivingGroupContactId: user.id,
      },
    }
  }
}

export default InformationSharingAgreementPolicy
