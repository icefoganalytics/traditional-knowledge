<template>
  <v-card
    class="border"
    title="Administration"
  >
    <v-card-text>
      <v-row>
        <v-col
          cols="12"
          md="3"
        >
          <v-card
            class="toggle fill-height"
            :to="{
              name: 'users/UsersPage',
            }"
          >
            <v-card-text class="d-flex">
              <span class="d-sm-flex align-center me-3 d-none">
                <v-icon size="50px">mdi-account</v-icon>
              </span>

              <div>
                <div class="text-h6">Users</div>
                <span class="text-subtitle-2">Manage Current Users</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-card
            class="toggle fill-height"
            :to="{
              name: 'administration/GroupsPage',
            }"
          >
            <v-card-text class="d-flex">
              <span class="d-sm-flex align-center me-3 d-none">
                <v-icon size="50px">mdi-account-group</v-icon>
              </span>

              <div>
                <div class="text-h6">Groups</div>
                <span class="text-subtitle-2">Manage Current Groups</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="3"
        >
          <v-card
            class="toggle fill-height"
            :to="{
              name: 'administration/RetentionsPage',
            }"
          >
            <v-card-text class="d-flex">
              <span class="d-sm-flex align-center me-3 d-none">
                <v-icon size="50px">mdi-file-minus</v-icon>
              </span>

              <div>
                <div class="text-h6">Retentions</div>
                <span class="text-subtitle-2">Manage Current Retentions</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="3"
        >
          <v-card
            class="toggle fill-height"
            :to="{
              name: 'administration/CategoriesPage',
            }"
          >
            <v-card-text class="d-flex">
              <span class="d-sm-flex align-center me-3 d-none">
                <v-icon size="50px">mdi-view-list</v-icon>
              </span>

              <div>
                <div class="text-h6">Categories</div>
                <span class="text-subtitle-2">Manage Current Categories</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="3"
        >
          <v-card
            class="toggle fill-height"
            :to="{
              name: 'administration/InformationSharingAgreementsPage',
            }"
          >
            <v-card-text class="d-flex">
              <span class="d-sm-flex align-center me-3 d-none">
                <v-icon size="50px">mdi-file-sign</v-icon>
              </span>

              <div>
                <div class="text-h6">Agreements</div>
                <span class="text-subtitle-2">Information Sharing Agreements</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

useBreadcrumbs("Administration Dashboard", [])
</script>
