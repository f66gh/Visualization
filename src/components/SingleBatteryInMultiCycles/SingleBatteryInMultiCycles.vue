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
      </div>
      <div class="view">
        <div class="Axis-box">
          <div id="top-left-Axis-t" style="width: 140px; height: 10px"></div>
          <div id="top-middle-Axis-t" style="width: 628px; height: 10px"></div>
          <div id="top-right-Axis-t" style="width: 140px; height: 10px"></div>
        </div>
        <div id="line-box-t">
          <div id="left-box-t" style="width: 140px; height: 124px;"></div>
          <div id="middle-line-t" style="width: 628px; height: 124px;"></div>
          <div id="right-box-t" style="width: 140px; height: 124px;"></div>
          <div class="bottom">
            <div id="bottom-left-box-t" style="width: 140px; height: 20px"></div>
            <div id="bottom-right-box-t" style="width: 140px; height: 20px"></div>
          </div>
        </div>
        <div id="bottom-line-t"></div>
      </div>
      <div class="view">
        <div class="Axis-box">
          <div id="top-left-Axis-v" style="width: 140px; height: 10px"></div>
          <div id="top-middle-Axis-v" style="width: 628px; height: 10px"></div>
          <div id="top-right-Axis-v" style="width: 140px; height: 10px"></div>
        </div>
        <div id="line-box-v">
          <div id="left-box-v" style="width: 140px; height: 124px;"></div>
          <div id="middle-line-v" style="width: 628px; height: 124px;"></div>
          <div id="right-box-v" style="width: 140px; height: 124px;"></div>
          <div id="bottom-left-box-v" style="width: 140px; height: 20px"></div>
          <div id="bottom-right-box-v" style="width: 140px; height: 20px"></div>
        </div>
        <div id="bottom-line-v"></div>
      </div>
    </div>
</template>

<script setup>
import {printView} from './printView'
import {onMounted, ref} from "vue";
import {selectedCyclesStore} from "@/store/selectedCyclesStore";
import * as d3 from "d3";

const selectedBattery = ref(1)
const rangeVal = ref([0, 0])
const rangeMax = ref(0)
const rangeMin = ref(0)
const selectedData = ref({})

const store = selectedCyclesStore()
store.$subscribe((arg, data) => {
  selectedData.value = data
  const tempSlider = printView("t", data.selectedCycles, parseInt(data.selectedCycles.length / 2),
      parseInt(data.selectedCycles.length / 2) + 4, selectedBattery.value)
  printView("v", data.selectedCycles, parseInt(data.selectedCycles.length / 2),
      parseInt(data.selectedCycles.length / 2) + 4, selectedBattery.value)
  rangeVal.value = tempSlider.lineRangeForCycleId
  rangeMax.value = tempSlider.lineMaxForCycleId
  rangeMin.value = tempSlider.lineMinForCycleId
})

const changeBattery = () => {
  printView("t", selectedData.value.selectedCycles,rangeVal.value[0] - rangeMin.value,
      rangeVal.value[1] - rangeMin.value , selectedBattery.value)
  printView("v", selectedData.value.selectedCycles,rangeVal.value[0] - rangeMin.value,
      rangeVal.value[1] - rangeMin.value , selectedBattery.value)
}
const sliderInput = (e) => {
  rangeVal.value = e
  printView("t", selectedData.value.selectedCycles,e[0] - rangeMin.value,
      e[1] - rangeMin.value , selectedBattery.value)
  printView("v", selectedData.value.selectedCycles,e[0] - rangeMin.value,
      e[1] - rangeMin.value , selectedBattery.value)
}
onMounted(() => {
  d3.csv('src/csv/output7.csv').then(data => {
    selectedData.value.selectedCycles = data

    printView("t", data)
    printView("v", data)
    rangeMax.value = parseInt(data[data.length - 1]['number_of_cycles'])
    rangeMin.value = parseInt(data[0]['number_of_cycles'])
    rangeVal.value = [parseInt(data.length / 2), parseInt(data.length / 2) + 4]
  })
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
  }

  .function-bar {
    width: 100%;
    height: 15px;
    margin-top: 5px;
    margin-bottom: 0px;
    display: flex;
    line-height: 15px;
    justify-content: space-between;

    .slider {
      width: 60%;
      height: 100%;
      display: flex;
      justify-content: center;

      .el-slider {
        height: 100%;
      }
    }

    .input-battery{
      height: 100%;
      width: 30%;
      display: flex;
      flex-wrap: nowrap;
    }
  }

  .view{
    margin-bottom: 5px;
    position: relative;

    #bottom-line-t, #bottom-line-v {
      width: 100%;
      height:100%;
      position: absolute;
      top: 142px;
    }
  }

  .bottom {
    width: 100%;
    height: 20px;
    display: flex;
    justify-content: space-between;

  }

</style>