import { pick } from "lodash"

import { InformationSharingAgreementArchiveItem } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type ArchiveItemIndexView = Pick<
  InformationSharingAgreementArchiveItem,
  "id" | "informationSharingAgreementId" | "archiveItemId" | "creatorId" | "createdAt" | "updatedAt"
>

export class IndexSerializer extends BaseSerializer<InformationSharingAgreementArchiveItem> {
  perform(): ArchiveItemIndexView {
    return {
      ...pick(this.record, [
        "id",
        "informationSharingAgreementId",
        "archiveItemId",
        "creatorId",
        "createdAt",
        "updatedAt",
      ]),
    }
  }
}

export default IndexSerializer
