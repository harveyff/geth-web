<template>
  <div class="rpc-caller">
    <option-title title="RPC Caller" />
    <div class="rpc-caller-content">
      <div class="row q-gutter-md">
        <div class="col-12">
          <q-input
            v-model="methodName"
            label="Method Name"
            placeholder="e.g., eth_blockNumber, eth_getBalance"
            outlined
            dense
          >
            <template v-slot:append>
              <q-icon name="code" />
            </template>
            <template v-slot:hint>
              <div class="text-caption">
                Common methods:
                <q-btn
                  flat
                  dense
                  size="sm"
                  label="eth_blockNumber"
                  @click="setMethod('eth_blockNumber', '[]')"
                  class="q-ml-xs"
                />
                <q-btn
                  flat
                  dense
                  size="sm"
                  label="eth_gasPrice"
                  @click="setMethod('eth_gasPrice', '[]')"
                  class="q-ml-xs"
                />
                <q-btn
                  flat
                  dense
                  size="sm"
                  label="net_peerCount"
                  @click="setMethod('net_peerCount', '[]')"
                  class="q-ml-xs"
                />
              </div>
            </template>
          </q-input>
        </div>
        <div class="col-12">
          <q-input
            v-model="paramsJson"
            label="Parameters (JSON array)"
            placeholder='e.g., ["0x1234...", "latest"] or []'
            outlined
            dense
            type="textarea"
            rows="3"
          />
        </div>
        <div class="col-12">
          <q-btn
            color="primary"
            label="Call RPC"
            @click="callRpc"
            :loading="isLoading"
            :disable="!methodName"
            class="full-width"
          />
        </div>
        <div v-if="result || error" class="col-12">
          <q-card flat bordered>
            <q-card-section>
              <div class="text-subtitle2 q-mb-sm">
                {{ error ? "Error" : "Result" }}
              </div>
              <q-separator class="q-mb-sm" />
              <pre class="result-content">{{ error || result }}</pre>
            </q-card-section>
            <q-card-actions v-if="result || error">
              <q-btn
                flat
                label="Clear"
                @click="clearResult"
                color="negative"
                size="sm"
              />
              <q-btn
                flat
                label="Copy"
                @click="copyResult"
                color="primary"
                size="sm"
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import OptionTitle from "components/OptionTitle.vue";
import { useQuasar } from "quasar";

const $q = useQuasar();

const props = defineProps({
  rpcProvider: {
    type: Object,
    required: false,
    default: null,
  },
});

const methodName = ref("");
const paramsJson = ref("[]");
const result = ref("");
const error = ref("");
const isLoading = ref(false);

const callRpc = async () => {
  if (!props.rpcProvider) {
    error.value = "RPC provider not available. Please wait for the connection to be established.";
    $q.notify({
      type: "negative",
      message: "RPC provider not available",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  isLoading.value = true;
  result.value = "";
  error.value = "";

  try {
    let params = [];
    if (paramsJson.value.trim()) {
      params = JSON.parse(paramsJson.value);
    }

    let response;
    if (params.length === 0) {
      response = await props.rpcProvider.send(methodName.value);
    } else {
      response = await props.rpcProvider.send(methodName.value, params);
    }

    result.value = JSON.stringify(response, null, 2);
  } catch (err) {
    error.value = err.message || String(err);
    result.value = "";
  } finally {
    isLoading.value = false;
  }
};

const clearResult = () => {
  result.value = "";
  error.value = "";
};

const copyResult = () => {
  const textToCopy = error.value || result.value;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      $q.notify({
        type: "positive",
        message: "Copied to clipboard",
        position: "top",
        timeout: 1000,
      });
    });
  }
};

const setMethod = (method, params) => {
  methodName.value = method;
  paramsJson.value = params;
};
</script>

<style lang="scss" scoped>
.rpc-caller {
  margin-top: 12px;
  margin-bottom: 12px;
}

.rpc-caller-content {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
}

.result-content {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-family: "Courier New", monospace;
  font-size: 12px;
  max-height: 400px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}
</style>

