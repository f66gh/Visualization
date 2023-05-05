<template>
    <div class="main-title" style="background-color: #31658C;">Single Battery in Multi-Cycles View</div>
    <div class="container">
      <div class="function-bar">
        <div class="slider">
          <span>selected Range:</span>
          <el-slider v-model="rangeVal" range
                     :max="rangeMax" :min="rangeMin"
                     @input="sliderInput" :show-tooltip="false"
          ></el-slider>
        </div>
        <div class="input-battery">
          <span>selected Battery:</span>
          <el-input v-model="selectedBattery" size="small" @input="changeBattery"></el-input>
        </div>
        <div class="legend">
          <div class="single-legend" v-for="(item, index) in legends" :id="index">
            <div :style="{backgroundColor: item.color1}"></div>
            <div :style="{backgroundColor: item.color2}"></div>
            <div :style="{backgroundColor: item.color3}"></div>
            <span>{{item.title}}</span>
          </div>
        </div>
      </div>
      <div class="view">
        <div class="Axis-box">
          <div id="top-left-Axis-t" style="width: 140px; height: 10px"></div>
          <div id="top-middle-Axis-t" style="width: 628px; height: 10px"></div>
          <div id="top-right-Axis-t" style="width: 140px; height: 10px"></div>
        </div>
        <div id="line-box-t" class="line-box">
          <div id="left-box-t" style="width: 140px; height: 124px;"></div>
          <div id="middle-line-t" style="width: 628px; height: 124px;"></div>
          <div id="right-box-t" style="width: 140px; height: 124px;"></div>
        </div >
        <div class="bottom">
          <div id="bottom-left-box-t" style="width: 140px; height: 20px"></div>
          <div id="bottom-right-box-t" style="width: 140px; height: 20px"></div>
          <div id="bottom-line-t"></div>
        </div>
      </div>
      <div class="view">
        <div class="Axis-box">
          <div id="top-left-Axis-v" style="width: 140px; height: 10px"></div>
          <div id="top-middle-Axis-v" style="width: 628px; height: 10px"></div>
          <div id="top-right-Axis-v" style="width: 140px; height: 10px"></div>
        </div>
        <div id="line-box-v" class="line-box">
          <div id="left-box-v" style="width: 140px; height: 124px;"></div>
          <div id="middle-line-v" style="width: 628px; height: 124px;"></div>
          <div id="right-box-v" style="width: 140px; height: 124px;"></div>
        </div>
        <div class="bottom">
          <div id="bottom-left-box-v" style="width: 140px; height: 20px"></div>
          <div id="bottom-right-box-v" style="width: 140px; height: 20px"></div>
          <div id="bottom-line-v"></div>
        </div>
      </div>
    </div>
</template>

<script setup>
import {printView} from './printView'
import {onMounted, ref} from "vue";
import {selectedCyclesStore} from "@/store/selectedCyclesStore";
import * as d3 from "d3";
import Tools from "@/tools";
import {voltList, tempList} from '@/plugins/axiosInstance'
import {reactive} from "@vue/reactivity";
import {connectionStatusStore} from "@/store/connectionStatusStore";
const connectionStore = connectionStatusStore()

const selectedBattery = ref(1)
const rangeVal = ref([0, 0])
const rangeMax = ref(0)
const rangeMin = ref(0)
const selectedData = reactive([])
const legends = [
    {title: 'temperature', color1: '#31658c', color2: '#4f9a95', color3: '#55453f'},
    {title: 'voltage', color1: '#df4343', color2: '#bf7105', color3: '#b29ed8'}]


const store = selectedCyclesStore()
store.$subscribe((arg, data) => {
  const init = +(data.selectedCycles[0].number_of_cycles)
  const len = data.selectedCycles.length
  selectedData.splice(0, selectedData.length - 1)
  for(let i = init; i < init + len; i++){
    selectedData.push(dataList[i])
  }


  const tempSlider = printView("t", selectedData, parseInt(selectedData.length / 2),
      parseInt(selectedData.length / 2) + 4, selectedBattery.value)
  printView("v", selectedData, parseInt(selectedData.length / 2),
      parseInt(selectedData.length / 2) + 4, selectedBattery.value)
  rangeVal.value = tempSlider.lineRangeForCycleId
  rangeMax.value = tempSlider.lineMaxForCycleId
  rangeMin.value = tempSlider.lineMinForCycleId
})

