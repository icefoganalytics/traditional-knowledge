import { type Attributes, type FindOptions } from "@sequelize/core"
import { isUndefined } from "lodash"

import { type Path } from "@/utils/deep-pick"
import { InformationSharingAgreementArchiveItem, User } from "@/models"
import { PolicyFactory } from "@/policies/base-policy"
import InformationSharingAgreementPolicy from "@/policies/information-sharing-agreement-policy"

export class InformationSharingAgreementArchiveItemPolicy extends PolicyFactory(
  InformationSharingAgreementArchiveItem
) {
  show(): boolean {
    if (this.informationSharingAgreementPolicy.show()) return true

    return false
  }

  create(): boolean {
    if (this.informationSharingAgreementPolicy.update()) return true

    return false
  }

  update(): boolean {
    if (this.informationSharingAgreementPolicy.update()) return true

    return false
  }

  destroy(): boolean {
    if (this.informationSharingAgreementPolicy.update()) return true

    return false
  }

  permittedAttributes(): Path[] {
    return []
  }

  permittedAttributesForCreate(): Path[] {
    return ["informationSharingAgreementId", "archiveItemId", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<InformationSharingAgreementArchiveItem>> {
    return {
      include: [
        {
          association: "informationSharingAgreement",
          attributes: ["id"],
          include: [
            {
              association: "accessGrants",
              attributes: [],
              where: {
                userId: user.id,
              },
            },
          ],
          required: true,
        },
      ],
    }
  }

  private get informationSharingAgreementPolicy(): InformationSharingAgreementPolicy {
    const { informationSharingAgreement } = this.record
    if (isUndefined(informationSharingAgreement)) {
      throw new Error("Expected information sharing agreement association to be pre-loaded")
    }

    return new InformationSharingAgreementPolicy(this.user, informationSharingAgreement)
  }
}

export default InformationSharingAgreementArchiveItemPolicy
