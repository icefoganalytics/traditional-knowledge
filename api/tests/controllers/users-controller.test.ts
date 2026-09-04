import { User } from "@/models"

import { externalOrganizationFactory, userFactory } from "@/tests/factories"
import { mockCurrentUser, request } from "@/tests/support"

vi.mock("@/mailers/users/notify-admins-of-created-user-mailer", () => {
  const NotifyAdminsOfCreatedUserMailerMock = { perform: vi.fn() }
  return {
    NotifyAdminsOfCreatedUserMailer: NotifyAdminsOfCreatedUserMailerMock,
    default: NotifyAdminsOfCreatedUserMailerMock,
  }
})

describe("api/src/controllers/users-controller.ts", () => {
  describe("UsersController", () => {
    describe("#create", () => {
      async function buildInternalActor(roles: string[]) {
        const actor = await userFactory.create({ roles, isExternal: false })
        mockCurrentUser(actor)
        return actor
      }

      function buildInternalUserPayload() {
        return {
          isExternal: false,
          email: "new.internal.user@yukon.ca",
          firstName: "New",
          lastName: "Internal",
        }
      }

      async function buildExternalUserPayload() {
        const externalOrganization = await externalOrganizationFactory.create()
        return {
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
          email: "new.external.user@example.com",
          firstName: "New",
          lastName: "External",
        }
      }

      // System Admin creates both; Admin creates internal only; External Admin
      // creates external only; plain User creates neither. See TK-36.
      const MATRIX = [
        { role: User.Roles.SYSTEM_ADMIN, canCreateInternal: true, canCreateExternal: true },
        { role: User.Roles.ADMIN, canCreateInternal: true, canCreateExternal: false },
        { role: User.Roles.EXTERNAL_ADMIN, canCreateInternal: false, canCreateExternal: true },
        { role: User.Roles.USER, canCreateInternal: false, canCreateExternal: false },
      ]

      describe.each(MATRIX)(
        "when actor has the $role role",
        ({ role, canCreateInternal, canCreateExternal }) => {
          test(`creating an internal user responds ${
            canCreateInternal ? "201" : "403"
          }`, async () => {
            // Arrange
            await buildInternalActor([role])

            // Act
            const response = await request()
              .post("/api/users")
              .send(buildInternalUserPayload())

            // Assert
            if (canCreateInternal) {
              expect(response.status).toBe(201)
              expect(response.body.user).toEqual(
                expect.objectContaining({ isExternal: false })
              )
            } else {
              expect(response.status).toBe(403)
              expect(response.body.message).toEqual(expect.any(String))

              const createdUsers = await User.findAll({
                where: { email: buildInternalUserPayload().email },
              })
              expect(createdUsers).toHaveLength(0)
            }
          })

          test(`creating an external user responds ${
            canCreateExternal ? "201" : "403"
          }`, async () => {
            // Arrange
            await buildInternalActor([role])
            const payload = await buildExternalUserPayload()

            // Act
            const response = await request().post("/api/users").send(payload)

            // Assert
            if (canCreateExternal) {
              expect(response.status).toBe(201)
              expect(response.body.user).toEqual(
                expect.objectContaining({
                  isExternal: true,
                  externalOrganizationId: payload.externalOrganizationId,
                })
              )
            } else {
              expect(response.status).toBe(403)
              expect(response.body.message).toEqual(expect.any(String))

              const createdUsers = await User.findAll({
                where: { email: payload.email },
              })
              expect(createdUsers).toHaveLength(0)
            }
          })
        }
      )

      test("when actor is an admin and attempts to grant system admin, rejects the request", async () => {
        // Arrange
        await buildInternalActor([User.Roles.ADMIN])
        const payload = {
          ...buildInternalUserPayload(),
          roles: [User.Roles.USER, User.Roles.SYSTEM_ADMIN],
        }

        // Act
        const response = await request().post("/api/users").send(payload)

        // Assert
        expect(response.status).toBe(422)

        const createdUsers = await User.findAll({ where: { email: payload.email } })
        expect(createdUsers).toHaveLength(0)
      })

      test("when actor is a system admin and grants system admin, succeeds", async () => {
        // Arrange
        await buildInternalActor([User.Roles.SYSTEM_ADMIN])
        const payload = {
          ...buildInternalUserPayload(),
          roles: [User.Roles.USER, User.Roles.SYSTEM_ADMIN],
        }

        // Act
        const response = await request().post("/api/users").send(payload)

        // Assert
        expect(response.status).toBe(201)
        expect(response.body.user.roles).toContain(User.Roles.SYSTEM_ADMIN)
      })
    })
  })
})
