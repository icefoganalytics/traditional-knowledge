import { InformationSharingAgreementAudit, User } from "@/models"

import { informationSharingAgreementFactory, userFactory } from "@/tests/factories"

import { mockCurrentUser, request } from "@/tests/support"

describe("api/src/controllers/information-sharing-agreement-audits-controller.ts", () => {
  describe("InformationSharingAgreementAuditsController", () => {
    describe("#index", () => {
      let currentUser: User

      beforeEach(async () => {
        currentUser = await userFactory.create()
        mockCurrentUser(currentUser)
      })

      test("returns the audit trail for an agreement the user owns", async () => {
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: currentUser.id,
        })
        await InformationSharingAgreementAudit.create({
          informationSharingAgreementId: informationSharingAgreement.id,
          userId: currentUser.id,
          action: "Signed",
          description: `${currentUser.displayName} signed the agreement`,
        })
        await InformationSharingAgreementAudit.create({
          informationSharingAgreementId: informationSharingAgreement.id,
          userId: currentUser.id,
          action: "Updated",
          description: `${currentUser.displayName} updated the agreement`,
        })

        const response = await request().get(
          `/api/information-sharing-agreements/${informationSharingAgreement.id}/audits`
        )

        expect(response.status).toBe(200)
        expect(response.body.totalCount).toBe(2)
        expect(response.body.informationSharingAgreementAudits).toHaveLength(2)
        const actions = response.body.informationSharingAgreementAudits.map(
          (audit: { action: string }) => audit.action
        )
        expect(actions).toEqual(expect.arrayContaining(["Signed", "Updated"]))
        expect(response.body.informationSharingAgreementAudits[0]).toMatchObject({
          informationSharingAgreementId: informationSharingAgreement.id,
          user: { displayName: currentUser.displayName },
        })
      })

      test("does not expose audits for an agreement the user does not own", async () => {
        const otherUser = await userFactory.create()
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          creatorId: otherUser.id,
        })
        await InformationSharingAgreementAudit.create({
          informationSharingAgreementId: informationSharingAgreement.id,
          userId: otherUser.id,
          action: "Signed",
          description: `${otherUser.displayName} signed the agreement`,
        })

        const response = await request().get(
          `/api/information-sharing-agreements/${informationSharingAgreement.id}/audits`
        )

        expect(response.status).toBe(200)
        expect(response.body.totalCount).toBe(0)
        expect(response.body.informationSharingAgreementAudits).toHaveLength(0)
      })
    })
  })
})
