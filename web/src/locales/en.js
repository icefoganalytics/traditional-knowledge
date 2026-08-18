export default {
  informationSharingAgreement: {
    accessLevels: {
      internal: "INTERNAL",
      protected_and_limited: "PROTECTED and LIMITED",
      confidential_and_restricted: "CONFIDENTIAL and RESTRICTED",
    },
    accessLevelDescriptions: {
      internal:
        "INTERNAL to all YG employees across all departments. This Traditional Knowledge (TK) is not accessible to the public and has been shared for Yukon Government's (YG's) internal information only. Any YG employees who access this TK understand there could be negative impacts to intergovernmental relations if TK is made available to the public or unauthorised personnel.",
      protected_and_limited:
        "PROTECTED and LIMITED to employees from {department}. This Traditional Knowledge (TK) is sensitive and could damage intergovernmental relations, negatively impact Yukon Government's (YG's) reputation and/or legal position if TK is made available to the public or unauthorised personnel.",
      confidential_and_restricted:
        "CONFIDENTIAL and RESTRICTED to employees within {departmentBranchUnitHeirarchy}. This Traditional Knowledge (TK) is highly sensitive or sacred and could significantly damage intergovernmental relations, reputation(s), result in legal action or risk harm if TK is made available to the public or unauthorised personnel.",
      confidential_and_restricted_with_additional_restrictions:
        "CONFIDENTIAL and RESTRICTED to employees within {departmentBranchUnitHeirarchy}, with {additionalAccessRestrictions}. This Traditional Knowledge (TK) is highly sensitive or sacred and could significantly damage intergovernmental relations, reputation(s), result in legal action or risk harm if TK is made available to the public or unauthorised personnel.",
    },
    confidentialityTypes: {
      ACCORDANCE: "ACCORDANCE",
      ACCEPTED_IN_CONFIDENCE: "ACCEPTED IN CONFIDENCE",
    },
    confidentialityDescriptions: {
      ACCORDANCE: "ACCORDANCE with the terms and conditions of this agreement.",
      ACCEPTED_IN_CONFIDENCE: "ACCEPTED IN CONFIDENCE which includes formal protection measures.",
    },
    expirationConditions: {
      completion_of_purpose: "Completion of Purpose",
      expiration_date: "Expiration Date",
      undetermined_with_default_expiration: "Undetermined with Default Expiration",
    },
    detailLevels: {
      original: "Original: No alterations or summary",
      summary: "Summary: Notes, high-level summary, redacted portions",
      context_specific: "Context specific: Details below",
    },
    formats: {
      word_documents: "Word documents",
      audio_or_video: "Audio and/or video",
      excel_spreadsheets: "Excel spreadsheets",
      gis_files: "GIS files",
      pdf_or_scanned: "PDF / Scanned",
      photos: "Photos",
      hard_copies: "Hard copies (to be uploaded into electronic format)",
      other: "Other",
    },
    creditLines: {
      external_organization: "Yukon First Nation or Indigenous Government",
      other: "Other (specify below)",
    },
    expirationActions: {
      notify_designated_contacts_for_amendment:
        "Notify both designated contacts before expiration: to determine if an amendment or extension is required",
      notify_authorized_personnel:
        "Notify authorised Yukon Government personnel before expiration: reminder that previous authorisations end on the expiration date",
      notify_designated_contacts_of_expiry:
        "Notify both designated contacts before expiration: reminder that upon expiry all authorisations and access are void, and the action is non-reversable",
      send_removal_receipt:
        "Send receipt to both designated contacts confirming the Traditional Knowledge has been permanently removed from the Vault",
      other: "Other (specify below)",
    },
    breachActions: {
      notify_and_resolve:
        "Yukon Government notifies the designated contact at the earliest convenience; the contacts may resolve the breach with terms remaining status quo",
      notify_and_pause_authorizations:
        "Yukon Government informs the designated contact immediately and all previous authorisations are paused until the issue is addressed",
      terminate_and_delete:
        "If terminated, all authorisations are rescinded immediately and the Traditional Knowledge is permanently removed from the Vault",
      communicate_amendments:
        "Yukon Government's designated contact communicates amendments and requirements to authorised personnel",
      reconcile_completed_purpose:
        "If the purpose has been completed, the designated contacts determine next steps and reconcile the outcome",
    },
  },
  user: {
    roles: {
      user: "User",
      admin: "Admin",
      external_admin: "External Admin",
      system_admin: "System Admin",
    },
  },
  apiError: {
    offline:
      "You appear to be offline. Check your internet connection and try again.",
    unknown:
      "Something went wrong. Please try again, and contact support if the problem continues.",
    400: "That request couldn't be processed. Please check the information you entered and try again.",
    401: "Your session has expired. Please sign in again.",
    403: "You don't have permission to do that. If you believe you should, contact your administrator.",
    404: "We couldn't find what you were looking for. It may have been moved or deleted.",
    408: "The request took too long to complete. Please try again.",
    410: "That item is no longer available.",
    422: "Some of the information provided isn't valid. Please review the form and try again.",
    429: "Too many requests were made in a short time. Please wait a moment and try again.",
    500: "Something went wrong on our end. Please try again, and contact support if the problem continues.",
    503: "The Vault is temporarily unavailable, likely for maintenance. Please try again shortly.",
  },
}
