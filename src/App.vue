<script setup>
import CyclesSelected from "./components/CyclesSelected/CyclesSelected.vue"
import MultiBatteriesAndMultiCycles from "./components/MultiBatteriesAndMultiCycles/MultiBatteriesAndMultiCycles.vue";
import MultiBatteriesInSingleCycle from "./components/MultiBatteriesInSingleCycle/MultiBatteriesInSingleCycle.vue";
import OriginData from "./components/OriginData/OriginData.vue";
import PrimaryInteractive from "./components/PrimaryInteractive/PrimaryInteractive.vue";
import SingleBatteryInMultiCycles from "./components/SingleBatteryInMultiCycles/SingleBatteryInMultiCycles.vue";
import SingleBatteryStatus from "./components/SingleBatteryStatus/SingleBatteryStatus.vue";
import SingleCycleInformation from "./components/SingleCycleInformation/SingleCycleInformation.vue";
import {onMounted, ref} from "vue";
import {getAll} from "@/plugins/axiosInstance";
import store from '@/store/index.js'
import {connectionStatusStore} from "@/store/connectionStatusStore";


components: {
  CyclesSelected,
  MultiBatteriesAndMultiCycles,
  MultiBatteriesInSingleCycle,
  OriginData,
  PrimaryInteractive,
  SingleBatteryInMultiCycles,
  SingleBatteryStatus,
  SingleCycleInformation
}

onMounted(() => {
  getAll()
})
</script>

<template>
  <div class="main-container">
    <div class="cycles-selected">
      <cycles-selected></cycles-selected>
    </div>
    <div class="primary-interactive">
      <PrimaryInteractive></PrimaryInteractive>
    </div>
    <div class="single-cycle-information">
      <SingleCycleInformation></SingleCycleInformation>
    </div>
    <div class="multi-batteries-in-single-cycle">
      <MultiBatteriesInSingleCycle></MultiBatteriesInSingleCycle>
    </div>
    <div class="single-battery-in-multi-cycles">
      <SingleBatteryInMultiCycles></SingleBatteryInMultiCycles>
    </div>
    <div class="multi-batteries-and-multi-cycles">
      <MultiBatteriesAndMultiCycles></MultiBatteriesAndMultiCycles>
    </div>
    <div class="origin-data">
      <OriginData></OriginData>
    </div>
    <div class="single-battery-status">
      <SingleBatteryStatus></SingleBatteryStatus>
    </div>
  </div>
</template>

<style lang="scss">
::-webkit-scrollbar{
  display: none;
}
.main-container {
  margin: 10px 0 0 10px;
  position: relative;
  width: 2603px;
  height: 1161px;

  .cycles-selected {
    width: 340px;
    height: 440px;
    left: 15px;
    top: 7px;
  }

  .primary-interactive {
    width: 1420px;
    height: 530px;
    left: 372px;
    top: 7px;
  }

  .single-cycle-information {
    width: 502px;
    height: 469px;
    top: 7px;
    left: 1807px;
  }

  .multi-batteries-in-single-cycle {
    width: 340px;
    height: 692px;
    left: 15px;
    top: 469px;
  }

  .single-battery-in-multi-cycles {
    width: 976px;
    height: 387px;
    top: 551px;
    left: 371px;
  }

  .multi-batteries-and-multi-cycles {
    width: 415px;
    height: 387px;
    left: 1376px;
    top: 551px;
  }

  .origin-data {
    width: 502px;
    height: 443px;
    left: 1807px;
    top: 495px;
  }

  .single-battery-status {
    width: 1937px;
    height: 209px;
    top: 952px;
    left: 372px;
  }
}

</style>
