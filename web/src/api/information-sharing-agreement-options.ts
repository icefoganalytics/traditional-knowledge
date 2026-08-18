/**
 * Option values for the optional sections of the Information Sharing Agreement
 * template. Stored comma-joined in their respective columns.
 *
 * Keep in sync with api/src/models/information-sharing-agreement-options.ts
 *
 * See TK-44.
 */

/** Section 2: what level of detail is appropriate for the Traditional Knowledge. */
export enum InformationSharingAgreementDetailLevels {
  ORIGINAL = "original",
  SUMMARY = "summary",
  CONTEXT_SPECIFIC = "context_specific",
}

/** Section 3: formats the Traditional Knowledge is shared in. */
export enum InformationSharingAgreementFormats {
  WORD_DOCUMENTS = "word_documents",
  AUDIO_OR_VIDEO = "audio_or_video",
  EXCEL_SPREADSHEETS = "excel_spreadsheets",
  GIS_FILES = "gis_files",
  PDF_OR_SCANNED = "pdf_or_scanned",
  PHOTOS = "photos",
  HARD_COPIES = "hard_copies",
  OTHER = "other",
}

/** Section 7: who any reference to the Traditional Knowledge is credited to. */
export enum InformationSharingAgreementCreditLines {
  EXTERNAL_ORGANIZATION = "external_organization",
  OTHER = "other",
}

/** Section 8: optional notifications before the agreement expires. */
export enum InformationSharingAgreementExpirationActions {
  NOTIFY_DESIGNATED_CONTACTS_FOR_AMENDMENT = "notify_designated_contacts_for_amendment",
  NOTIFY_AUTHORIZED_PERSONNEL = "notify_authorized_personnel",
  NOTIFY_DESIGNATED_CONTACTS_OF_EXPIRY = "notify_designated_contacts_of_expiry",
  SEND_REMOVAL_RECEIPT = "send_removal_receipt",
  OTHER = "other",
}

/** Section 9: actions to take if the agreement is breached. */
export enum InformationSharingAgreementBreachActions {
  NOTIFY_AND_RESOLVE = "notify_and_resolve",
  NOTIFY_AND_PAUSE_AUTHORIZATIONS = "notify_and_pause_authorizations",
  TERMINATE_AND_DELETE = "terminate_and_delete",
  COMMUNICATE_AMENDMENTS = "communicate_amendments",
  RECONCILE_COMPLETED_PURPOSE = "reconcile_completed_purpose",
}
