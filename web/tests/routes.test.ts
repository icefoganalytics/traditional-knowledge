import { createMemoryHistory, createRouter } from "vue-router"
import routes from "@/routes"

describe("sharing agreement routes", () => {
  const router = createRouter({ history: createMemoryHistory(), routes })

  test.each([
    ["/sharing-agreements", "InformationSharingAgreementsPage"],
    [
      "/sharing-agreements/new",
      "information-sharing-agreements/InformationSharingAgreementNewPage",
    ],
    ["/sharing-agreements/12", "information-sharing-agreements/InformationSharingAgreementPage"],
    [
      "/sharing-agreements/12/knowledge-items",
      "information-sharing-agreements/InformationSharingAgreementKnowledgeItemsPage",
    ],
    [
      "/sharing-agreements/12/knowledge-items/34",
      "information-sharing-agreements/InformationSharingAgreementKnowledgeItemPage",
    ],
    [
      "/sharing-agreements/12/sign",
      "information-sharing-agreements/InformationSharingAgreementSignPage",
    ],
    [
      "/sharing-agreements/12/edit",
      "information-sharing-agreements/InformationSharingAgreementEditPage",
    ],
    [
      "/sharing-agreements/12/edit/edit-basic-information",
      "information-sharing-agreements/InformationSharingAgreementEditBasicInformationPage",
    ],
    ["/administration/sharing-agreements", "administration/InformationSharingAgreementsPage"],
    [
      "/administration/sharing-agreements/12/access-grants",
      "administration/information-sharing-agreements/InformationSharingAgreementAccessGrantsPage",
    ],
    [
      "/archive-items/34/sharing-agreements",
      "archive-items/ArchiveItemInformationSharingAgreementsPage",
    ],
  ])("resolves %s", (path, name) => {
    expect(router.resolve(path).matched.some((record) => record.name === name)).toBe(true)
  })

  test("does not resolve the former public prefix", () => {
    expect(router.resolve("/information-sharing-agreements").name).toBe("NotFoundPage")
  })
})
