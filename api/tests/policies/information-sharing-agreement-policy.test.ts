import { describe, test, expect } from "vitest"

import { InformationSharingAgreement, User } from "@/models"
import {
  externalOrganizationFactory,
  informationSharingAgreementFactory,
  userFactory,
  groupFactory,
  userGroupFactory,
} from "@/tests/factories"

import InformationSharingAgreementPolicy from "@/policies/information-sharing-agreement-policy"

describe("api/src/policies/information-sharing-agreement-policy.ts", () => {
  describe("InformationSharingAgreementPolicy", () => {
    describe("#create", () => {
      test("when actor is internal, returns true", async () => {
        // Arrange
        const actor = await userFactory.create({ isExternal: false })
        const informationSharingAgreement = InformationSharingAgreement.build()

        // Act, Assert
        expect(
          new InformationSharingAgreementPolicy(actor, informationSharingAgreement).create()
        ).toBe(true)
      })

      // External Users cannot create ISAs or Knowledge Items. External Group Admins can
      // attach files but not create ISAs.
      test("when actor is external, returns false", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const actor = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const informationSharingAgreement = InformationSharingAgreement.build()

        // Act, Assert
        expect(
          new InformationSharingAgreementPolicy(actor, informationSharingAgreement).create()
        ).toBe(false)
      })
    })

    describe(".applyScope", () => {
      test("when user is system admin, returns all non-draft information sharing agreements, unless the user also created the draft", async () => {
        // Arrange
        const systemAdmin = await userFactory.create({
          roles: [User.Roles.SYSTEM_ADMIN],
        })
        const otherUser = await userFactory.create()

        const personalDraftInformationSharingAgreement =
          await informationSharingAgreementFactory.create({
            creatorId: systemAdmin.id,
            status: InformationSharingAgreement.Status.DRAFT,
          })
        const otherUserSignedInformationSharingAgreement =
          await informationSharingAgreementFactory.create({
            creatorId: otherUser.id,
            status: InformationSharingAgreement.Status.SIGNED,
          })
        const _otherUserDraftInformationSharingAgreement =
          await informationSharingAgreementFactory.create({
            creatorId: otherUser.id,
            status: InformationSharingAgreement.Status.DRAFT,
          })

        // Act
        const scopedInformationSharingAgreements = InformationSharingAgreementPolicy.applyScope(
          [],
          systemAdmin
        )

        // Assert
        const informationSharingAgreements = await scopedInformationSharingAgreements.findAll()
        expect(informationSharingAgreements).toEqual([
          expect.objectContaining({
            id: personalDraftInformationSharingAgreement.id,
          }),
          expect.objectContaining({
            id: otherUserSignedInformationSharingAgreement.id,
          }),
        ])
      })

      test("given user is external, returns own drafts and non-draft information sharing agreements where user is group member", async () => {
        // Arrange
        const externalOrganization = await externalOrganizationFactory.create()
        const externalUser = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const otherExternalUser = await userFactory.create({
          isExternal: true,
          externalOrganizationId: (await externalOrganizationFactory.create()).id,
        })
        const externalGroup = await groupFactory.create({
          isExternal: true,
        })
        const otherExternalGroup = await groupFactory.create({
          isExternal: true,
        })

        await userGroupFactory.create({
          userId: externalUser.id,
          groupId: externalGroup.id,
        })

        const ownDraft = await informationSharingAgreementFactory.create({
          creatorId: externalUser.id,
          status: InformationSharingAgreement.Status.DRAFT,
          externalGroupId: externalGroup.id,
          internalGroupId: externalGroup.id,
        })

        const signedInformationSharingAgreementWithMyGroup =
          await informationSharingAgreementFactory.create({
            creatorId: otherExternalUser.id,
            status: InformationSharingAgreement.Status.SIGNED,
            externalGroupId: externalGroup.id,
            internalGroupId: externalGroup.id,
          })

        const _signedInformationSharingAgreementWithOtherGroup =
          await informationSharingAgreementFactory.create({
            creatorId: otherExternalUser.id,
            status: InformationSharingAgreement.Status.SIGNED,
            externalGroupId: otherExternalGroup.id,
            internalGroupId: otherExternalGroup.id,
          })

        // Act
        const scopedInformationSharingAgreements = InformationSharingAgreementPolicy.applyScope(
          [],
          externalUser
        )

        // Assert
        const informationSharingAgreements = await scopedInformationSharingAgreements.findAll()
        expect(informationSharingAgreements).toEqual([
          expect.objectContaining({
            id: ownDraft.id,
          }),
          expect.objectContaining({
            id: signedInformationSharingAgreementWithMyGroup.id,
          }),
        ])
      })

      // Every internal Yukon Government employee can see every non-draft agreement,
      // including ones whose internal group they do not belong to. See TK-24.
      test("given user is internal, returns own drafts and all non-draft information sharing agreements", async () => {
        // Arrange
        const internalUser = await userFactory.create({
          isExternal: false,
        })
        const internalGroup = await groupFactory.create({
          isExternal: false,
        })

        const otherInternalUser = await userFactory.create({
          isExternal: false,
        })

        const ownDraft = await informationSharingAgreementFactory.create({
          creatorId: internalUser.id,
          status: InformationSharingAgreement.Status.DRAFT,
          internalGroupId: internalGroup.id,
        })
        const signedWithoutGroupMembership = await informationSharingAgreementFactory.create({
          creatorId: otherInternalUser.id,
          status: InformationSharingAgreement.Status.SIGNED,
          internalGroupId: internalGroup.id,
        })

        const _otherUserDraft = await informationSharingAgreementFactory.create({
          creatorId: otherInternalUser.id,
          status: InformationSharingAgreement.Status.DRAFT,
          internalGroupId: internalGroup.id,
        })

        // Act
        const scopedInformationSharingAgreements = InformationSharingAgreementPolicy.applyScope(
          [],
          internalUser
        )

        // Assert
        const informationSharingAgreements = await scopedInformationSharingAgreements.findAll()
        expect(informationSharingAgreements).toEqual([
          expect.objectContaining({
            id: ownDraft.id,
          }),
          expect.objectContaining({
            id: signedWithoutGroupMembership.id,
          }),
        ])
      })
    })
  })
})
