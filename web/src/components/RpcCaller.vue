<template>
  <div class="rpc-caller">
    <option-title title="RPC Caller" />
    <div class="rpc-caller-content">
      <div class="row q-gutter-md">
        <div class="col-12">
          <q-select
            v-model="methodName"
            :options="commonMethods"
            label="Method Name"
            placeholder="Select a method or type custom method name"
            outlined
            dense
            use-input
            input-debounce="0"
            @new-value="createValue"
            @filter="filterMethods"
            @update:model-value="onMethodChange"
            option-label="label"
            option-value="value"
            emit-value
            map-options
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No methods found
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
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
import { ref, computed } from "vue";
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

// 常用 RPC 方法列表
const allMethods = [
  { label: "eth_blockNumber", value: "eth_blockNumber", description: "Get the latest block number", params: "[]" },
  { label: "eth_gasPrice", value: "eth_gasPrice", description: "Get the current gas price", params: "[]" },
  { label: "net_peerCount", value: "net_peerCount", description: "Get the number of peers", params: "[]" },
  { label: "eth_getBalance", value: "eth_getBalance", description: "Get balance of an address", params: '["0x...", "latest"]' },
  { label: "eth_getTransactionCount", value: "eth_getTransactionCount", description: "Get transaction count (nonce)", params: '["0x...", "latest"]' },
  { label: "eth_getBlockByNumber", value: "eth_getBlockByNumber", description: "Get block by number", params: '["0x1", false]' },
  { label: "eth_getBlockByHash", value: "eth_getBlockByHash", description: "Get block by hash", params: '["0x...", false]' },
  { label: "eth_getTransactionByHash", value: "eth_getTransactionByHash", description: "Get transaction by hash", params: '["0x..."]' },
  { label: "eth_getTransactionReceipt", value: "eth_getTransactionReceipt", description: "Get transaction receipt", params: '["0x..."]' },
  { label: "eth_call", value: "eth_call", description: "Execute a message call", params: '[{"to": "0x...", "data": "0x..."}, "latest"]' },
  { label: "eth_estimateGas", value: "eth_estimateGas", description: "Estimate gas for a transaction", params: '[{"to": "0x...", "data": "0x..."}]' },
  { label: "eth_syncing", value: "eth_syncing", description: "Check if node is syncing", params: "[]" },
  { label: "net_version", value: "net_version", description: "Get network ID", params: "[]" },
  { label: "net_listening", value: "net_listening", description: "Check if node is listening", params: "[]" },
  { label: "web3_clientVersion", value: "web3_clientVersion", description: "Get client version", params: "[]" },
  { label: "eth_getCode", value: "eth_getCode", description: "Get contract code", params: '["0x...", "latest"]' },
  { label: "eth_getStorageAt", value: "eth_getStorageAt", description: "Get storage at position", params: '["0x...", "0x0", "latest"]' },
  { label: "eth_getLogs", value: "eth_getLogs", description: "Get event logs", params: '[{"fromBlock": "latest", "toBlock": "latest"}]' },
];

const commonMethods = ref([...allMethods]);

const filterMethodFunction = (val, update) => {
  if (val === "") {
    update(() => {
      commonMethods.value = allMethods;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    commonMethods.value = allMethods.filter(
      (v) => v.label.toLowerCase().indexOf(needle) > -1 || v.description.toLowerCase().indexOf(needle) > -1
    );
  });
};

const filterMethods = (val, update) => {
  filterMethodFunction(val, update);
};

const createValue = (val, done) => {
  if (val.length > 0) {
    // 如果输入的是新值，直接使用
    methodName.value = val;
    done(val, "add");
  }
};

// 监听方法选择变化，自动填充参数
const selectedMethod = computed(() => {
  return allMethods.find((m) => m.value === methodName.value);
});

// 当选择方法时，自动填充参数
const onMethodChange = (value) => {
  if (value) {
    methodName.value = value;
    const method = allMethods.find((m) => m.value === value);
    if (method) {
      paramsJson.value = method.params;
    }
  }
};

const callRpc = async () => {
  // 处理响应式 ref 或直接对象
  const provider = props.rpcProvider?.value || props.rpcProvider;
  
  if (!provider) {
    error.value = "RPC provider not available. Please wait for the connection to be established.";
    $q.notify({
      type: "negative",
      message: "RPC provider not available",
      position: "top",
      timeout: 2000,
    });
    return;
  }

  if (!methodName.value) {
    error.value = "Please select or enter a method name";
    $q.notify({
      type: "negative",
      message: "Method name is required",
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
      try {
        params = JSON.parse(paramsJson.value);
      } catch (parseError) {
        error.value = `Invalid JSON parameters: ${parseError.message}`;
        isLoading.value = false;
        return;
      }
    }

    let response;
    try {
      if (params.length === 0) {
        response = await provider.send(methodName.value);
      } else {
        response = await provider.send(methodName.value, params);
      }
      result.value = JSON.stringify(response, null, 2);
    } catch (sendError) {
      // 检查是否是浏览器扩展导致的 private field 错误
      const errorStr = sendError ? (
        (sendError.message || '') + ' ' + 
        (sendError.toString ? sendError.toString() : '') + ' ' +
        (sendError.stack || '')
      ).toLowerCase() : '';
      
      const isPrivateFieldError = errorStr.includes("private field") || 
                                  errorStr.includes("cannot read");
      
      console.log("Send error detected:", {
        error: sendError,
        errorStr: errorStr,
        isPrivateFieldError: isPrivateFieldError
      });
      
      if (isPrivateFieldError) {
        console.warn("Browser extension error detected, using direct fetch:", sendError);
        // 使用 fetch 直接调用 RPC
        try {
          // 获取 RPC URL（从 provider 或使用默认值）
          let rpcUrl = `https://${window.location.host}/rpc-http/`;
          
          // 尝试从 provider 获取 URL
          if (provider && provider.connection) {
            if (typeof provider.connection === 'string') {
              rpcUrl = provider.connection;
            } else if (provider.connection.url) {
              rpcUrl = provider.connection.url;
            } else if (provider._getConnection && typeof provider._getConnection === 'function') {
              try {
                const conn = provider._getConnection();
                if (conn && conn.url) {
                  rpcUrl = conn.url;
                }
              } catch (e) {
                // 忽略错误，使用默认 URL
              }
            }
          }
          
          const fetchResponse = await fetch(rpcUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: methodName.value,
              params: params,
              id: 1,
            }),
          });
          
          const data = await fetchResponse.json();
          if (data.error) {
            error.value = `RPC Error: ${data.error.message || JSON.stringify(data.error)}`;
            result.value = "";
          } else {
            result.value = JSON.stringify(data.result, null, 2);
          }
        } catch (fetchError) {
          error.value = `Failed to call RPC via fetch: ${fetchError.message || String(fetchError)}`;
          result.value = "";
        }
      } else {
        // 其他错误直接抛出
        error.value = sendError.message || String(sendError);
        result.value = "";
      }
    }
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

