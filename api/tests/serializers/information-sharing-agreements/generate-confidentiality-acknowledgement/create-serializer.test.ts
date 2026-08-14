import { describe, test, expect } from "vitest"

import { InformationSharingAgreement } from "@/models"
import { informationSharingAgreementFactory } from "@/tests/factories"

import CreateSerializer from "@/serializers/information-sharing-agreements/generate-confidentiality-acknowledgement/create-serializer"

describe("api/src/serializers/information-sharing-agreements/generate-confidentiality-acknowledgement/create-serializer.ts", () => {
  describe("CreateSerializer", () => {
    describe("#perform", () => {
      // Regression test for TK-39: a draft with unset contacts used to throw a TypeError,
      // which produced a truncated, unopenable .docx download.
      test("when contact associations are null, serializes with placeholders instead of throwing", async () => {
        // Arrange
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          status: InformationSharingAgreement.Status.DRAFT,
          externalGroupContactId: null,
          internalGroupContactId: null,
          internalGroupSecondaryContactId: null,
        })
        const reloaded = await InformationSharingAgreement.findByPk(
          informationSharingAgreement.id,
          {
            include: [
              {
                association: "externalGroupContact",
                include: ["externalOrganization"],
              },
              "internalGroupContact",
              "internalGroupSecondaryContact",
            ],
          }
        )
        if (reloaded === null) {
          throw new Error("Expected information sharing agreement to be found")
        }

        // Act
        const result = new CreateSerializer(reloaded).perform()

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            "external_group_contact.external_organization.name": "Not specified",
            "external_group_contact.display_name": "Not specified",
            "external_group_contact.email": "",
            "internal_group_contact.display_name": "Not specified",
            "internal_group_contact.email": "",
            "internal_group_secondary_contact.name_and_title": "Not specified",
            "internal_group_secondary_contact.email": "",
          })
        )
      })

      // The optional sections are stored comma-joined and drive checkboxes in the
      // generated document. See TK-44.
      test("when optional sections are set, maps each selected option to its checkbox", async () => {
        // Arrange
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          status: InformationSharingAgreement.Status.DRAFT,
          detailLevel: "summary",
          detailNotes: "Confirm the summary before use",
          formats: "audio_or_video,photos",
          creditLines: "external_organization",
          creditNotes: "Credit the Nation by name",
          expirationActions: "send_removal_receipt",
          breachActions: "terminate_and_delete,notify_and_resolve",
          disclosureNotes: "Notify the Council first",
        })

        // Act
        const result = new CreateSerializer(informationSharingAgreement).perform()

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            "detail_level.is_summary": true,
            "detail_level.is_original": false,
            "detail_level.is_context_specific": false,
            detail_notes: "Confirm the summary before use",
            "formats.is_audio_or_video": true,
            "formats.is_photos": true,
            "formats.is_word_documents": false,
            "credit_lines.is_external_organization": true,
            "credit_lines.is_other": false,
            credit_notes: "Credit the Nation by name",
            "expiration_actions.is_send_removal_receipt": true,
            "expiration_actions.is_other": false,
            "breach_actions.is_terminate_and_delete": true,
            "breach_actions.is_notify_and_resolve": true,
            "breach_actions.is_communicate_amendments": false,
            breach_notes: "",
            disclosure_notes: "Notify the Council first",
          })
        )
      })
    })
  })
})
