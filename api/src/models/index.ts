import db from "@/db/db-client"

// Models
import KnowledgeItem from "@/models/knowledge-item"
import KnowledgeItemAudit from "@/models/knowledge-item-audit"
import KnowledgeItemCategory from "@/models/knowledge-item-category"
import KnowledgeItemFile from "@/models/knowledge-item-file"
import KnowledgeItemInformationSharingAgreementAccessGrant from "@/models/knowledge-item-information-sharing-agreement-access-grant"
import Attachment from "@/models/attachment"
import Category from "@/models/category"
import ExternalOrganization from "@/models/external-organization"
import Group from "@/models/group"
import InformationSharingAgreement from "@/models/information-sharing-agreement"
import InformationSharingAgreementAccessGrant from "@/models/information-sharing-agreement-access-grant"
import InformationSharingAgreementAccessGrantSibling from "@/models/information-sharing-agreement-access-grant-sibling"
import InformationSharingAgreementKnowledgeItem from "@/models/information-sharing-agreement-knowledge-item"
import InformationSharingAgreementAudit from "@/models/information-sharing-agreement-audit"
import Notification from "@/models/notification"
import Retention from "@/models/retention"
import User from "@/models/user"
import UserGroup from "@/models/user-group"

db.addModels([
  KnowledgeItem,
  KnowledgeItemAudit,
  KnowledgeItemCategory,
  KnowledgeItemFile,
  KnowledgeItemInformationSharingAgreementAccessGrant,
  Attachment,
  Category,
  ExternalOrganization,
  Group,
  InformationSharingAgreement,
  InformationSharingAgreementAccessGrant,
  InformationSharingAgreementAccessGrantSibling,
  InformationSharingAgreementKnowledgeItem,
  InformationSharingAgreementAudit,
  Notification,
  Retention,
  User,
  UserGroup,
])

// Lazy load scopes
KnowledgeItem.establishScopes()
KnowledgeItemAudit.establishScopes()
KnowledgeItemCategory.establishScopes()
KnowledgeItemFile.establishScopes()
Attachment.establishScopes()
Category.establishScopes()
ExternalOrganization.establishScopes()
Group.establishScopes()
InformationSharingAgreement.establishScopes()
InformationSharingAgreementAccessGrant.establishScopes()
InformationSharingAgreementKnowledgeItem.establishScopes()
InformationSharingAgreementAudit.establishScopes()
Notification.establishScopes()
Retention.establishScopes()
User.establishScopes()
UserGroup.establishScopes()

export {
  KnowledgeItem,
  KnowledgeItemAudit,
  KnowledgeItemCategory,
  KnowledgeItemFile,
  KnowledgeItemInformationSharingAgreementAccessGrant,
  Attachment,
  Category,
  ExternalOrganization,
  Group,
  InformationSharingAgreement,
  InformationSharingAgreementAccessGrant,
  InformationSharingAgreementAccessGrantSibling,
  InformationSharingAgreementKnowledgeItem,
  InformationSharingAgreementAudit,
  Notification,
  Retention,
  User,
  UserGroup,
}

// Special db instance will all models loaded
export default db