const changeBattery = () => {
  printView("t", selectedData,rangeVal.value[0] - rangeMin.value,
      rangeVal.value[1] - rangeMin.value , selectedBattery.value)
  printView("v", selectedData,rangeVal.value[0] - rangeMin.value,
      rangeVal.value[1] - rangeMin.value , selectedBattery.value)
}
const sliderInput = (e) => {
  rangeVal.value = e
  printView("t", selectedData,e[0] - rangeMin.value,
      e[1] - rangeMin.value , selectedBattery.value)
  printView("v", selectedData,e[0] - rangeMin.value,
      e[1] - rangeMin.value , selectedBattery.value)
}

const dataList = reactive([])

const dealData = (tempList, voltList) => {
  const batteryLen = voltList[0][0].length
  const dataList = [{}] // 最终数据
  voltList.forEach((v, i) => {
    const dataArr = [[]] // 临时存储
    v.forEach((va, id) => {
      for(let n = 0; n < batteryLen; n++){
        if(!dataArr[n]) dataArr.push([])
        dataArr[n].push(va[n])
      }
    })
    dataArr.forEach((va, id) => {
      if(!dataList[i]) dataList.push({})
      dataList[i][`battery_${id + 1}_volt`] = va.join(',')
    })
  })
  tempList.forEach((v, i) => {
    const dataArr = [[]] // 临时存储
    v.forEach((va, id) => {
      for(let n = 0; n < batteryLen; n++){
        if(!dataArr[n]) dataArr.push([])
        dataArr[n].push(va[n])
      }
    })
    dataArr.forEach((va, id) => {
      if(!dataList[i]) dataList.push({})
      dataList[i][`battery_${id + 1}_temp`] = va.join(',')
      dataList[i]['number_of_cycles'] = i + 1
    })
  })
  return dataList
}

connectionStore.$subscribe(() => {

   dealData(tempList, voltList).forEach((v) => {
     dataList.push(v)
     selectedData.push(v)
   })

    printView("t", dataList)
    printView("v", dataList)
    rangeMax.value = dataList.length
    rangeMin.value = 0
    rangeVal.value = [parseInt(dataList.length / 2), parseInt(dataList.length / 2) + 10]
})
</script>

<style scoped lang="scss">
  span {
    font-size: 10px;
    white-space: nowrap;
    margin-right: 10px;
  }
  .Axis-box {
    width: 936px;
    display: flex;
    justify-content: space-between;
    height: 18px;
  }
  #line-box-t, #line-box-v {
    width: 936px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin: 0 auto;
  }

  .function-bar {
    width: 100%;
    height: 20px;
    margin-top: 5px;
    margin-bottom: 5px;
    display: flex;
    line-height: 20px;


    .slider {
      width: 50%;
      height: 100%;
      display: flex;
      justify-content: center;
      margin-left: 15px;

      .el-slider {
        height: 100%;
      }
    }

    .input-battery{
      height: 100%;
      width: 20%;
      display: flex;
      flex-wrap: nowrap;
      margin-left: 20px;
    }

    .legend{
      width: 20%;
      height: 100%;
      display: flex;
      justify-content: space-between;
      margin-left: 20px;

      .single-legend{
        display: flex;
        justify-content: space-between;

        span{
          font-size: 12px;
          margin-left: 10px;
        }
        div{
          height: 10px;
          width: 10px;
          margin: auto 2px;
        }
      }

    }
  }

  .view{
    margin-bottom: 15px;
    position: relative;

    .Axis-box{
      margin: 0 auto;
    }

    .bottom{
      width: 936px;
      position: absolute;
      left: 15px;

      #bottom-line-t, #bottom-line-v {
        width: 100%;
        height:100%;
        position: absolute;
      }
    }

  }

  .bottom {
    width: 100%;
    height: 20px;
    display: flex;
    justify-content: space-between;
    position: absolute;
    bottom: 0
  }

</style>