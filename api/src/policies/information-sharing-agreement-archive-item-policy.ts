import { type Attributes, type FindOptions } from "@sequelize/core"
import { isNil, isUndefined } from "lodash"

import { type Path } from "@/utils/deep-pick"
import { InformationSharingAgreementArchiveItem, User, type InformationSharingAgreement } from "@/models"
import { PolicyFactory } from "@/policies/base-policy"
import ArchiveItemsPolicy from "@/policies/archive-items-policy"
import InformationSharingAgreementPolicy from "@/policies/information-sharing-agreement-policy"

export class InformationSharingAgreementArchiveItemPolicy extends PolicyFactory(
  InformationSharingAgreementArchiveItem
) {
  show(): boolean {
    // Both halves must be readable. Seeing the agreement is not enough: that would
    // reveal which Knowledge Items are attached to it. See TK-24.
    if (!this.informationSharingAgreementPolicy.show()) return false

    return this.archiveItemsPolicy.show()
  }

  create(): boolean {
    if (this.user.id === this.informationSharingAgreement.creatorId) return true
    if (this.user.isSystemAdmin) return true
    if (this.isAdminOfInternalGroup()) return true
    if (this.isAdminOfExternalGroup()) return true

    return false
  }

  update(): boolean {
    if (this.user.id === this.informationSharingAgreement.creatorId) return true
    if (this.user.isSystemAdmin) return true
    if (this.isAdminOfInternalGroup()) return true
    if (this.isAdminOfExternalGroup()) return true

    return false
  }

  destroy(): boolean {
    if (this.user.id === this.informationSharingAgreement.creatorId) return true
    if (this.user.isSystemAdmin) return true
    if (this.isAdminOfInternalGroup()) return true
    if (this.isAdminOfExternalGroup()) return true

    return false
  }

  permittedAttributes(): Path[] {
    return []
  }

  permittedAttributesForCreate(): Path[] {
    return ["informationSharingAgreementId", "archiveItemId", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<InformationSharingAgreementArchiveItem>> {
    // Intersects both scopes. Scoping on the agreement alone would list every Knowledge
    // Item attached to every agreement an internal user can see. See TK-24.
    return {
      include: [
        {
          association: "informationSharingAgreement",
          attributes: ["id"],
          ...InformationSharingAgreementPolicy.policyScope(user),
          required: true,
        },
        {
          association: "archiveItem",
          attributes: ["id"],
          ...ArchiveItemsPolicy.policyScope(user),
          required: true,
        },
      ],
    }
  }

  private get archiveItemsPolicy(): ArchiveItemsPolicy {
    const { archiveItem } = this.record
    if (isUndefined(archiveItem)) {
      throw new Error("Expected archive item association to be pre-loaded")
    }

    return new ArchiveItemsPolicy(this.user, archiveItem)
  }

  private get informationSharingAgreementPolicy(): InformationSharingAgreementPolicy {
    const { informationSharingAgreement } = this.record
    if (isUndefined(informationSharingAgreement)) {
      throw new Error("Expected information sharing agreement association to be pre-loaded")
    }

    return new InformationSharingAgreementPolicy(this.user, informationSharingAgreement)
  }

  private isAdminOfInternalGroup(): boolean {
    const { internalGroupId } = this.informationSharingAgreement
    if (isNil(internalGroupId)) return false

    return this.user.isGroupAdminOf(internalGroupId)
  }

  private isAdminOfExternalGroup(): boolean {
    const { externalGroupId } = this.informationSharingAgreement
    if (isNil(externalGroupId)) return false

    return this.user.isGroupAdminOf(externalGroupId)
  }

  private get informationSharingAgreement(): InformationSharingAgreement {
    const { informationSharingAgreement } = this.record
    if (isUndefined(informationSharingAgreement)) {
      throw new Error("Expected information sharing agreement association to be pre-loaded")
    }

    return informationSharingAgreement
  }
}

export default InformationSharingAgreementArchiveItemPolicy
