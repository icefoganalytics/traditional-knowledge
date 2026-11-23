<template>
  <v-card>
    <v-card-title class="bg-grey-lighten-4 d-flex align-center ga-3 px-6 py-4 text-wrap">
      <slot name="title">
        <v-icon color="accent">mdi-information-outline</v-icon>
        Review the information below to confirm this is the ISA to which you intend to add
        Traditional Knowledge (TK)
      </slot>
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-6 pa-md-8">
      <div class="mb-6">
        <div class="text-body-2 text-grey-darken-1 mb-2">ISA title</div>
        <div class="text-h5 font-weight-bold">{{ title }}</div>
      </div>

      <div class="mb-6">
        <div class="text-body-2 text-grey-darken-1 mb-2">
          The TK is being provided for the purpose of informing:
        </div>
        <div class="text-body-1 text-grey-darken-3 whitespace-pre-wrap">
          {{ purpose || "Not specified" }}
        </div>
      </div>

      <v-divider class="my-6" />

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <div class="d-flex align-center ga-2 mb-4">
            <v-icon
              size="small"
              color="primary"
            >
              mdi-account-group
            </v-icon>
            <span class="font-weight-bold text-primary">
              Yukon First Nation or Indigenous Government contact
            </span>
          </div>
          <div class="mb-3">
            <div class="text-body-2 text-grey-darken-1 mb-1">Contact name</div>
            <span
              v-if="isNil(externalGroupContactId)"
              class="font-weight-medium"
              >Not specified</span
            >
            <UserChip
              v-else
              :user-id="externalGroupContactId"
            />
          </div>
          <div class="mb-3">
            <div class="text-body-2 text-grey-darken-1 mb-1">Title</div>
            <div class="font-weight-medium">{{ externalGroupContactTitle || "Not specified" }}</div>
          </div>
          <div class="mb-3">
            <div class="text-body-2 text-grey-darken-1 mb-1">Email</div>
            <div class="font-weight-medium">
              {{ externalGroupContact?.email || "Not specified" }}
            </div>
          </div>
          <div>
            <div class="text-body-2 text-grey-darken-1 mb-1">
              Yukon First Nation or Indigenous Government
            </div>
            <div class="font-weight-medium">
              {{ externalGroupContact?.externalOrganization?.name || "Not specified" }}
            </div>
          </div>
        </v-col>

        <v-col
          cols="12"
          md="6"
        >
          <div class="d-flex align-center ga-2 mb-4">
            <v-icon
              size="small"
              color="primary"
            >
              mdi-bank
            </v-icon>
            <span class="font-weight-bold text-primary">YG contact</span>
          </div>
          <div class="mb-3">
            <div class="text-body-2 text-grey-darken-1 mb-1">YG contact name</div>
            <span
              v-if="isNil(internalGroupContactId)"
              class="font-weight-medium"
              >Not specified</span
            >
            <UserChip
              v-else
              :user-id="internalGroupContactId"
            />
          </div>
          <div class="mb-3">
            <div class="text-body-2 text-grey-darken-1 mb-1">Title</div>
            <div class="font-weight-medium">
              {{ internalGroupContactTitle || "Not specified" }}
            </div>
          </div>
          <div>
            <div class="text-body-2 text-grey-darken-1 mb-1">YG manager</div>
            <span
              v-if="isNil(internalGroupSecondaryContactId)"
              class="font-weight-medium"
              >Not specified</span
            >
            <UserChip
              v-else
              :user-id="internalGroupSecondaryContactId"
            />
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { toRefs } from "vue"
import { isNil } from "lodash"

import useUser from "@/use/use-user"

import UserChip from "@/components/users/UserChip.vue"

const props = defineProps<{
  title: string | null | undefined
  purpose: string | null | undefined
  externalGroupContactId: number | null | undefined
  externalGroupContactTitle: string | null | undefined
  internalGroupContactId: number | null | undefined
  internalGroupContactTitle: string | null | undefined
  internalGroupSecondaryContactId: number | null | undefined
}>()

// The First Nation or Indigenous Government is captured on the external user, so it is
// read from there rather than duplicated onto the agreement. See TK-69.
const { externalGroupContactId } = toRefs(props)
const { user: externalGroupContact } = useUser(externalGroupContactId)
</script>

<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap; /* preserves line breaks and wraps text if it's too long */
}
</style>
