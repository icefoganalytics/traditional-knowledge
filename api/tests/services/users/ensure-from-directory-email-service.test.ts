import { yukonGovernmentIntegration } from "@/integrations"
import { User } from "@/models"

import { userFactory } from "@/tests/factories"

import EnsureFromDirectoryEmailService from "@/services/users/ensure-from-directory-email-service"

vi.mock("@/integrations", () => ({
  yukonGovernmentIntegration: {
    fetchEmployee: vi.fn(),
  },
}))

const mockedYukonGovernmentIntegration = vi.mocked(yukonGovernmentIntegration)

function buildDirectoryEmployee(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    full_name: "Jane Manager",
    first_name: "Jane",
    last_name: "Manager",
    organization: null,
    department: "HPW",
    division: "Digital Services",
    branch: "Applications",
    unit: "Platform",
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
    ...overrides,
  }
}

describe("api/src/services/users/ensure-from-directory-email-service.ts", () => {
  describe("EnsureFromDirectoryEmailService", () => {
    describe("#perform", () => {
      test("when a user with the email already exists, returns it without touching the directory", async () => {
        const currentUser = await userFactory.create()
        const existingUser = await userFactory.create({ email: "manager@example.com" })

        const result = await EnsureFromDirectoryEmailService.perform(
          "manager@example.com",
          currentUser
        )

        expect(result.id).toEqual(existingUser.id)
        expect(mockedYukonGovernmentIntegration.fetchEmployee).not.toHaveBeenCalled()
      })

      test("when no user exists, creates an internal user from the directory record", async () => {
        const currentUser = await userFactory.create()
        mockedYukonGovernmentIntegration.fetchEmployee.mockResolvedValue(buildDirectoryEmployee())

        const result = await EnsureFromDirectoryEmailService.perform(
          "jane.manager@yukon.ca",
          currentUser
        )

        expect(result).toBeInstanceOf(User)
        expect(result.email).toEqual("jane.manager@yukon.ca")
        expect(result.isExternal).toEqual(false)
        expect(result.department).toEqual("HPW")
        expect(result.title).toEqual("Director")
      })

      test("when no user exists and the directory has no matching record, throws", async () => {
        const currentUser = await userFactory.create()
        mockedYukonGovernmentIntegration.fetchEmployee.mockResolvedValue(null)

        await expect(
          EnsureFromDirectoryEmailService.perform("missing@yukon.ca", currentUser)
        ).rejects.toThrow("No Yukon Government directory record found")
      })
    })
  })
})
