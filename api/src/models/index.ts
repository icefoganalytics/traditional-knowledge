import db from "@/db/db-client"

// Models
import ArchiveItem from "@/models/archive-item"
import ArchiveItemAudit from "@/models/archive-item-audit"
import ArchiveItemFile from "@/models/archive-item-file"
import Group from "@/models/group"
import InformationSharingAgreement from "@/models/information-sharing-agreement"
import InformationSharingAgreementAccessGrant from "@/models/information-sharing-agreement-access-grant"
import InformationSharingAgreementAccessGrantSibling from "@/models/information-sharing-agreement-access-grant-sibling"
import Notification from "@/models/notification"
import User from "@/models/user"
import UserGroup from "@/models/user-group"

db.addModels([
  ArchiveItem,
  ArchiveItemAudit,
  ArchiveItemFile,
  Group,
  InformationSharingAgreement,
  InformationSharingAgreementAccessGrant,
  InformationSharingAgreementAccessGrantSibling,
  Notification,
  User,
  UserGroup,
])

// Lazy load scopes
ArchiveItem.establishScopes()
ArchiveItemAudit.establishScopes()
ArchiveItemFile.establishScopes()
Group.establishScopes()
InformationSharingAgreement.establishScopes()
InformationSharingAgreementAccessGrant.establishScopes()
Notification.establishScopes()
User.establishScopes()
UserGroup.establishScopes()

export {
  ArchiveItem,
  ArchiveItemAudit,
  ArchiveItemFile,
  Group,
  InformationSharingAgreement,
  InformationSharingAgreementAccessGrant,
  InformationSharingAgreementAccessGrantSibling,
  Notification,
  User,
  UserGroup,
}

// Special db instance will all models loaded
export default db
