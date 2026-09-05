import { InformationSharingAgreement } from "@/models"
import { PolicyFactory } from "@/policies/base-policy"

export class RevertToDraftPolicy extends PolicyFactory(InformationSharingAgreement) {
  create(): boolean {
    if (!this.record.isSigned()) return false

    if (this.user.id === this.record.creatorId) return true
    if (this.user.isSystemAdmin) return true
    if (this.record.hasAccessGrantFor(this.user.id)) return true

    return false
  }
}
