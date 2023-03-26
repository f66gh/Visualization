<template>
  <div class="container">
    <div class="main-title" style="background-color: #4f9a95; justify-content: space-around">
      <div>Single Cycle Information</div>
      <div>Cycle No.465</div>
    </div>

    <div class="all-batteries-status sub-container">
      <div class="main-title sub-title" style="background-color: #31658C">All Batteries Status</div>
      <div class="detail-info">
        <div class="title-text">
          <div class="title" v-for="(item, index) in batteriesTitles" :key="index">{{item}}:</div>
        </div>
        <div class="datum-text">
          <div class="datum" v-for="(item, index) in batteriesData" :key="index">{{item}}</div>
        </div>
      </div>
    </div>

    <div class="charging-status sub-container">
      <div class="main-title sub-title" :style="{backgroundColor: isCharging ? '#BF7105' : '#93AE74'}">{{isCharging ? "Charging Status" : "Discharging Status"}}</div>
      <div class="detail-info">
        <div class="title-text">
          <div class="title" v-for="(item, index) in chargingTitles" :key="index">{{item}}:</div>
        </div>
        <div class="datum-text">
          <div class="datum" v-for="(item, index) in chargingData" :key="index">{{item}}</div>
        </div>
      </div>
    </div>

    <div class="warning sub-container">
      <div class="main-title sub-title" style="background-color: #DF4343">WARNING</div>
      <div class="detail-info">
        <div class="title-text">
          <div class="title" style="font-weight: bold" v-for="(item, index) in warningTitles" :key="index">{{item}}:</div>
        </div>
        <div class="datum-text">
          <div class="datum" style="color: #DF4343" v-for="(item, index) in warningData" :key="index">{{item}}</div>
        </div>
      </div>
    </div>

    <div class="promotion-overView">
      <div id="single-cycle"></div>
    </div>

    <div class="charging-overView">
      <div id="re-charging"></div>
    </div>

    <div class="legends">
      <div class="single-left-container">
        <div class="single-legend-left" v-for="(item, index) in leftLegends" :key="index">
          <div class="color" :style="{backgroundColor: item.color}"></div>
          <div class="text">{{item.text}}</div>
        </div>
      </div>
      <div class="single-middle-container">
        <div class="color" :style="{backgroundColor: middleLegend.color}"></div>
        <div class="text">{{middleLegend.text}}</div>
      </div>
      <div class="single-right-container">
        <div class="single-legend-right" v-for="(item, index) in rightLegends" :key="index">
          <div class="text">{{item.text}}</div>
          <div class="color" style="margin-left: 7px;" :style="{backgroundColor: item.color}"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {reactive} from "@vue/reactivity";
import {onMounted, ref} from "vue";
import {color} from '../../assets/colorUtils'
import {singleCycle} from "@/components/SingleCycleInformation/printView";
import {singleCycleStore} from "@/store/singleCycleStore";

const isCharging = ref(true)
const batteriesTitles = reactive(["Voltage Ave", "Voltage Max", "Temp Ave", "Temp Max", "Current Ave", "Current Max"])
const batteriesData = reactive(["5.4v", "6.0v", "45.2℃", "51.3v", "214.5A", "256.1A"])
const chargingTitles = reactive(["Charging Time", "Quick Charge Time", "Slow Charge Time"])
const chargingData = reactive(['1442min', '120min', '1322min'])
const warningTitles = reactive(["Battery No.02"])
const warningData = reactive(["TEMP HIGH"])
const leftLegends = reactive([
  {color: color.blue1, text: "Fea 3"},
  {color: color.pink1, text: "Fea 1"},
  {color: color.green1, text: "SOH"},
])
const middleLegend = reactive(
  {color: color.brown1, text: "Feature 5"}
)
const rightLegends = reactive([
  {color: color.purple1, text: "Fea 4"},
  {color: color.yellow1, text: "Fea 2"},
  {color: color.mainGreen, text: "SOC"}
])

const useStore = singleCycleStore()
useStore.$subscribe((arg, state) => {

  singleCycle(state.singleCycle)
})

onMounted(() => {

})

</script>

<style lang="scss" scoped>
.promotion-overView{
  width: 230px;
  height: 230px;
  position: absolute;
  bottom: 22px;
}
.charging-overView{
  width: 220px;
  height: 200px;
  position: absolute;
  bottom: 15px;
  right: 0px;
}
.sub-title {
  height: 22px;
  font-size: 12px;
}
.sub-container{
  width: 230px;
  border: #e5e5e5 1px solid;
  border-radius: 3px;
  position: absolute;
  padding: 5px;
}
.color{
  height: 10px;
  width: 10px;
  margin: 2.5px 7px 2.5px 0;
  display: inline-block;
}
.text{
  color: #A6A6A6;
  font-size: 10px;
  line-height: 15px;
  height: 15px;
  display: inline-block;
}
.detail-info{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;

  .title-text{
    width: 50%;
    height: 100%;
    margin-left: 10%;

    .title{
      height: 22px;
      line-height: 22px;
      color: #383838;
      font-size: 13px;
    }
  }

  .datum-text{
    width: 40%;
    height: 100%;

    .datum{
      height: 22px;
      line-height: 22px;
      color: #383838;
      font-size: 13px;
      font-weight: lighter;
    }
  }
}
.container{
  position: relative;

  .all-batteries-status{
    height: 146px;
    top: 50px;

  }

  .charging-status{
    height: 92px;
    top: 50px;
    right: 0;
  }

  .warning{
    height: 77px;
    top: 170px;
    right: 0;
  }

  .legends {
    width: 250px;
    height: 48px;
    margin-top: 380px;
    display: flex;
    justify-content: space-between;

    .single-left-container {
      height: 100%;
      width: 150px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex-wrap: wrap;

      .single-legend-left {
        height: 33.3%;
        display: flex;
        align-items: center;

      }
    }

    .single-middle-container{
      height: 33.3%;
      width: 120px;
      display: flex;
      align-self: flex-end;
    }

    .single-right-container {
      height: 100%;
      width: 150px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .single-legend-right {
        height: 15px;
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}
</style>