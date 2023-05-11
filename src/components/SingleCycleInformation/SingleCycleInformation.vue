<template>
  <div class="container">
    <div class="main-title" style="background-color: #4f9a95; justify-content: space-around">
      <div>Single Cycle Information</div>
      <div>Cycle No.{{selectedCycle}}</div>
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

    <div class="legends" >
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
import {selectedCycleNumStore} from "@/store/selectedCycleNumStore";
import {tempList, voltList, output7} from '@/plugins/axiosInstance'
import * as d3 from 'd3'
import {connectionStatusStore} from "@/store/connectionStatusStore";
const connectionStore = connectionStatusStore()

const isCharging = ref(true)
const batteriesTitles = reactive(["Voltage Ave", "Voltage Max", "Voltage Min", "Temp Ave", "Temp Max", "Temp Min"])
const batteriesData = reactive(["0", "0", "0", "0", "0", "0"])
const chargingTitles = reactive(["Charging Time", "Quick Charge Time", "Slow Charge Time"])
const chargingData = reactive(['unknown', 'unknown', 'unknown'])
const warningTitles = reactive(["error_code"])
const warningData = reactive(["0"])
const leftLegends = reactive([
  {color: '#b29ed8', text: "Ma_T"},
  {color: '#ebbd62', text: "Mi_T"},
  {color: '#ee9a9a', text: "Ama_T"},
])
const middleLegend = reactive(
  {color: '#bcaba4', text: "Amili"}
)
const rightLegends = reactive([
  {color: '#5a99c5', text: "Asoc"},
  {color: '#4f9a95', text: "SOH"},
  {color: '#93ae74', text: "SOC"}
])

const useStore = singleCycleStore()
useStore.$subscribe((arg, state) => {
  singleCycle(state.singleCycle, state.aveCtb)
})

const selectedCycle = ref(2)
const selectedCycleNum = selectedCycleNumStore()

selectedCycleNum.$subscribe((arg, state) => {
  selectedCycle.value = state.selectedCycleNum
  const tempData = dealData(selectedCycle.value - 1, tempList)
  const voltData = dealData(selectedCycle.value - 1, voltList)
  batteriesData[0] = voltData.ave.toFixed(2)+'mV'
  batteriesData[1] = voltData.high.toFixed(2)+'mV'
  batteriesData[2] = voltData.low.toFixed(2)+'mV'
  batteriesData[3] = tempData.ave.toFixed(2)+'℃'
  batteriesData[4] = tempData.high.toFixed(2)+'℃'
  batteriesData[5] = tempData.low.toFixed(2)+'℃'
  getErr(output7, selectedCycle.value - 1)
})

const dealData = (selectedCycle, list) => {
  // 第一遍读取数据，得到每一次循环所有电池的数据（平均值）
  const cycleLen = list[0].length
  const batteryLen = list[0][0].length
  const dataArr = list.map((v, i) => {
    const batteryDataList = new Array(batteryLen).fill(0)
    v.map((va, id) => {
      va.map((val, idx) => {
        batteryDataList[idx] += +(val) // 这个是计算每一个电池在一次循环中的数据和
      })
    })
    return batteryDataList.map(v => v / cycleLen) // 电池在这一次循环的数据列表
  })

  // 第二遍，计算每一次循环的平均值和最高最低值
  const dataList = dataArr.map((v, i) => {
    let sum = 0;
    let high = 0;
    let low = 10000;
    v.map((va, id) => {
      sum += va
      if(high < va) high = va
      else if(low > va) low = va
    })
    const ave = sum / batteryLen
    return {
      ave,
      high,
      low
    }
  })

  return dataList[selectedCycle]
}

const getErr = (csv, selectedCycle = 0) => {
  warningTitles[0] = 'error_code'
  warningData[0] = csv[selectedCycle].alarm_info
}

const getCsv = () => {
  // d3.csv('src/csv/output7.csv').then((res) => {
  //   res.forEach((v) => {
  //     csv.push(v)
  //   })
    getErr(output7)
  // })
}

connectionStore.$subscribe(() => {
  getCsv()
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

#tip{
  position: absolute;
  margin-left: 10px;
  margin-top: 10px;
  line-height: 22px;
  background-color: rgba(0, 0, 0, .6);
  padding: 4px 9px;
  font-size: 13px;
  color: #fff;
  border-radius: 3px;
  pointer-events: none;
  display: none;
}
</style>