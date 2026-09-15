import {
  Attachment,
  Group,
  InformationSharingAgreement,
  InformationSharingAgreementArchiveItem,
  InformationSharingAgreementAudit,
} from "@/models"
import { AttachmentTargetTypes } from "@/models/attachment"

import {
  archiveItemFactory,
  attachmentFactory,
  groupFactory,
  informationSharingAgreementArchiveItemFactory,
  informationSharingAgreementFactory,
  userFactory,
} from "@/tests/factories"

import RevertToDraftService from "@/services/information-sharing-agreements/revert-to-draft-service"
import UpdateService from "@/services/information-sharing-agreements/update-service"

// Group removal fans out notifications that are irrelevant to reverting; silence them.
vi.mock("@/mailers/groups/notify-user-of-removal-mailer", () => {
  const NotifyUserOfRemovalMailerMock = { perform: vi.fn() }
  return { NotifyUserOfRemovalMailer: NotifyUserOfRemovalMailerMock, default: NotifyUserOfRemovalMailerMock }
})
vi.mock("@/mailers/groups/notify-admins-of-removed-user-mailer", () => {
  const NotifyAdminsOfRemovedUserMailerMock = { perform: vi.fn() }
  return { NotifyAdminsOfRemovedUserMailer: NotifyAdminsOfRemovedUserMailerMock, default: NotifyAdminsOfRemovedUserMailerMock }
})
vi.mock("@/services/notifications/groups/notify-user-of-removal-service", () => {
  const NotifyUserOfRemovalServiceMock = { perform: vi.fn() }
  return { NotifyUserOfRemovalService: NotifyUserOfRemovalServiceMock, default: NotifyUserOfRemovalServiceMock }
})
vi.mock("@/services/notifications/groups/notify-admins-of-removed-user-service", () => {
  const NotifyAdminsOfRemovedUserServiceMock = { perform: vi.fn() }
  return { NotifyAdminsOfRemovedUserService: NotifyAdminsOfRemovedUserServiceMock, default: NotifyAdminsOfRemovedUserServiceMock }
})

describe("api/src/services/information-sharing-agreements/revert-to-draft-service.ts", () => {
  describe("RevertToDraftService", () => {
    describe("#perform", () => {
      async function buildSignedAgreement() {
        const currentUser = await userFactory.create()
        const internalGroup = await groupFactory.create({ isExternal: false })
        const externalGroup = await groupFactory.create({ isExternal: true })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          status: InformationSharingAgreement.Status.SIGNED,
          internalGroupId: internalGroup.id,
          externalGroupId: externalGroup.id,
          signedById: currentUser.id,
          signedAt: new Date(),
        })
        return { currentUser, informationSharingAgreement }
      }

      test("reverts to draft and clears the signing metadata", async () => {
        const { currentUser, informationSharingAgreement } = await buildSignedAgreement()

        const reverted = await RevertToDraftService.perform(informationSharingAgreement, currentUser)

        expect(reverted.status).toBe(InformationSharingAgreement.Status.DRAFT)
        expect(reverted.signedById).toBeNull()
        expect(reverted.signedAt).toBeNull()
      })

      test("removes the agreement's groups", async () => {
        const { currentUser, informationSharingAgreement } = await buildSignedAgreement()

        await RevertToDraftService.perform(informationSharingAgreement, currentUser)

        expect(await Group.count()).toBe(0)
      })

      test("keeps the signed documents attached", async () => {
        const { currentUser, informationSharingAgreement } = await buildSignedAgreement()
        const attachment = await attachmentFactory.create({
          targetId: informationSharingAgreement.id,
          targetType: AttachmentTargetTypes.InformationSharingAgreement,
          associationName: "signedConfidentialityAcknowledgement",
        })

        await RevertToDraftService.perform(informationSharingAgreement, currentUser)

        expect(await Attachment.findByPk(attachment.id)).not.toBeNull()
      })

      test("reverts even when knowledge items are linked, keeping the links", async () => {
        const { currentUser, informationSharingAgreement } = await buildSignedAgreement()
        const archiveItem = await archiveItemFactory.create({ userId: currentUser.id })
        const link = await informationSharingAgreementArchiveItemFactory.create({
          informationSharingAgreementId: informationSharingAgreement.id,
          archiveItemId: archiveItem.id,
          creatorId: currentUser.id,
        })

        const reverted = await RevertToDraftService.perform(informationSharingAgreement, currentUser)

        expect(reverted.status).toBe(InformationSharingAgreement.Status.DRAFT)
        expect(await InformationSharingAgreementArchiveItem.findByPk(link.id)).not.toBeNull()
      })

      test("throws when the agreement is not signed", async () => {
        const currentUser = await userFactory.create()
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          status: InformationSharingAgreement.Status.DRAFT,
        })

        await expect(
          RevertToDraftService.perform(informationSharingAgreement, currentUser)
        ).rejects.toThrow("Only signed agreements can be reverted to draft.")
      })

      describe("audit trail", () => {
        async function buildAuditableSignedAgreement() {
          const currentUser = await userFactory.create()
          const internalGroup = await groupFactory.create({ isExternal: false })
          const externalGroup = await groupFactory.create({ isExternal: true })
          const informationSharingAgreement = await informationSharingAgreementFactory.create({
            status: InformationSharingAgreement.Status.SIGNED,
            internalGroupId: internalGroup.id,
            externalGroupId: externalGroup.id,
            signedById: currentUser.id,
            signedAt: new Date(),
            auditEnabled: true,
          })
          return { currentUser, informationSharingAgreement }
        }

        test("records a 'Reverted to draft' audit", async () => {
          const { currentUser, informationSharingAgreement } =
            await buildAuditableSignedAgreement()

          await RevertToDraftService.perform(informationSharingAgreement, currentUser)

          const audits = await InformationSharingAgreementAudit.findAll()
          expect(audits).toEqual([
            expect.objectContaining({
              informationSharingAgreementId: informationSharingAgreement.id,
              userId: currentUser.id,
              action: "Reverted to draft",
              description: `${currentUser.displayName} reverted the agreement to draft`,
            }),
          ])
        })

        test("records an 'Updated' audit when a reverted-to-draft agreement is updated", async () => {
          const { currentUser, informationSharingAgreement } =
            await buildAuditableSignedAgreement()

          const reverted = await RevertToDraftService.perform(
            informationSharingAgreement,
            currentUser
          )
          await UpdateService.perform(reverted, { title: "Amended Title" }, currentUser)

          const updateAudits = await InformationSharingAgreementAudit.findAll({
            where: { action: "Updated" },
          })
          expect(updateAudits).toEqual([
            expect.objectContaining({
              informationSharingAgreementId: informationSharingAgreement.id,
              userId: currentUser.id,
              action: "Updated",
              description: `${currentUser.displayName} updated the agreement`,
            }),
          ])
        })
      })
    })
  })
})
