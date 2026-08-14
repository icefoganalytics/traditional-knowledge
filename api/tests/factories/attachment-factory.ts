import { faker } from "@faker-js/faker"
import { createHash } from "node:crypto"
import { Factory } from "fishery"

import { Attachment } from "@/models"
import { AttachmentTargetTypes } from "@/models/attachment"

export const attachmentFactory = Factory.define<Attachment>(({ sequence, onCreate }) => {
  onCreate(async (attachment) => {
    try {
      await attachment.save()
      return attachment
    } catch (error) {
      console.error(error)
      throw new Error(
        `Could not create Attachment with attributes: ${JSON.stringify(attachment.dataValues, null, 2)}`
      )
    }
  })

  const content = Buffer.from(faker.lorem.sentence())

  return Attachment.build({
    targetId: 0,
    targetType: AttachmentTargetTypes.InformationSharingAgreement,
    associationName: "signedConfidentialityAcknowledgement",
    name: `attachment-${sequence}.docx`,
    size: content.length,
    content,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    sha256Checksum: createHash("sha256").update(content).digest("hex"),
  })
})

export default attachmentFactory
