import { isNil } from "lodash"

/**
 * The user-facing number for an Information Sharing Agreement, e.g. "#ISA-42".
 *
 * Matches the identifier shown on the agreement page and in the generated
 * confidentiality acknowledgement, so breadcrumbs, headings and documents agree.
 */
export function formatInformationSharingAgreementNumber(id: number | null | undefined): string {
  if (isNil(id)) return ""

  return `#ISA-${id}`
}

export default formatInformationSharingAgreementNumber
