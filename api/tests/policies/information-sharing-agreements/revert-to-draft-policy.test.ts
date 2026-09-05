import { InformationSharingAgreement } from "@/models"

import {
  archiveItemFactory,
  informationSharingAgreementArchiveItemFactory,
  informationSharingAgreementFactory,
  userFactory,
} from "@/tests/factories"

import { RevertToDraftPolicy } from "@/policies/information-sharing-agreements"

describe("api/src/policies/information-sharing-agreements/revert-to-draft-policy.ts", () => {
  describe("RevertToDraftPolicy", () => {
    describe("#create", () => {
      test("allows the creator to revert a signed agreement even when knowledge items are linked", async () => {
        const creator = await userFactory.create()
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          status: InformationSharingAgreement.Status.SIGNED,
          creatorId: creator.id,
        })
        const archiveItem = await archiveItemFactory.create({ userId: creator.id })
        await informationSharingAgreementArchiveItemFactory.create({
          informationSharingAgreementId: informationSharingAgreement.id,
          archiveItemId: archiveItem.id,
          creatorId: creator.id,
        })

        const policy = new RevertToDraftPolicy(creator, informationSharingAgreement)

        expect(policy.create()).toBe(true)
      })

      test("does not allow reverting an agreement that is not signed", async () => {
        const creator = await userFactory.create()
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          status: InformationSharingAgreement.Status.DRAFT,
          creatorId: creator.id,
        })

        const policy = new RevertToDraftPolicy(creator, informationSharingAgreement)

        expect(policy.create()).toBe(false)
      })

      test("does not allow an unrelated user to revert", async () => {
        const creator = await userFactory.create()
        const unrelatedUser = await userFactory.create()
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          status: InformationSharingAgreement.Status.SIGNED,
          creatorId: creator.id,
        })
        await informationSharingAgreement.reload({ include: ["accessGrants"] })

        const policy = new RevertToDraftPolicy(unrelatedUser, informationSharingAgreement)

        expect(policy.create()).toBe(false)
      })
    })
  })
})
