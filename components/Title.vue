<template>
  <text class="mb-20 mt-80 inline-block brand-color-title">{{ content }}</text>
</template>

<script setup>
defineProps({
  content: {
    type: String,
    required: true,
  },
});
</script>

<style scoped></style>
