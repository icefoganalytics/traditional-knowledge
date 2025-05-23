import { pick } from "lodash"

import { InformationSharingAgreementArchiveItem } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type ArchiveItemShowView = Pick<
  InformationSharingAgreementArchiveItem,
  "id" | "informationSharingAgreementId" | "archiveItemId" | "creatorId" | "createdAt" | "updatedAt"
>

export class ShowSerializer extends BaseSerializer<InformationSharingAgreementArchiveItem> {
  perform(): ArchiveItemShowView {
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

export default ShowSerializer
