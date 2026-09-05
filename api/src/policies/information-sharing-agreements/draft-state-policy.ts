import { type Path } from "@/utils/deep-pick"

import GenericStatePolicy from "@/policies/information-sharing-agreements/generic-state-policy"

export class DraftStatePolicy extends GenericStatePolicy {
  show(): boolean {
    if (this.user.id === this.record.creatorId) return true

    return false
  }

  update(): boolean {
    if (this.user.id === this.record.creatorId) return true

    return false
  }

  destroy(): boolean {
    if (this.user.id === this.record.creatorId) return true

    return false
  }

  permittedAttributes(): Path[] {
    return [
      "externalGroupContactId",
      "internalGroupContactId",
      "internalGroupSecondaryContactId",
      "identifier",
      "externalGroupInfo",
      "internalGroupInfo",
      "externalGroupContactName",
      "internalGroupContactName",
      "externalGroupContactTitle",
      "internalGroupContactTitle",
      "title",
      "description",
      "purpose",
      "detailLevel",
      "detailNotes",
      "formats",
      "accessLevel",
      "accessLevelDepartmentRestriction",
      "accessLevelBranchRestriction",
      "accessLevelUnitRestriction",
      "hasAdditionalAccessRestrictions",
      "additionalAccessRestrictions",
      "confidentialityType",
      "authorizedApplication",
      "creditLines",
      "creditNotes",
      "expirationCondition",
      "expirationActions",
      "expirationNotes",
      "breachActions",
      "breachNotes",
      "disclosureNotes",
      "startDate",
      "endDate",
    ]
  }

  permittedAttributesForCreate(): Path[] {
    return [...this.permittedAttributes()]
  }
}

export default DraftStatePolicy
