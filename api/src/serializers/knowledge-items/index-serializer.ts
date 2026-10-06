import { pick } from "lodash"

import { KnowledgeItem } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import ReferenceSerializer, { UserAsReference } from "@/serializers/users/reference-serializer"

export type KnowledgeItemIndexView = Pick<
  KnowledgeItem,
  "title" | "description" | "sharingPurpose" | "summary" | "securityLevel" | "status"
> & { user: UserAsReference | null; knowledgeItemFileCount?: number }

export class IndexSerializer extends BaseSerializer<KnowledgeItem> {
  perform(): KnowledgeItemIndexView {
    return {
      ...pick(this.record, [
        "id",
        "title",
        "description",
        "sharingPurpose",
        "summary",
        "securityLevel",
        "status",
      ]),
      user: this.record.user ? ReferenceSerializer.perform(this.record.user) : null,
      knowledgeItemFileCount: this.record.dataValues.knowledgeItemFileCount,
    }
  }
}

export default IndexSerializer
