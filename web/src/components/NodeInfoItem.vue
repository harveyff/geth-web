<template>
  <div>
    <div class="card-title label">{{ label }}</div>
    <div class="card-text content" :style="{ color: color }">{{ content }}</div>
    <div v-if="comment" class="conment">{{ comment }}</div>
  </div>
</template>
<script setup>
import { defineProps } from "vue";
defineProps({
  label: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "#1A130F", //Syncing...    SToped  #E84E40;
    required: false,
  },
  content: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: false,
  },
});
</script>
<style scoped>
.label {
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 14px;
  color: #847c77;
}
.content {
  font-family: "Roboto";
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 16px;
  color: #1a130f;
  margin-top: 8px;
  margin-bottom: 4px;
}
</style>
