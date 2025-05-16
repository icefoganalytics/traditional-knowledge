<template>
  <v-form
    ref="form"
    @submit.prevent="saveWrapper"
  >
    <v-card>
      <v-card-title>New Information Sharing Agreement</v-card-title>
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="12"
          >
            <v-text-field
              v-model="informationSharingAgreementAttributes.title"
              label="Title *"
              :rules="[required]"
              required
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              v-model="informationSharingAgreementAttributes.description"
              label="Description"
              auto-grow
              clearable
              rows="6"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <GroupSearchableAutocomplete
              v-model="informationSharingAgreementAttributes.sharingGroupId"
              label="Sharing Group *"
              :rules="[required]"
              :where="sharingGroupWhere"
              :filters="sharingGroupFilters"
              required
              @update:model-value="resetSharingGroupContact"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <UserSearchableAutocomplete
              v-model="informationSharingAgreementAttributes.sharingGroupContactId"
              label="Sharing Group Contact *"
              :disabled="isNil(informationSharingAgreementAttributes.sharingGroupId)"
              :filters="sharingGroupContactFilters"
              :rules="[required]"
              required
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <GroupSearchableAutocomplete
              v-model="informationSharingAgreementAttributes.receivingGroupId"
              label="Receiving Group *"
              :rules="[required]"
              :where="receivingGroupWhere"
              required
              @update:model-value="resetReceivingGroupContact"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <UserSearchableAutocomplete
              v-model="informationSharingAgreementAttributes.receivingGroupContactId"
              label="Receiving Group Contact *"
              :rules="[required]"
              :disabled="isNil(informationSharingAgreementAttributes.receivingGroupId)"
              :filters="receivingGroupContactFilters"
              required
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <!-- TODO: consider using a v-date-input range type? -->
            <v-date-input
              v-model="informationSharingAgreementAttributes.startDate"
              label="Start Date *"
              :rules="[required]"
              :max="informationSharingAgreementAttributes.endDate"
              required
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-date-input
              v-model="informationSharingAgreementAttributes.endDate"
              label="End Date *"
              :rules="[required]"
              :min="informationSharingAgreementAttributes.startDate"
              required
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col class="d-flex justify-end">
            <v-btn
              :loading="isLoading"
              color="secondary"
              variant="outlined"
              :to="{
                name: 'administration/InformationSharingAgreementsPage',
              }"
            >
              Cancel
            </v-btn>
            <v-spacer />
            <v-btn
              class="ml-3"
              :loading="isLoading"
              type="submit"
              color="primary"
            >
              Create
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import { VForm } from "vuetify/lib/components/index.mjs"

import { required } from "@/utils/validators"
import informationSharingAgreementsApi, {
  type InformationSharingAgreement,
} from "@/api/information-sharing-agreements-api"

import useCurrentUser from "@/use/use-current-user"
import useSnack from "@/use/use-snack"

import GroupSearchableAutocomplete from "@/components/groups/GroupSearchableAutocomplete.vue"
import UserSearchableAutocomplete from "@/components/users/UserSearchableAutocomplete.vue"

const informationSharingAgreementAttributes = ref<Partial<InformationSharingAgreement>>({
  title: undefined,
  description: undefined,
  startDate: undefined,
  endDate: undefined,
  sharingGroupId: undefined,
  sharingGroupContactId: undefined,
  receivingGroupId: undefined,
  receivingGroupContactId: undefined,
})

const sharingGroupWhere = computed(() => ({
  isHost: false,
}))
const { currentUser } = useCurrentUser<true>()
const sharingGroupFilters = computed(() => ({
  isAdmin: currentUser.value.id,
}))
const sharingGroupContactFilters = computed(() => ({
  inGroup: informationSharingAgreementAttributes.value.sharingGroupId,
}))

function resetSharingGroupContact() {
  informationSharingAgreementAttributes.value.sharingGroupContactId = undefined
}

const receivingGroupWhere = computed(() => ({
  isHost: true,
}))
const receivingGroupContactFilters = computed(() => ({
  inGroup: informationSharingAgreementAttributes.value.receivingGroupId,
}))

function resetReceivingGroupContact() {
  informationSharingAgreementAttributes.value.receivingGroupContactId = undefined
}

const form = ref<InstanceType<typeof VForm> | null>(null)
const isLoading = ref(false)
const snack = useSnack()
const router = useRouter()

async function saveWrapper() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.error("Please fill out all required fields")
    return
  }

  isLoading.value = true
  try {
    await informationSharingAgreementsApi.create(informationSharingAgreementAttributes.value)
    snack.success("Information Sharing Agreement created.")
    router.push({
      name: "administration/InformationSharingAgreementsPage",
    })
  } catch (error) {
    console.error(`Failed to create information sharing agreement: ${error}`, { error })
    snack.error(`Failed to create information sharing agreement: ${error}`)
  } finally {
    isLoading.value = false
  }
}
</script>
