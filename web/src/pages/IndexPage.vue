<template>
  <div class="flex container">
    <div v-if="isLoading" class="loading">
      <q-circular-progress
        indeterminate
        size="90px"
        :thickness="0.2"
        color="lime"
        center-color="grey-8"
        track-color="transparent"
        class="q-ma-md"
      />
    </div>
    <div v-else class="column" style="width: 100%">
      <!-- header info -->
      <div class="col-auto flex justify-between items-center">
        <EthereumInfo
          :img="valueNetVersion.img"
          properties="Archive Node"
          :network="valueNetVersion.label"
        />
        <div>
          <q-chip
            color="info"
            text-color="#1A130F"
            :icon="clientStatus === 'Stopped' ? 'img:/svg/resume.svg' : 'stop'"
            class="header-right"
          >
            {{ clientStatus === "Stopped" ? "Resume" : "Stop" }}
          </q-chip>
        </div>
      </div>

      <!-- Node Info-->
      <div class="col-auto">
        <option-title title="Node Info" />
        <div class="row">
          <div class="col node-info-item" style="margin-right: 16px">
            <node-info-item label="Version" :content="valueClientVersion" />
          </div>
          <div class="col node-info-item" style="margin-right: 16px">
            <node-info-item
              label="Status"
              :content="clientStatus"
              :color="clientStatusColor"
            />
          </div>
          <div class="col node-info-item" style="margin-right: 16px">
            <node-info-item
              label="Current Height"
              :content="valueBlockNumberShow"
              comment="(59 sece ago)"
            />
          </div>
          <div class="col node-info-item">
            <node-info-item
              label="Latest Block Time"
              :content="valueBlockTime || 'N/A'"
            />
          </div>
        </div>
      </div>

      <!-- Endpoints-->
      <div class="col-auto">
        <option-title title="Endpoints" />
        <end-point
          class="end-point-view"
          style="margin-bottom: 12px"
          label="HTTPS"
          :content="rpc"
        />
        <end-point class="end-point-view" label="WSS" :content="wssUrl" />
      </div>

      <div class="col-auto">
        <option-title title="Base Data" />
        <div class="row">
          <div class="col base-data-view" style="margin-right: 16px">
            <base-data :baseData="baseDataNetInfo" />
          </div>
          <div class="col base-data-view" style="">
            <base-data :baseData="baseDataClientInfo" />
          </div>
        </div>
      </div>

      <div class="col-auto">
        <rpc-caller :rpcProvider="jrp" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from "vue";
import EthereumInfo from "components/EthereumInfo.vue";
import OptionTitle from "components/OptionTitle.vue";
import NodeInfoItem from "components/NodeInfoItem.vue";
import BaseData from "components/BaseData.vue";
import EndPoint from "components/EndPoint.vue";
import RpcCaller from "components/RpcCaller.vue";

import { useRouter } from "vue-router";
import { ethers } from "ethers";
import extract from "../utils/extract";
import match from "../utils/match";

