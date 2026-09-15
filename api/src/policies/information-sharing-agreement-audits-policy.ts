import { Attributes, FindOptions } from "@sequelize/core"

import { Path } from "@/utils/deep-pick"
import { InformationSharingAgreementAudit, User } from "@/models"
import { ALL_RECORDS_SCOPE, PolicyFactory } from "@/policies/base-policy"

export class InformationSharingAgreementAuditsPolicy extends PolicyFactory(
  InformationSharingAgreementAudit
) {
  show(): boolean {
    if (this.user.isSystemAdmin) return true
    if (this.user.id === this.record.userId) return true

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
    return []
  }

  static policyScope(user: User): FindOptions<Attributes<InformationSharingAgreementAudit>> {
    if (user.isSystemAdmin) return ALL_RECORDS_SCOPE

    return {
      include: [
        {
          association: "informationSharingAgreement",
          where: {
            creatorId: user.id,
          },
        },
      ],
    }
  }
}

export default InformationSharingAgreementAuditsPolicy
