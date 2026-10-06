import db from "@/db/db-client"

// Models
import KnowledgeItemFile from "@/models/knowledge-item-file"

db.addModels([KnowledgeItemFile])

// Lazy load scopes
KnowledgeItemFile.establishScopes()

export { KnowledgeItemFile }

// Special db instance will all models loaded
export default db