export default defineComponent({
  name: "NewPage",
  components: {
    EthereumInfo,
    OptionTitle,
    NodeInfoItem,
    BaseData,
    EndPoint,
    RpcCaller,
  },
  setup() {
    const route = useRouter();
    const completedRequestsCount = ref(0);

    let rpc = ref("");
    let jrp = ref(null);
    let valueClientVersion = ref(null);
    let valueNetVersion = ref(null);
    let valueListening = ref(null);
    let valuePeerCount = ref("");
    let valueSyncing = ref(null);
    let valueHashrate = ref("");
    let valueGasPrice = ref("");
    let valueBlockNumber = ref(null);
    let valueBlock = ref("");
    let valueBlockTime = ref("");
    let baseDataNetInfo = ref("");

    let adminNodeInfo = ref("");

    let clientStatus = ref(""); // client status
    let valueBlockNumberShow = computed(() =>
      valueBlockNumber.value
        ? extract.numberWithCommas(parseInt(valueBlockNumber.value))
        : ""
    );
    let valueGasPriceShow = computed(() => parseInt(valueGasPrice.value));
    let valuePeerCountShow = computed(() => parseInt(valuePeerCount.value));
    let baseDataClientInfo = computed(() => {
      return {
        "Peer Count": parseInt(valuePeerCount.value)
          ? valuePeerCountShow.value
          : "",
        "Listening Status": valueListening.value ? "True" : "False",
      };
    });

    const isLoading = computed(() => {
      return (
        valueClientVersion.value === null ||
        valueNetVersion.value === null ||
        valueListening.value === null ||
        valueSyncing.value === null
      );
    });

    const fetchData = (methodName, valueRef, params = []) => {
      return new Promise(async (resolve, reject) => {
        try {
          if (!jrp.value) {
            reject(new Error("RPC provider not initialized"));
            return;
          }
          let result;
          try {
            if (params.length > 0) {
              result = await jrp.value.send(methodName, params);
            } else {
              result = await jrp.value.send(methodName);
            }
            valueRef.value = result;
            resolve();
          } catch (sendError) {
            // 忽略浏览器扩展相关的错误
            // 检查错误消息或错误类型
            const isPrivateFieldError = 
              (sendError && sendError.message && sendError.message.includes("private field")) ||
              (sendError && sendError.toString && sendError.toString().includes("private field")) ||
              (sendError && sendError.stack && sendError.stack.includes("private field"));
            
            if (isPrivateFieldError) {
              console.warn("Browser extension error ignored:", sendError);
              // 尝试使用 fetch 直接调用 RPC
              try {
                const response = await fetch(rpc.value, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: methodName,
                    params: params,
                    id: 1,
                  }),
                });
                const data = await response.json();
                if (data.error) {
                  reject(new Error(data.error.message || "RPC error"));
                } else {
                  valueRef.value = data.result;
                  resolve();
                }
              } catch (fetchError) {
                reject(fetchError);
              }
            } else {
              reject(sendError);
            }
          }
        } catch (error) {
          reject(error);
        }
      });
    };

    let data = [
      ["blockNumber", valueBlockNumberShow, "bg-warning"],
      ["blockTime", valueBlockTime, "bg-secondary"],
      ["gasPrice", valueGasPriceShow, "bg-info"],
      ["clientVersion", valueClientVersion, "bg-purple"],
      ["netVersion", valueNetVersion, "bg-primary"],
      ["listening", valueListening, "bg-secondary"],
      ["peerCount", valuePeerCountShow, "bg-accent"],
      ["syncing", valueSyncing, "bg-dark"],
      ["rpc", rpc, "bg-primary"],
    ];

    onMounted(async () => {
      try {
        rpc.value = `https://${window.location.host}/rpc-http/`;

        // rpc.value = "https://bsc-dataseed2.ninicoin.io";
        // rpc.value = "https://blockchain2.byte-trade.com:31267/eth-mainnet";

        // 初始化 provider
        jrp.value = new ethers.JsonRpcProvider(rpc.value);
        
        // 等待 provider 准备就绪
        await jrp.value.getNetwork().catch(() => {});

        fetchData("web3_clientVersion", valueClientVersion).then(() => {
        let matchResult = extract.clientVersionInfo(valueClientVersion.value);
        valueClientVersion.value = matchResult;
      });

      fetchData("net_version", valueNetVersion).then(() => {
        valueNetVersion.value = extract.filterChainType(valueNetVersion.value);
        baseDataNetInfo.value = (({ id, Currency }) => ({ id, Currency }))(
          valueNetVersion.value
        );
      });

      await fetchData("net_listening", valueListening);
      await fetchData("eth_syncing", valueSyncing);

      // fetchData("admin_nodeInfo", adminNodeInfo);

      clientStatus.value = match.getClientStatus(
        valueListening.value,
        valueSyncing.value
      );

      fetchData("net_peerCount", valuePeerCount);

      // Fetch latest block time on mount
      fetchData("eth_blockNumber", valueBlockNumber).then(async () => {
        if (valueBlockNumber.value) {
          try {
            // 使用 fetchData 或直接 fetch 来获取区块信息
            let block = null;
            try {
              if (jrp.value) {
                block = await jrp.value.send("eth_getBlockByNumber", [
                  valueBlockNumber.value,
                  false,
                ]);
              }
            } catch (sendError) {
              // 如果 send 失败，使用 fetch 直接调用
              // 检查错误消息或错误类型
              const isPrivateFieldError = 
                (sendError && sendError.message && sendError.message.includes("private field")) ||
                (sendError && sendError.toString && sendError.toString().includes("private field")) ||
                (sendError && sendError.name === "TypeError");
              
              if (isPrivateFieldError) {
                try {
                  const response = await fetch(rpc.value, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      jsonrpc: "2.0",
                      method: "eth_getBlockByNumber",
                      params: [valueBlockNumber.value, false],
                      id: 1,
                    }),
                  });
                  const data = await response.json();
                  if (data.result) {
                    block = data.result;
                  }
                } catch (fetchError) {
                  console.error("Failed to fetch block via fetch:", fetchError);
                }
              } else {
                throw sendError;
              }
            }
            
            if (block && block.timestamp) {
              valueBlockTime.value = new Date(
                parseInt(block.timestamp, 16) * 1000
              ).toLocaleString();
            }
          } catch (error) {
            console.error("Failed to fetch block time:", error);
          }
        }
      });

      // fetchData("eth_hashrate", valueHashrate);
      // fetchData("eth_gasPrice", valueGasPrice);
      // fetchData("eth_blockNumber", valueBlockNumber).then(async () => {
      //   console.log({'区块值':valueBlockNumber});
      //   valueBlockNumber.value &&
      //     (valueBlockNumber.value = parseInt(valueBlockNumber.value));
      // });

      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          fetchData("eth_blockNumber", valueBlockNumber).then(async () => {
            if (valueBlockNumber.value) {
              try {
                // 使用 fetchData 或直接 fetch 来获取区块信息
                let block = null;
                try {
                  if (jrp.value) {
                    block = await jrp.value.send("eth_getBlockByNumber", [
                      valueBlockNumber.value,
                      false,
                    ]);
                  }
                } catch (sendError) {
                  // 如果 send 失败，使用 fetch 直接调用
                  // 检查错误消息或错误类型
                  const isPrivateFieldError = 
                    (sendError && sendError.message && sendError.message.includes("private field")) ||
                    (sendError && sendError.toString && sendError.toString().includes("private field")) ||
                    (sendError && sendError.name === "TypeError");
                  
                  if (isPrivateFieldError) {
                    try {
                      const response = await fetch(rpc.value, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          jsonrpc: "2.0",
                          method: "eth_getBlockByNumber",
                          params: [valueBlockNumber.value, false],
                          id: 1,
                        }),
                      });
                      const data = await response.json();
                      if (data.result) {
                        block = data.result;
                      }
                    } catch (fetchError) {
                      console.error("Failed to fetch block via fetch:", fetchError);
                    }
                  } else {
                    throw sendError;
                  }
                }

                valueBlock.value = block;
                if (block && block.timestamp) {
                  valueBlockTime.value = new Date(
                    parseInt(block.timestamp, 16) * 1000
                  ).toLocaleString();
                }
              } catch (error) {
                console.error("Failed to fetch block time:", error);
              }
            }
          });
        }
      });
      } catch (error) {
        console.error("Failed to initialize RPC provider:", error);
      }
    });

    return {
      rpc,
      wssUrl: `wss://${window.location.host}/rpc-ws/`,
      clientStatus,
      valueClientVersion,
      valueNetVersion,
      baseDataNetInfo,
      baseDataClientInfo,
      clientStatusColor: computed(() => {
        return match.getChainStatusColor(clientStatus.value);
      }),
      jrp,

      valueListening,
      valuePeerCount,
      valueSyncing,
      valueHashrate,
      valueGasPrice,
      valueBlockNumber,
      valueBlock,
      valueBlockTime,
      valueBlockNumberShow,
      valueGasPriceShow,
      valuePeerCountShow,
      data,
      isLoading,
    };
  },
});
</script>

<style lang="scss" scoped>
.container {
  max-width: 848px;
  margin: 48px auto;
}
.header-right {
  width: 81px;
  height: 36px;
  background: #ffffff;
  border-radius: 8px;

  font-family: "Roboto";
  font-style: normal;
  font-weight: 400;
  font-size: 14px;
  line-height: 16px;
}
.col-auto {
  margin-top: 12px;
  margin-bottom: 12px;
}
.node-info-item {
  height: 86px;
  background: #ffffff;
  border-radius: 8px;
  padding-left: 24px;
  display: flex;
  align-items: center;
}

.base-data-view {
  height: 104px;
  background: #ffffff;
  border-radius: 8px;
  padding-left: 24px;
  padding-right: 24px;
  display: flex;
  align-items: center;
}

.end-point-view {
  height: 48px;
  background: #ffffff;
  border-radius: 8px;
  padding-left: 24px;
  padding-right: 24px;
  display: flex;
  align-items: center;
}
.loading {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin: auto;
}
</style>
