import type * as Integrations from "@/integrations"

import { User } from "@/models"
import { yukonGovernmentIntegration } from "@/integrations"

import { externalOrganizationFactory, userFactory } from "@/tests/factories"
import { mockCurrentUser, request } from "@/tests/support"

vi.mock("@/integrations", async (importOriginal) => {
  const actual = await importOriginal<typeof Integrations>()
  return {
    ...actual,
    yukonGovernmentIntegration: {
      ...actual.yukonGovernmentIntegration,
      fetchEmployee: vi.fn(),
    },
  }
})

const mockedFetchEmployee = vi.mocked(yukonGovernmentIntegration.fetchEmployee)

describe("api/src/controllers/users/directory-users-controller.ts", () => {
  describe("DirectoryUsersController", () => {
    describe("#create", () => {
      let currentUser: User

      beforeEach(async () => {
        currentUser = await userFactory.create({ isExternal: false })
        mockCurrentUser(currentUser)
      })

      test("returns the existing internal user without creating a duplicate", async () => {
        const manager = await userFactory.create({
          email: "manager@example.com",
          isExternal: false,
        })
        const userCountBefore = await User.count()

        const response = await request()
          .post("/api/users/directory-users")
          .send({ email: "manager@example.com" })

        expect(response.status).toBe(201)
        expect(response.body.user.id).toBe(manager.id)
        expect(response.body.user.email).toBe("manager@example.com")
        expect(mockedFetchEmployee).not.toHaveBeenCalled()
        expect(await User.count()).toBe(userCountBefore)
      })

      test("creates an internal user from the directory when the email is new", async () => {
        mockedFetchEmployee.mockResolvedValue({
          full_name: "Jane Manager",
          first_name: "Jane",
          last_name: "Manager",
          organization: null,
          department: "HPW",
          division: null,
          branch: null,
          unit: null,
          title: "Director",
          email: "jane.manager@yukon.ca",
          suite: "",
          phone_office: "",
          fax_office: "",
          mobile: "",
          office: "",
          address: "",
          po_box: "",
          community: "",
          postal_code: "",
          latitude: null,
          longitude: null,
          mailcode: "",
          manager: "",
          username: "jmanager",
        })

        const response = await request()
          .post("/api/users/directory-users")
          .send({ email: "jane.manager@yukon.ca" })

        expect(response.status).toBe(201)
        const createdManager = await User.findOne({ where: { email: "jane.manager@yukon.ca" } })
        expect(createdManager).not.toBeNull()
        expect(createdManager?.isExternal).toBe(false)
        expect(response.body.user.id).toBe(createdManager?.id)
      })

      test("returns 403 when the current user is external", async () => {
        const externalOrganization = await externalOrganizationFactory.create()
        const externalUser = await userFactory.create({
          isExternal: true,
          externalOrganizationId: externalOrganization.id,
        })
        mockCurrentUser(externalUser)

        const response = await request()
          .post("/api/users/directory-users")
          .send({ email: "manager@example.com" })

        expect(response.status).toBe(403)
      })
    })
  })
})
