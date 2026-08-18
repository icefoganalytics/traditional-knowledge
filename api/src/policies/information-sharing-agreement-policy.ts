import { type Attributes, type FindOptions, Op } from "@sequelize/core"

import { type Path } from "@/utils/deep-pick"

import Queries from "@/queries"

import { InformationSharingAgreement, User } from "@/models"
import { BasePolicy, PolicyFactory } from "@/policies/base-policy"
import {
  DraftStatePolicy,
  GenericStatePolicy,
  SignedStatePolicy,
} from "@/policies/information-sharing-agreements"

export class InformationSharingAgreementPolicy extends PolicyFactory(InformationSharingAgreement) {
  show(): boolean {
    return this.policyByState.show()
  }

  create(): boolean {
    return true
  }

  update(): boolean {
    return this.policyByState.update()
  }

  destroy(): boolean {
    return this.policyByState.destroy()
  }

  permittedAttributes(): Path[] {
    return this.policyByState.permittedAttributes()
  }

  permittedAttributesForCreate(): Path[] {
    return this.policyByState.permittedAttributesForCreate()
  }

  static policyScope(user: User): FindOptions<Attributes<InformationSharingAgreement>> {
    if (user.isExternal) {
      const accessibleIdsQueryForExternalUser =
        Queries.InformationSharingAgreements.buildAccessibleInformationSharingAgreementIdsForExternalUserQuery()
      return {
        where: {
          id: {
            [Op.in]: accessibleIdsQueryForExternalUser,
          },
        },
        replacements: {
          userId: user.id,
        },
      }
    }

    // Every internal Yukon Government employee can see every agreement that is no
    // longer a draft, plus their own drafts. This exposes the agreement metadata only;
    // the Knowledge Items shared under it stay restricted to those with an access
    // grant, enforced by ArchiveItemsPolicy. See TK-24.
    return {
      where: {
        [Op.or]: [
          {
            status: InformationSharingAgreement.Status.DRAFT,
            creatorId: user.id,
          },
          {
            status: {
              [Op.ne]: InformationSharingAgreement.Status.DRAFT,
            },
          },
        ],
      },
    }
  }

  protected get policyByState(): BasePolicy<InformationSharingAgreement> {
    switch (this.record.status) {
      case InformationSharingAgreement.Status.DRAFT:
        return new DraftStatePolicy(this.user, this.record)
      case InformationSharingAgreement.Status.SIGNED:
        return new SignedStatePolicy(this.user, this.record)
      default:
        return new GenericStatePolicy(this.user, this.record)
    }
  }
}

export default InformationSharingAgreementPolicy
