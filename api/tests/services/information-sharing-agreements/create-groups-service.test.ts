import { DateTime } from "luxon"

import { Group, InformationSharingAgreementAccessGrant, UserGroup } from "@/models"

import {
  externalOrganizationFactory,
  informationSharingAgreementFactory,
  userFactory,
} from "@/tests/factories"

import CreateGroupsService from "@/services/information-sharing-agreements/create-groups-service"

vi.mock("@/mailers/groups/notify-user-of-membership-mailer", () => {
  const NotifyUserOfMembershipMailerMock = { perform: vi.fn() }
  return {
    NotifyUserOfMembershipMailer: NotifyUserOfMembershipMailerMock,
    default: NotifyUserOfMembershipMailerMock,
  }
})
vi.mock("@/mailers/groups/notify-admins-of-added-user-mailer", () => {
  const NotifyAdminsOfAddedUserMailerMock = { perform: vi.fn() }
  return {
    NotifyAdminsOfAddedUserMailer: NotifyAdminsOfAddedUserMailerMock,
    default: NotifyAdminsOfAddedUserMailerMock,
  }
})
vi.mock("@/services/notifications/groups/notify-user-of-membership-service", () => {
  const NotifyUserOfMembershipServiceMock = { perform: vi.fn() }
  return {
    NotifyUserOfMembershipService: NotifyUserOfMembershipServiceMock,
    default: NotifyUserOfMembershipServiceMock,
  }
})
vi.mock("@/services/notifications/groups/notify-admins-of-added-user-service", () => {
  const NotifyAdminsOfAddedUserServiceMock = { perform: vi.fn() }
  return {
    NotifyAdminsOfAddedUserService: NotifyAdminsOfAddedUserServiceMock,
    default: NotifyAdminsOfAddedUserServiceMock,
  }
})

