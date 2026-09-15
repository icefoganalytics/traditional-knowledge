import db from "@/db/db-client"

// Models
import ArchiveItem from "@/models/archive-item"
import ArchiveItemAudit from "@/models/archive-item-audit"
import ArchiveItemCategory from "@/models/archive-item-category"
import ArchiveItemFile from "@/models/archive-item-file"
import ArchiveItemInformationSharingAgreementAccessGrant from "@/models/archive-item-information-sharing-agreement-access-grant"
import Attachment from "@/models/attachment"
import Category from "@/models/category"
import ExternalOrganization from "@/models/external-organization"
import Group from "@/models/group"
import InformationSharingAgreement from "@/models/information-sharing-agreement"
import InformationSharingAgreementAccessGrant from "@/models/information-sharing-agreement-access-grant"
import InformationSharingAgreementAccessGrantSibling from "@/models/information-sharing-agreement-access-grant-sibling"
import InformationSharingAgreementArchiveItem from "@/models/information-sharing-agreement-archive-item"
import InformationSharingAgreementAudit from "@/models/information-sharing-agreement-audit"
import Notification from "@/models/notification"
import Retention from "@/models/retention"
import User from "@/models/user"
import UserGroup from "@/models/user-group"

db.addModels([
  ArchiveItem,
  ArchiveItemAudit,
  ArchiveItemCategory,
  ArchiveItemFile,
  ArchiveItemInformationSharingAgreementAccessGrant,
  Attachment,
  Category,
  ExternalOrganization,
  Group,
  InformationSharingAgreement,
  InformationSharingAgreementAccessGrant,
  InformationSharingAgreementAccessGrantSibling,
  InformationSharingAgreementArchiveItem,
  InformationSharingAgreementAudit,
  Notification,
  Retention,
  User,
  UserGroup,
])

// Lazy load scopes
ArchiveItem.establishScopes()
ArchiveItemAudit.establishScopes()
ArchiveItemCategory.establishScopes()
ArchiveItemFile.establishScopes()
Attachment.establishScopes()
Category.establishScopes()
ExternalOrganization.establishScopes()
Group.establishScopes()
InformationSharingAgreement.establishScopes()
InformationSharingAgreementAccessGrant.establishScopes()
InformationSharingAgreementArchiveItem.establishScopes()
InformationSharingAgreementAudit.establishScopes()
Notification.establishScopes()
Retention.establishScopes()
User.establishScopes()
UserGroup.establishScopes()

export {
  ArchiveItem,
  ArchiveItemAudit,
  ArchiveItemCategory,
  ArchiveItemFile,
  ArchiveItemInformationSharingAgreementAccessGrant,
  Attachment,
  Category,
  ExternalOrganization,
  Group,
  InformationSharingAgreement,
  InformationSharingAgreementAccessGrant,
  InformationSharingAgreementAccessGrantSibling,
  InformationSharingAgreementArchiveItem,
  InformationSharingAgreementAudit,
  Notification,
  Retention,
  User,
  UserGroup,
}

// Special db instance will all models loaded
export default db
