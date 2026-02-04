<script setup lang="ts">
const emit = defineEmits<{
  'sign-in': []
  'sign-up': []
}>()

function handleSignIn() {
  emit('sign-in')
  // Future: Open sign in modal
  console.log('Sign in clicked')
}

function handleSignUp() {
  emit('sign-up')
  // Future: Open sign up modal
  console.log('Sign up clicked')
}
</script>

<template>
  <v-menu>
    <template #activator="{props}">
      <v-btn
        icon="mdi-account-circle"
        variant="text"
        v-bind="props"
      />
    </template>

    <v-list>
      <v-list-item
        prepend-icon="mdi-login"
        title="Sign In"
        @click="handleSignIn"
      />

      <v-list-item
        prepend-icon="mdi-account-plus"
        title="Sign Up"
        @click="handleSignUp"
      />

      <v-divider />

      <v-list-item
        prepend-icon="mdi-information"
        title="About"
        disabled
      />
    </v-list>
  </v-menu>
</template>
