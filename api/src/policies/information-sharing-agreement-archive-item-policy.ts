import { type Attributes, type FindOptions } from "@sequelize/core"

import { type Path } from "@/utils/deep-pick"
import { InformationSharingAgreementArchiveItem, User } from "@/models"
import { NO_RECORDS_SCOPE, PolicyFactory } from "@/policies/base-policy"

export class InformationSharingAgreementArchiveItemPolicy extends PolicyFactory(
  InformationSharingAgreementArchiveItem
) {
  show(): boolean {
    return false
  }

  create(): boolean {
    return false
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

  permittedAttributesForCreate(): Path[] {
    return ["informationSharingAgreementId", "archiveItemId", ...this.permittedAttributes()]
  }

  static policyScope(_user: User): FindOptions<Attributes<InformationSharingAgreementArchiveItem>> {
    return NO_RECORDS_SCOPE
  }
}

export default InformationSharingAgreementArchiveItemPolicy
