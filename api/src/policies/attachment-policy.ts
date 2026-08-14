import { type Attributes, type FindOptions } from "@sequelize/core"
import { isNil, isUndefined } from "lodash"

import { type Path } from "@/utils/deep-pick"
import { Attachment, User } from "@/models"
import { AttachmentTargetTypes } from "@/models/attachment"
import { PolicyFactory } from "@/policies/base-policy"
import InformationSharingAgreementPolicy from "@/policies/information-sharing-agreement-policy"

/**
 * Attachments are polymorphic, but only agreements carry them today, so access defers
 * entirely to the owning agreement: whoever may read it may read its attachments, and
 * whoever may change it may remove them. See TK-6.
 */
export class AttachmentPolicy extends PolicyFactory(Attachment) {
  show(): boolean {
    const policy = this.informationSharingAgreementPolicy
    if (isNil(policy)) return false

    return policy.show()
  }

  create(): boolean {
    const policy = this.informationSharingAgreementPolicy
    if (isNil(policy)) return false

    return policy.update()
  }

  update(): boolean {
    return this.create()
  }

  destroy(): boolean {
    return this.create()
  }

  permittedAttributes(): Path[] {
    return []
  }

  permittedAttributesForCreate(): Path[] {
    return ["targetId", "targetType", "associationName", "name", ...this.permittedAttributes()]
  }

  static policyScope(user: User): FindOptions<Attributes<Attachment>> {
    return {
      where: {
        targetType: AttachmentTargetTypes.InformationSharingAgreement,
      },
      include: [
        {
          association: "informationSharingAgreement",
          attributes: ["id"],
          ...InformationSharingAgreementPolicy.policyScope(user),
          required: true,
        },
      ],
    }
  }

  private get informationSharingAgreementPolicy(): InformationSharingAgreementPolicy | null {
    if (this.record.targetType !== AttachmentTargetTypes.InformationSharingAgreement) {
      return null
    }

    const { informationSharingAgreement } = this.record
    if (isUndefined(informationSharingAgreement)) {
      throw new Error("Expected information sharing agreement association to be pre-loaded")
    }
    if (isNil(informationSharingAgreement)) return null

    return new InformationSharingAgreementPolicy(this.user, informationSharingAgreement)
  }
}

export default AttachmentPolicy
