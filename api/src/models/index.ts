import db from "@/db/db-client"

// Models
import ArchiveItem from "@/models/archive-item"
import ArchiveItemAudit from "@/models/archive-item-audit"
import ArchiveItemCategory from "@/models/archive-item-category"
import ArchiveItemFile from "@/models/archive-item-file"
import Category from "@/models/category"
import Group from "@/models/group"
import Retention from "@/models/retention"
import Source from "@/models/source"
import SourceCategory from "@/models/source-category"
import User from "@/models/user"
import UserGroup from "@/models/user-group"
import UserPermission from "@/models/user-permission"

db.addModels([
  ArchiveItem,
  ArchiveItemAudit,
  ArchiveItemCategory,
  ArchiveItemFile,
  Category,
  Group,
  Retention,
  Source,
  SourceCategory,
  User,
  UserGroup,
  UserPermission,
])

// Lazy load scopes
ArchiveItem.establishScopes()
ArchiveItemAudit.establishScopes()
ArchiveItemCategory.establishScopes()
ArchiveItemFile.establishScopes()
Category.establishScopes()
Group.establishScopes()
Retention.establishScopes()
Source.establishScopes()
SourceCategory.establishScopes()
User.establishScopes()
UserGroup.establishScopes()
UserPermission.establishScopes()

export {
  ArchiveItem,
  ArchiveItemAudit,
  ArchiveItemCategory,
  ArchiveItemFile,
  Category,
  Group,
  Retention,
  Source,
  SourceCategory,
  User,
  UserGroup,
  UserPermission,
}

// Special db instance will all models loaded
export default db
