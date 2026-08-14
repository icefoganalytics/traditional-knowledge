import { isNil } from "lodash"

import { type Path } from "@/utils/deep-pick"
import { InformationSharingAgreement } from "@/models"
import { PolicyFactory } from "@/policies/base-policy"

/**
 * Shared rules for every non-draft state. Reading is deliberately broad and writing is
 * closed: once an agreement leaves draft it is a record, not a working document.
 */
export class GenericStatePolicy extends PolicyFactory(InformationSharingAgreement) {
  show(): boolean {
    if (this.user.id === this.record.creatorId) return true
    if (this.user.isSystemAdmin) return true
    // Every internal Yukon Government employee may read the agreement. This is metadata
    // only; the Knowledge Items shared under it remain restricted. See TK-24.
    if (!this.user.isExternal) return true
    if (this.isMemberOfExternalGroup()) return true

    return false
  }

  create(): boolean {
    throw new Error("Create is not dependent on state")
  }

  update(): boolean {
    return false
  }

  destroy(): boolean {
    return false
  }

  permittedAttributes(): Path[] {
    return []
  }

  protected isMemberOfExternalGroup(): boolean {
    const { externalGroupId } = this.record
    if (isNil(externalGroupId)) return false

    return this.user.isMemberOfGroup(externalGroupId)
  }
}

export default GenericStatePolicy
