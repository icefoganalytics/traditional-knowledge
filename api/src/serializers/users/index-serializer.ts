import { isNil, pick } from "lodash"

import { User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import { ExternalOrganizations } from "@/serializers"

export type UserIndexView = Pick<
  User,
  | "id"
  | "email"
  | "auth0Subject"
  | "activeDirectoryIdentifier"
  | "isExternal"
  | "externalOrganizationId"
  | "firstName"
  | "lastName"
  | "displayName"
  | "roles"
  | "title"
  | "department"
  | "division"
  | "branch"
  | "unit"
  | "phoneNumber"
  | "lastSyncSuccessAt"
  | "lastSyncFailureAt"
  | "deactivatedAt"
  | "deactivationReason"
  | "lastActiveAt"
  | "emailNotificationsEnabled"
  | "creatorId"
  | "createdAt"
  | "updatedAt"
> & {
  isActive: boolean
  /** Which Yukon First Nation or Indigenous Government an external user belongs to. */
  externalOrganization: ExternalOrganizations.AsReference | null
}

export class IndexSerializer extends BaseSerializer<User> {
  perform(): UserIndexView {
    const { externalOrganization } = this.record

    return {
      ...pick(this.record, [
        "id",
        "email",
        "auth0Subject",
        "activeDirectoryIdentifier",
        "isExternal",
        "externalOrganizationId",
        "firstName",
        "lastName",
        "displayName",
        "roles",
        "title",
        "department",
        "division",
        "branch",
        "unit",
        "phoneNumber",
        "lastSyncSuccessAt",
        "lastSyncFailureAt",
        "deactivatedAt",
        "deactivationReason",
        "lastActiveAt",
        "emailNotificationsEnabled",
        "creatorId",
        "createdAt",
        "updatedAt",
      ]),
      isActive: isNil(this.record.deactivatedAt),
      externalOrganization: isNil(externalOrganization)
        ? null
        : ExternalOrganizations.ReferenceSerializer.perform(externalOrganization),
    }
  }
}

export default IndexSerializer
