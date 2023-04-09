<template>
  <div class="main-container-ver">
    <div class="main-title-ver" style="background-color: #31658c;"><p>Batteries Status</p></div>
    <div class="batteries-container" style="border: none">
      <div class="battery" v-for="(single, index) in batteries" :key="index">
        <div class="sub-title" :style="{backgroundColor: colorScale(single.status)}"><p>No.{{single.battery}}</p></div>
        <div class="info">
          <div class="detail">vMax:{{(single.high / 1000).toFixed(2)}}V</div>
          <div class="detail">vMin:{{(single.low/ 1000).toFixed(2)}}V</div>
          <div class="detail">vAve:{{(single.ave/ 1000).toFixed(2)}}V</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as d3 from 'd3'
import {selectedCycleNumStore} from "@/store/selectedCycleNumStore";
import {reactive} from "@vue/reactivity";
import voltList from '@/json/voltList.json'
import {onMounted} from "vue";
  const batteries = reactive([])
  const cycleStore = selectedCycleNumStore()
  cycleStore.$subscribe((arg, state) => {
    dealData(state.selectedCycleNum - 1)
  })

const allData = []
const getData = () => {
  const batteryLen = voltList[0][0].length
  voltList.forEach((v, i) => {
    const dataArr = [[]] // 临时存储
    v.forEach((va, id) => {
      for (let n = 0; n < batteryLen; n++) {
        if (!dataArr[n]) dataArr.push([])
        dataArr[n].push(va[n])
      }
    })
    allData.push(dataArr)
  })
}

let statusList = []

const dealData = (currSelected) => {
    const data = allData[currSelected]
    const dataList = data.map((v, i) => {
      let high = 0, low =10000, ave = 0
      v.forEach(v => {
        v = +v
        if(high < v) high = v
        else if(low > v) low = v
        ave += v
      })
      ave /= data.length
      return {ave, high, low, battery: i + 1}
    })
  const aveList = dataList.map(v => v.ave)
  let high = 0, low =10000, ave = 0
  aveList.forEach(v => {
    v = +v
    if(high < v) high = v
    else if(low > v) low = v
    ave += v
  })
  ave /= data.length
  statusList.splice(0, statusList.length - 1)
  statusList = aveList.map(v => Math.abs(v - ave) / (high - low))
  for(let i = 0; i < dataList.length; i++){
    batteries[i] = dataList[i]
    batteries[i].status = statusList[i]
  }
}

const colorScale = (num) => {
  const color = d3.scaleLinear()
      .domain(d3.extent(statusList))
      .range(['#4f9a95', '#df4343'])
  return color(num)
}

onMounted(() => {
  getData()
  dealData(1)
})
</script>

<style scoped lang="scss">
::-webkit-scrollbar{
  display: none;
}
.main-container-ver{
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  width: 100%;

}
.main-title-ver {
  height: 187px;
  width: 23px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 16px;
  font-weight: bold;
  border-radius: 2px;

  p{
    transform:rotate(270deg);
    width: 200px;
    white-space: nowrap;
  }
}

.batteries-container{
  width: 1872px;
  height: 95%;
  display: flex;
  flex-wrap: wrap;
  overflow: auto;

  .battery{
    height: 50px;
    width: 90px;
    //justify-content: space-between;
    display: flex;
    align-items: center;
    border: 1px rgba(45, 88, 85, .5) solid;
    border-radius: 4px;
    margin: 0 10px 10px 0;

    .sub-title{
      height: 45px;
      width: 15px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: white;
      font-size: 8px;
      border-radius: 2px;
      background-color: #31658c;
      margin-left: 2px;
      margin-right: 5px;

      p{
        transform: rotate(270deg);
        white-space: nowrap;
        font-size: 5px;
      }
    }

    .info{
      width: 60px;
      height: 45px;
      display: flex;
      flex-wrap: wrap;


      .detail{
        height: 15px;
        width: 60px;
        line-height: 15px;
        font-size: 8px;
      }
    }
  }
}


</style>