<template>
  <v-card>
    <v-card-title>Basic Information</v-card-title>
    <v-divider />
    <v-card-text>
      <v-row class="mt-4">
        <v-col
          cols="12"
          md="8"
        >
          <v-text-field
            :model-value="title"
            label="Title *"
            :rules="[required]"
            required
            @update:model-value="emit('update:title', $event)"
          />
        </v-col>
        <v-col cols="12">
          <v-textarea
            :model-value="purpose"
            label="What is the purpose, work, program, decision, or project this Traditional Knowledge (TK) will inform? *"
            :rules="[required]"
            required
            auto-grow
            rows="8"
            @update:model-value="emit('update:purpose', $event)"
          />
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col
          cols="12"
          md="6"
        >
          <UserSearchableAutocomplete
            :model-value="externalGroupContactId"
            label="Yukon First Nation or Indigenous Government Contact Name *"
            :where="externalGroupContactWhere"
            :rules="[required]"
            required
            @click:clear="updateExternalGroupContactTitle(null)"
            @selected="updateExternalGroupContactTitle"
            @update:model-value="emit('update:externalGroupContactId', $event)"
          />
          <!-- Surfaces what is already captured on the selected external user. See TK-69. -->
          <v-alert
            v-if="!isNil(externalGroupContact)"
            class="mt-2"
            density="compact"
            type="info"
            variant="tonal"
          >
            <div>Email: {{ externalGroupContact.email }}</div>
            <div>
              Yukon First Nation or Indigenous Government:
              {{ externalGroupContact.externalOrganization?.name ?? "Not specified" }}
            </div>
          </v-alert>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            :model-value="externalGroupContactTitle"
            label="Yukon First Nation or Indigenous Government Contact Title *"
            :rules="[required]"
            required
            @update:model-value="emit('update:externalGroupContactTitle', $event)"
          />
        </v-col>
      </v-row>

      <v-row class="mt-4">
        <v-col
          cols="12"
          md="6"
        >
          <UserSearchableAutocomplete
            :model-value="internalGroupContactId"
            label="Yukon Government (YG) Contact Name *"
            :where="internalGroupContactWhere"
            :rules="[required]"
            required
            @click:clear="updateInternalGroupContactTitle(null)"
            @selected="updateInternalGroupContactTitle"
            @update:model-value="emit('update:internalGroupContactId', $event)"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-text-field
            :model-value="internalGroupContactTitle"
            label="Yukon Government (YG) Contact Title *"
            :rules="[required]"
            required
            @update:model-value="emit('update:internalGroupContactTitle', $event)"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <UserSearchableAutocomplete
            :model-value="internalGroupSecondaryContactId"
            label="Yukon Government (YG) Manager Contact Name *"
            :where="internalGroupSecondaryContactWhere"
            hint="Typically the manager of the primary YG contact, but can be any appropriate internal contact."
            :rules="[required]"
            required
            @update:model-value="emit('update:internalGroupSecondaryContactId', $event)"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { computed, toRefs } from "vue"

import { required } from "@/utils/validators"
import useUser from "@/use/use-user"

import UserSearchableAutocomplete, {
  type UserAsIndex,
} from "@/components/users/UserSearchableAutocomplete.vue"

const props = defineProps<{
  title: string | null | undefined
  purpose: string | null | undefined
  externalGroupContactId: number | null | undefined
  externalGroupContactTitle: string | null | undefined
  internalGroupContactId: number | null | undefined
  internalGroupContactTitle: string | null | undefined
  internalGroupSecondaryContactId: number | null | undefined
}>()

const emit = defineEmits<{
  "update:title": [value: string | null | undefined]
  "update:purpose": [value: string | null | undefined]
  "update:externalGroupContactId": [value: number | null | undefined]
  "update:externalGroupContactTitle": [value: string | null | undefined]
  "update:internalGroupContactId": [value: number | null | undefined]
  "update:internalGroupContactTitle": [value: string | null | undefined]
  "update:internalGroupSecondaryContactId": [value: number | null | undefined]
}>()

const { externalGroupContactId } = toRefs(props)
const { user: externalGroupContact } = useUser(externalGroupContactId)

const externalGroupContactWhere = computed(() => ({
  isExternal: true,
}))
const internalGroupContactWhere = computed(() => ({
  isExternal: false,
}))
const internalGroupSecondaryContactWhere = computed(() => ({
  isExternal: false,
}))

function updateExternalGroupContactTitle(user: UserAsIndex | null) {
  if (isNil(user)) {
    emit("update:externalGroupContactTitle", null)
  } else {
    emit("update:externalGroupContactTitle", user.title)
  }
}

function updateInternalGroupContactTitle(user: UserAsIndex | null) {
  if (isNil(user)) {
    emit("update:internalGroupContactTitle", null)
  } else {
    emit("update:internalGroupContactTitle", user.title)
  }
}
</script>
