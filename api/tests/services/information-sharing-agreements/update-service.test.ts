import { InformationSharingAgreement, UserGroup } from "@/models"

import {
  externalOrganizationFactory,
  groupFactory,
  informationSharingAgreementFactory,
  userFactory,
  userGroupFactory,
} from "@/tests/factories"

import UpdateService from "@/services/information-sharing-agreements/update-service"

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
vi.mock("@/mailers/groups/notify-user-of-removal-mailer", () => {
  const NotifyUserOfRemovalMailerMock = { perform: vi.fn() }
  return {
    NotifyUserOfRemovalMailer: NotifyUserOfRemovalMailerMock,
    default: NotifyUserOfRemovalMailerMock,
  }
})
vi.mock("@/mailers/groups/notify-admins-of-removed-user-mailer", () => {
  const NotifyAdminsOfRemovedUserMailerMock = { perform: vi.fn() }
  return {
    NotifyAdminsOfRemovedUserMailer: NotifyAdminsOfRemovedUserMailerMock,
    default: NotifyAdminsOfRemovedUserMailerMock,
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
vi.mock("@/services/notifications/groups/notify-user-of-removal-service", () => {
  const NotifyUserOfRemovalServiceMock = { perform: vi.fn() }
  return {
    NotifyUserOfRemovalService: NotifyUserOfRemovalServiceMock,
    default: NotifyUserOfRemovalServiceMock,
  }
})
vi.mock("@/services/notifications/groups/notify-admins-of-removed-user-service", () => {
  const NotifyAdminsOfRemovedUserServiceMock = { perform: vi.fn() }
  return {
    NotifyAdminsOfRemovedUserService: NotifyAdminsOfRemovedUserServiceMock,
    default: NotifyAdminsOfRemovedUserServiceMock,
  }
})

describe("api/src/services/information-sharing-agreements/update-service.ts", () => {
  describe("UpdateService", () => {
    describe("#perform", () => {
      test("when updating basic attributes, updates the information sharing agreement", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          title: "Original Title",
        })

        // Act
        await UpdateService.perform(
          informationSharingAgreement,
          {
            title: "Updated Title",
          },
          currentUser
        )

        // Assert
        const informationSharingAgreements = await InformationSharingAgreement.findAll()
        expect(informationSharingAgreements).toEqual([
          expect.objectContaining({
            title: "Updated Title",
          }),
        ])
      })

      test("when external group contact changes and group exists, removes old contact and adds new contact to group", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create()
        const oldContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const newContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const externalGroup = await groupFactory.create({
          isExternal: true,
        })
        const internalGroup = await groupFactory.create({
          isExternal: false,
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupId: externalGroup.id,
          internalGroupId: internalGroup.id,
          externalGroupContactId: oldContact.id,
        })
        await userGroupFactory.create({
          userId: oldContact.id,
          groupId: externalGroup.id,
          isAdmin: true,
        })

        // Act
        await UpdateService.perform(
          informationSharingAgreement,
          {
            externalGroupContactId: newContact.id,
          },
          currentUser
        )

        // Assert
        const userGroups = await UserGroup.findAll()
        expect(userGroups).toEqual([
          expect.objectContaining({
            userId: newContact.id,
            groupId: externalGroup.id,
            isAdmin: true,
          }),
        ])
      })

      test("when contact does not change, does not modify group membership", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create()
        const contact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const externalGroup = await groupFactory.create({
          isExternal: true,
        })
        const internalGroup = await groupFactory.create({
          isExternal: false,
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupId: externalGroup.id,
          internalGroupId: internalGroup.id,
          externalGroupContactId: contact.id,
        })
        await userGroupFactory.create({
          userId: contact.id,
          groupId: externalGroup.id,
          isAdmin: true,
        })

        // Act
        await UpdateService.perform(
          informationSharingAgreement,
          {
            title: "Updated Title",
          },
          currentUser
        )

        // Assert
        const userGroups = await UserGroup.findAll()
        expect(userGroups).toEqual([
          expect.objectContaining({
            userId: contact.id,
            groupId: externalGroup.id,
          }),
        ])
      })

      test("when internal group contact changes and group exists, removes old contact and adds new contact to group", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const oldContact = await userFactory.create()
        const newContact = await userFactory.create()
        const internalGroup = await groupFactory.create({
          isExternal: false,
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          internalGroupId: internalGroup.id,
          internalGroupContactId: oldContact.id,
        })
        await userGroupFactory.create({
          userId: oldContact.id,
          groupId: internalGroup.id,
          isAdmin: true,
        })

        // Act
        await UpdateService.perform(
          informationSharingAgreement,
          {
            internalGroupContactId: newContact.id,
          },
          currentUser
        )

        // Assert
        const userGroups = await UserGroup.findAll()
        expect(userGroups).toEqual([
          expect.objectContaining({
            userId: newContact.id,
            groupId: internalGroup.id,
            isAdmin: true,
          }),
        ])
      })

      // The Manager field must never grant group admin or membership. See TK-66.
      test("when internal secondary contact changes and group exists, removes old contact without adding the new contact", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const oldContact = await userFactory.create()
        const newContact = await userFactory.create()
        const internalGroup = await groupFactory.create({
          isExternal: false,
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          internalGroupId: internalGroup.id,
          internalGroupSecondaryContactId: oldContact.id,
        })
        await userGroupFactory.create({
          userId: oldContact.id,
          groupId: internalGroup.id,
          isAdmin: true,
        })

        // Act
        await UpdateService.perform(
          informationSharingAgreement,
          {
            internalGroupSecondaryContactId: newContact.id,
          },
          currentUser
        )

        // Assert
        const userGroups = await UserGroup.findAll()
        expect(userGroups).toEqual([])
      })

      test("when contact is set to null, removes old contact from group without adding a new one", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create()
        const oldContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const externalGroup = await groupFactory.create({
          isExternal: true,
        })
        const internalGroup = await groupFactory.create({
          isExternal: false,
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupId: externalGroup.id,
          internalGroupId: internalGroup.id,
          externalGroupContactId: oldContact.id,
        })
        await userGroupFactory.create({
          userId: oldContact.id,
          groupId: externalGroup.id,
          isAdmin: true,
        })

        // Act
        await UpdateService.perform(
          informationSharingAgreement,
          {
            externalGroupContactId: null,
          },
          currentUser
        )

        // Assert
        const userGroups = await UserGroup.findAll()
        expect(userGroups).toHaveLength(0)
      })

      test("when contact is set from null to a value, adds new contact to group without removing anyone", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create()
        const newContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const externalGroup = await groupFactory.create({
          isExternal: true,
        })
        const internalGroup = await groupFactory.create({
          isExternal: false,
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupId: externalGroup.id,
          internalGroupId: internalGroup.id,
          externalGroupContactId: null,
        })

        // Act
        await UpdateService.perform(
          informationSharingAgreement,
          {
            externalGroupContactId: newContact.id,
          },
          currentUser
        )

        // Assert
        const userGroups = await UserGroup.findAll()
        expect(userGroups).toEqual([
          expect.objectContaining({
            userId: newContact.id,
            groupId: externalGroup.id,
            isAdmin: true,
          }),
        ])
      })

      test("when both internal contacts change simultaneously, admits only the new primary contact", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const oldPrimaryContact = await userFactory.create()
        const oldSecondaryContact = await userFactory.create()
        const newPrimaryContact = await userFactory.create()
        const newSecondaryContact = await userFactory.create()
        const internalGroup = await groupFactory.create({
          isExternal: false,
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          internalGroupId: internalGroup.id,
          internalGroupContactId: oldPrimaryContact.id,
          internalGroupSecondaryContactId: oldSecondaryContact.id,
        })
        await userGroupFactory.create({
          userId: oldPrimaryContact.id,
          groupId: internalGroup.id,
          isAdmin: true,
        })
        await userGroupFactory.create({
          userId: oldSecondaryContact.id,
          groupId: internalGroup.id,
          isAdmin: true,
        })

        // Act
        await UpdateService.perform(
          informationSharingAgreement,
          {
            internalGroupContactId: newPrimaryContact.id,
            internalGroupSecondaryContactId: newSecondaryContact.id,
          },
          currentUser
        )

        // Assert
        const userGroups = await UserGroup.findAll({
          order: [["userId", "ASC"]],
        })
        expect(userGroups).toEqual([
          expect.objectContaining({
            userId: newPrimaryContact.id,
            groupId: internalGroup.id,
            isAdmin: true,
          }),
        ])
      })

      test("when external and internal contacts change simultaneously, syncs contacts across both groups", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const externalOrganization = await externalOrganizationFactory.create()
        const oldExternalContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const newExternalContact = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        const oldInternalContact = await userFactory.create()
        const newInternalContact = await userFactory.create()
        const externalGroup = await groupFactory.create({
          isExternal: true,
        })
        const internalGroup = await groupFactory.create({
          isExternal: false,
        })
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupId: externalGroup.id,
          internalGroupId: internalGroup.id,
          externalGroupContactId: oldExternalContact.id,
          internalGroupContactId: oldInternalContact.id,
        })
        await userGroupFactory.create({
          userId: oldExternalContact.id,
          groupId: externalGroup.id,
          isAdmin: true,
        })
        await userGroupFactory.create({
          userId: oldInternalContact.id,
          groupId: internalGroup.id,
          isAdmin: true,
        })

        // Act
        await UpdateService.perform(
          informationSharingAgreement,
          {
            externalGroupContactId: newExternalContact.id,
            internalGroupContactId: newInternalContact.id,
          },
          currentUser
        )

        // Assert
        const userGroups = await UserGroup.findAll({
          order: [["groupId", "ASC"]],
        })
        expect(userGroups).toEqual([
          expect.objectContaining({
            userId: newExternalContact.id,
            groupId: externalGroup.id,
            isAdmin: true,
          }),
          expect.objectContaining({
            userId: newInternalContact.id,
            groupId: internalGroup.id,
            isAdmin: true,
          }),
        ])
      })

      test("when groups do not exist yet, does not attempt group membership changes", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const user1 = await userFactory.create()
        const informationSharingAgreement = await informationSharingAgreementFactory.create({
          externalGroupContactId: user1.id,
        })

        // Act
        await UpdateService.perform(
          informationSharingAgreement,
          {
            externalGroupContactId: null,
          },
          currentUser
        )

        // Assert
        const userGroups = await UserGroup.findAll()
        expect(userGroups).toHaveLength(0)
      })
    })
  })
})
