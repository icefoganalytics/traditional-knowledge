import { InformationSharingAgreement, InformationSharingAgreementAudit } from "@/models"

import { informationSharingAgreementFactory, userFactory } from "@/tests/factories"

import SignService from "@/services/information-sharing-agreements/sign-service"

// Signing upserts confidentiality documents and provisions groups; those collaborators are
// exercised by their own suites and are irrelevant to the audit-trail behavior under test.
vi.mock("@/services/attachments/upsert-service", () => {
  const UpsertServiceMock = { perform: vi.fn() }
  return { UpsertService: UpsertServiceMock, default: UpsertServiceMock }
})
vi.mock("@/services/information-sharing-agreements/create-groups-service", () => {
  const CreateGroupsServiceMock = { perform: vi.fn() }
  return { CreateGroupsService: CreateGroupsServiceMock, default: CreateGroupsServiceMock }
})

describe("api/src/services/information-sharing-agreements/sign-service.ts", () => {
  describe("SignService", () => {
    describe("#perform", () => {
      test("records a single 'Signed' audit and enables the audit trail", async () => {
        const currentUser = await userFactory.create()
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          status: InformationSharingAgreement.Status.DRAFT,
        })

        await SignService.perform(
          informationSharingAgreement,
          { signedConfidentialityAcknowledgement: { path: "/tmp/signed-acknowledgement.docx" } },
          currentUser
        )

        const audits = await InformationSharingAgreementAudit.findAll()
        expect(audits).toEqual([
          expect.objectContaining({
            informationSharingAgreementId: informationSharingAgreement.id,
            userId: currentUser.id,
            action: "Signed",
            description: `${currentUser.displayName} signed the agreement`,
          }),
        ])

        const reloaded = await informationSharingAgreement.reload()
        expect(reloaded.auditEnabled).toBe(true)
      })
    })
  })
})
