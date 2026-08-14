import { isNil, isUndefined, pick } from "lodash"

import { User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"
import {
  ExternalOrganizations,
  Groups,
  InformationSharingAgreementAccessGrants,
} from "@/serializers"

export type UserAsShow = Pick<
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
} & {
  adminGroups: Groups.AsReference[]
  adminInformationSharingAgreementAccessGrants: InformationSharingAgreementAccessGrants.AsReference[]
  /** Which Yukon First Nation or Indigenous Government an external user belongs to. */
  externalOrganization: ExternalOrganizations.AsReference | null
}

export class ShowSerializer extends BaseSerializer<User> {
  perform(): UserAsShow {
    const { adminGroups, adminInformationSharingAgreementAccessGrants, externalOrganization } =
      this.record
    if (isUndefined(adminGroups)) {
      throw new Error("Expected adminGroups association to be preloaded")
    }

    const serializedAdminGroups = Groups.ReferenceSerializer.perform(adminGroups)

    if (isUndefined(adminInformationSharingAgreementAccessGrants)) {
      throw new Error(
        "Expected adminInformationSharingAgreementAccessGrants association to be preloaded"
      )
    }

    const serializedAdminInformationSharingAgreementAccessGrants =
      InformationSharingAgreementAccessGrants.ReferenceSerializer.perform(
        adminInformationSharingAgreementAccessGrants
      )

    const isActive = isNil(this.record.deactivatedAt)

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
      isActive,
      adminGroups: serializedAdminGroups,
      adminInformationSharingAgreementAccessGrants:
        serializedAdminInformationSharingAgreementAccessGrants,
      externalOrganization: isNil(externalOrganization)
        ? null
        : ExternalOrganizations.ReferenceSerializer.perform(externalOrganization),
    }
  }
}

export default ShowSerializer