describe("api/src/services/information-sharing-agreements/create-groups-service.ts", () => {
  describe("CreateGroupsService", () => {
    describe("#perform", () => {
      test("when both contacts exist with proper associations, creates groups with correct names", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create({
          name: "Test External Organization",
        })
        const externalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const internalGroupContact = await userFactory.create({
          department: "Test Department",
        })
        const signedDate = DateTime.now().toFormat("yyyy-MM-dd")
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupContactId: externalGroupContact.id,
          internalGroupContactId: internalGroupContact.id,
          signedAt: DateTime.now().toJSDate(),
        })

        // Act
        await CreateGroupsService.perform(informationSharingAgreement, currentUser)

        // Assert
        const createdGroups = await Group.findAll({
          order: [["name", "ASC"]],
        })
        expect(createdGroups).toEqual([
          expect.objectContaining({
            name: `ISA#${informationSharingAgreement.id}-Test Department-${signedDate}`,
          }),
          expect.objectContaining({
            name: `ISA#${informationSharingAgreement.id}-Test External Organization-${signedDate}`,
          }),
        ])
      })

      test("when groups are created, assigns external group and internal group IDs back to information sharing agreement", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create({
          name: "Test External Organization",
        })
        const externalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const internalGroupContact = await userFactory.create({
          department: "Test Department",
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupContactId: externalGroupContact.id,
          internalGroupContactId: internalGroupContact.id,
          signedAt: DateTime.now().toJSDate(),
        })

        // Act
        await CreateGroupsService.perform(informationSharingAgreement, currentUser)

        // Assert
        const createdGroups = await Group.findAll()
        expect(informationSharingAgreement).toEqual(
          expect.objectContaining({
            externalGroupId: createdGroups[0].id,
            internalGroupId: createdGroups[1].id,
          })
        )
      })

      test("when groups are created, adds contacts as group admins", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create()
        const externalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const internalGroupContact = await userFactory.create({
          department: "Test Department",
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupContactId: externalGroupContact.id,
          internalGroupContactId: internalGroupContact.id,
          signedAt: DateTime.now().toJSDate(),
        })

        // Act
        await CreateGroupsService.perform(informationSharingAgreement, currentUser)

        // Assert
        const userGroups = await UserGroup.findAll({
          order: [["userId", "ASC"]],
        })
        expect(userGroups).toEqual([
          expect.objectContaining({
            userId: externalGroupContact.id,
            groupId: informationSharingAgreement.externalGroupId,
            isAdmin: true,
          }),
          expect.objectContaining({
            userId: internalGroupContact.id,
            groupId: informationSharingAgreement.internalGroupId,
            isAdmin: true,
          }),
        ])
      })

      test("when groups are created, auto-creates access grants for contacts with admin access level", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create()
        const externalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const internalGroupContact = await userFactory.create({
          department: "Test Department",
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupContactId: externalGroupContact.id,
          internalGroupContactId: internalGroupContact.id,
          signedAt: DateTime.now().toJSDate(),
        })

        // Act
        await CreateGroupsService.perform(informationSharingAgreement, currentUser)

        // Assert
        const accessGrants = await InformationSharingAgreementAccessGrant.findAll({
          order: [["userId", "ASC"]],
        })
        expect(accessGrants).toEqual([
          expect.objectContaining({
            informationSharingAgreementId: informationSharingAgreement.id,
            groupId: informationSharingAgreement.externalGroupId,
            userId: externalGroupContact.id,
            accessLevel: "admin",
          }),
          expect.objectContaining({
            informationSharingAgreementId: informationSharingAgreement.id,
            groupId: informationSharingAgreement.internalGroupId,
            userId: internalGroupContact.id,
            accessLevel: "admin",
          }),
        ])
      })

      // The Manager field records who signs the contract, and must not grant group
      // admin, group membership, or an access grant. See TK-66.
      test("when internal secondary contact exists, does not add secondary contact to the group", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create()
        const externalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const internalGroupContact = await userFactory.create({
          department: "Test Department",
        })
        const internalGroupSecondaryContact = await userFactory.create({
          department: "Test Department",
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupContactId: externalGroupContact.id,
          internalGroupContactId: internalGroupContact.id,
          internalGroupSecondaryContactId: internalGroupSecondaryContact.id,
          signedAt: DateTime.now().toJSDate(),
        })

        // Act
        await CreateGroupsService.perform(informationSharingAgreement, currentUser)

        // Assert
        const accessGrants = await InformationSharingAgreementAccessGrant.findAll({
          order: [["userId", "ASC"]],
        })
        expect(accessGrants).toEqual([
          expect.objectContaining({
            userId: externalGroupContact.id,
            accessLevel: "admin",
          }),
          expect.objectContaining({
            userId: internalGroupContact.id,
            accessLevel: "admin",
          }),
        ])

        const secondaryContactUserGroups = await UserGroup.findAll({
          where: {
            userId: internalGroupSecondaryContact.id,
          },
        })
        expect(secondaryContactUserGroups).toEqual([])
      })

      test("when external group contact ID is nil, errors informatively", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const internalGroupContact = await userFactory.create({
          department: "Test Department",
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupContactId: null,
          internalGroupContactId: internalGroupContact.id,
          signedAt: new Date(),
        })

        // Act & Assert
        await expect(
          CreateGroupsService.perform(informationSharingAgreement, currentUser)
        ).rejects.toThrow("External group contact ID must be present to create external group")
      })

      test("when internal group contact ID is nil, errors informatively", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create()
        const externalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const informationSharingAgreement = informationSharingAgreementFactory.build({
          externalGroupContactId: externalGroupContact.id,
          internalGroupContactId: null,
          signedAt: new Date(),
        })

        // Act & Assert
        await expect(
          CreateGroupsService.perform(informationSharingAgreement, currentUser)
        ).rejects.toThrow("Internal group contact ID must be present to create internal group")
      })

      test("when agreement is not signed, errors informatively", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create({
          name: "Test External Organization",
        })
        const externalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const internalGroupContact = await userFactory.create({
          department: "Test Department",
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupContactId: externalGroupContact.id,
          internalGroupContactId: internalGroupContact.id,
          signedAt: null,
        })

        // Act & Assert
        await expect(
          CreateGroupsService.perform(informationSharingAgreement, currentUser)
        ).rejects.toThrow("Signed date must be present to create groups")
      })

      test("when external group contact no longer exists, errors informatively", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create()
        const externalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const internalGroupContact = await userFactory.create({
          department: "Test Department",
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupContactId: externalGroupContact.id,
          internalGroupContactId: internalGroupContact.id,
          signedAt: new Date(),
        })

        // Act & Assert
        await externalGroupContact.destroy()
        await expect(
          CreateGroupsService.perform(informationSharingAgreement, currentUser)
        ).rejects.toThrow("External group contact not found")
      })

      test("when external group contact is not external, errors informatively", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalGroupContact = await userFactory.create({
          isExternal: false,
        })
        const internalGroupContact = await userFactory.create({
          department: "Test Department",
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupContactId: externalGroupContact.id,
          internalGroupContactId: internalGroupContact.id,
          signedAt: new Date(),
        })

        // Act & Assert
        await expect(
          CreateGroupsService.perform(informationSharingAgreement, currentUser)
        ).rejects.toThrow("External group contact must be an external user")
      })

      test("when external group contact's external organization no longer exists, errors informatively", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create()
        const externalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const internalGroupContact = await userFactory.create({
          department: "Test Department",
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupContactId: externalGroupContact.id,
          internalGroupContactId: internalGroupContact.id,
          signedAt: new Date(),
        })

        // Act & Assert
        await externalOrganization.destroy()
        await expect(
          CreateGroupsService.perform(informationSharingAgreement, currentUser)
        ).rejects.toThrow("External group contact is missing its associated external organization")
      })

      test("when internal group contact no longer exists, errors informatively", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create()
        const externalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const internalGroupContact = await userFactory.create({
          department: "Test Department",
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupContactId: externalGroupContact.id,
          internalGroupContactId: internalGroupContact.id,
          signedAt: new Date(),
        })

        // Act & Assert
        await internalGroupContact.destroy()
        await expect(
          CreateGroupsService.perform(informationSharingAgreement, currentUser)
        ).rejects.toThrow("Internal group contact not found")
      })

      test("when internal group contact is external, errors informatively", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization1 = await externalOrganizationFactory.create()
        const externalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization1.id,
        })
        const externalOrganization2 = await externalOrganizationFactory.create()
        const internalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization2.id,
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupContactId: externalGroupContact.id,
          internalGroupContactId: internalGroupContact.id,
          signedAt: new Date(),
        })

        // Act & Assert
        await expect(
          CreateGroupsService.perform(informationSharingAgreement, currentUser)
        ).rejects.toThrow("Internal group contact must be an internal user")
      })

      test("when internal group contact has no department, uses UNKNOWN", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create({
          name: "Test External Organization",
        })
        const externalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const internalGroupContact = await userFactory.create({
          department: null,
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupContactId: externalGroupContact.id,
          internalGroupContactId: internalGroupContact.id,
          signedAt: DateTime.now().toJSDate(),
        })

        const signedDate = DateTime.now().toFormat("yyyy-MM-dd")

        // Act
        await CreateGroupsService.perform(informationSharingAgreement, currentUser)

        // Assert
        const createdGroups = await Group.findAll({
          order: [["name", "ASC"]],
        })
        expect(createdGroups).toEqual([
          expect.objectContaining({
            name: `ISA#${informationSharingAgreement.id}-Test External Organization-${signedDate}`,
          }),
          expect.objectContaining({
            name: `ISA#${informationSharingAgreement.id}-UNKNOWN-${signedDate}`,
          }),
        ])
      })

      test("when group names exceed maximum length, truncates correctly", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const longOrganizationName = "A".repeat(100)
        const externalOrganization = await externalOrganizationFactory.create({
          name: longOrganizationName,
        })
        const externalGroupContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })

        const longDepartmentName = "B".repeat(100)
        const internalGroupContact = await userFactory.create({
          department: longDepartmentName,
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupContactId: externalGroupContact.id,
          internalGroupContactId: internalGroupContact.id,
          signedAt: DateTime.now().toJSDate(),
        })

        // Act
        await CreateGroupsService.perform(informationSharingAgreement, currentUser)

        // Assert
        const createdGroups = await Group.findAll({
          order: [["name", "ASC"]],
        })
        const signedDate = DateTime.now().toFormat("yyyy-MM-dd")

        expect(createdGroups).toEqual([
          expect.objectContaining({
            name: `ISA#${informationSharingAgreement.id}-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA-${signedDate}`,
          }),
          expect.objectContaining({
            name: `ISA#${informationSharingAgreement.id}-BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB-${signedDate}`,
          }),
        ])
      })
    })
  })
})
