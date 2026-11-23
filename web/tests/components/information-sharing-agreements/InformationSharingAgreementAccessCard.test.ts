import { describe, expect, it } from "vitest"
import { mount } from "@vue/test-utils"

import { mockVuetify } from "@/tests/support"
import i18n from "@/plugins/vue-i18n-plugin"

import { InformationSharingAgreementAccessLevels } from "@/api/information-sharing-agreements-api"

import InformationSharingAgreementAccessCard from "@/components/information-sharing-agreements/InformationSharingAgreementAccessCard.vue"

function mountCard(
  props: Partial<{
    accessLevel: InformationSharingAgreementAccessLevels | null
    accessLevelDepartmentRestriction: string | null
    accessLevelBranchRestriction: string | null
    accessLevelUnitRestriction: string | null
    hasAdditionalAccessRestrictions: boolean | null
    additionalAccessRestrictions: string | null
  }>
) {
  return mount(InformationSharingAgreementAccessCard, {
    props: {
      accessLevel: null,
      accessLevelDepartmentRestriction: null,
      accessLevelBranchRestriction: null,
      accessLevelUnitRestriction: null,
      hasAdditionalAccessRestrictions: null,
      additionalAccessRestrictions: null,
      ...props,
    },
    global: {
      plugins: [mockVuetify(), i18n],
    },
  })
}

describe("InformationSharingAgreementAccessCard.vue", () => {
  it("grants internal access to all YG staff", () => {
    const wrapper = mountCard({ accessLevel: InformationSharingAgreementAccessLevels.INTERNAL })

    expect(wrapper.text()).toContain("All YG staff across all YG departments.")
  })

  it("limits protected access to the selected department", () => {
    const wrapper = mountCard({
      accessLevel: InformationSharingAgreementAccessLevels.PROTECTED_AND_LIMITED,
      accessLevelDepartmentRestriction: "Highways and Public Works",
    })

    expect(wrapper.text()).toContain("YG staff from Highways and Public Works.")
  })

  it("restricts confidential access to the branch within the department with additional measures", () => {
    const wrapper = mountCard({
      accessLevel: InformationSharingAgreementAccessLevels.CONFIDENTIAL_AND_RESTRICTED,
      accessLevelDepartmentRestriction: "Executive Council Office",
      accessLevelBranchRestriction: "Aboriginal Relations",
      hasAdditionalAccessRestrictions: true,
      additionalAccessRestrictions: "Named staff only",
    })

    expect(wrapper.text()).toContain(
      "YG staff within Aboriginal Relations within Executive Council Office."
    )
    expect(wrapper.text()).toContain("Named staff only")
  })
})
