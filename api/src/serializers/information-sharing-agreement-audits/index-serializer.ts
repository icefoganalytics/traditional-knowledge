import { pick } from "lodash"

import { InformationSharingAgreementAudit } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import ReferenceSerializer, { UserAsReference } from "@/serializers/users/reference-serializer"

export type InformationSharingAgreementAuditIndexView = Pick<
  InformationSharingAgreementAudit,
  "id" | "informationSharingAgreementId" | "action" | "description" | "createdAt"
> & { user: UserAsReference | null }

export class IndexSerializer extends BaseSerializer<InformationSharingAgreementAudit> {
  perform(): InformationSharingAgreementAuditIndexView {
    return {
      ...pick(this.record, [
        "id",
        "informationSharingAgreementId",
        "action",
        "description",
        "createdAt",
      ]),
      user: this.record.user ? ReferenceSerializer.perform(this.record.user) : null,
    }
  }
}

export default IndexSerializer
