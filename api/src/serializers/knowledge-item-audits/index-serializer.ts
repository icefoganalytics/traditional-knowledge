import { pick } from "lodash"

import { KnowledgeItemAudit } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import ReferenceSerializer, { UserAsReference } from "@/serializers/users/reference-serializer"

export type KnowledgeItemAuditIndexView = Pick<
  KnowledgeItemAudit,
  "id" | "knowledgeItemId" | "knowledgeItemFile" | "action" | "description" | "createdAt"
> & { user: UserAsReference | null }

export class IndexSerializer extends BaseSerializer<KnowledgeItemAudit> {
  perform(): KnowledgeItemAuditIndexView {
    return {
      ...pick(this.record, [
        "id",
        "knowledgeItemId",
        "knowledgeItemFileId",
        "action",
        "description",
        "createdAt",
      ]),
      user: this.record.user ? ReferenceSerializer.perform(this.record.user) : null,
    }
  }
}

export default IndexSerializer
