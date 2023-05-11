<template>
    <div class="main-title" style="background-color: #31658C; justify-content: space-around">
      <p style="margin-left: 20px">Raw Data</p>
      <p style="margin-right: 20px">Cycle No.{{selectedCycle}}</p>
    </div>
    <div class="container">
      <div class="top-container">
        <div class="info-container border">
          <div class="sub-title" style="background-color: #4f9a95">Car Info.</div>
          <div class="info">
            <div class="pic">
              <img src="../../assets/electric-car-g987221023_1920.jpg" alt="">
            </div>
            <div class="info-detail-container border">
              <div class="info-detail" v-for="(item, index) in info" :key="index">
                {{item.title}}:{{item.data}}
              </div>
            </div>
          </div>
        </div>
        <div class="vehicle-container border">
          <div class="sub-title">Selected View Status</div>
          <div class="status-container">
            <div class="status" v-for="(item, index) in vehicleStatus" :key="index">
              {{item.title}}:{{item.data}}
            </div>
          </div>
        </div>
      </div>
      <div class="scroll-bar-container">
        <div class="title-line">
          <span>Time Range Select</span>
          <span style="color: #888; font-size: 12px;">{{selectedStartTime}}~{{selectedEndTime}}</span>
        </div>
        <div class="slider">
          <el-slider v-model="rangeVal" range
                     :max="rangeMax" :min="rangeMin"
                     @input="sliderInput" :show-tooltip="false"
          ></el-slider>
          <div class="slider-span">
            <span style="color: #888; font-size: 12px;">{{startTime}}</span>
            <span style="color: #888; font-size: 12px;">{{endTime}}</span>
          </div>
        </div>
      </div>
      <div class="bottom-container border">
        <div class="sub-title" style="background-color: #4f9a95">Range Status</div>
        <div class="legends">
          <div class="single-legend" v-for="(item, idx) in legends" :key="idx">
            <div class="color" :style="{backgroundColor: item.color}"></div>
            <p>{{item.text}}</p>
          </div>
        </div>
        <div class="chart-container">
          <div id="rangeLine"></div>
        </div>
      </div>
      <div id="tip-o-d"></div>
    </div>
</template>

<script setup>
  import {reactive, ref} from "@vue/reactivity";
  import {lineView} from "@/components/OriginData/printView";
  import {selectedCycleNumStore} from "@/store/selectedCycleNumStore";
  import * as d3 from 'd3'
  import {onMounted} from "vue";
  import {competition} from '@/plugins/axiosInstance'
  import {connectionStatusStore} from "@/store/connectionStatusStore";
  const connectionStore = connectionStatusStore()

  // 注意这里写死了100
  const rangeVal = ref([30, 60])
  const rangeMax = ref(100)
  const rangeMin = ref(0)


  const startTime = ref('')
  const endTime = ref('')
  const selectedStartTime = ref('')
  const selectedEndTime = ref('')

  const sliderInput = (e) => {
    rangeVal.value = e
    lineView(selectedCycle.value, e)
    getOriginList(selectedCycle.value, e)
  }

  const info = reactive([{title: 'CarName', data: 'Trail Car'}, {title: 'Car ID', data: '476532'},
    {title: 'Battery Num', data: '95'}, {title: 'mode', data: '1'}])
  const vehicleStatus = reactive([{title: 'time', data: '2019/3/15'}, {title: 'curr_cycle', data: '1'},
    {title: 'vehicle_state', data: '1'}, {title: 'charging_state', data: '3'}])

  const legends = reactive([{color: '#bf7105', text: 'Total Volt'}, {color: '#4f9a95', text: 'Total Temp'}, {color: '#df4343', text: 'speed'}, {color: '#93ae74', text: 'mileage'}])

  const cyclesStore = selectedCycleNumStore()
  const selectedCycle = ref(1) // 当前选中的循环

  cyclesStore.$subscribe((arg, state) => {
    vehicleStatus[1].data = state.selectedCycleNum - 1
    selectedCycle.value = state.selectedCycleNum
      lineView(selectedCycle.value, rangeVal.value)
    getOriginList(selectedCycle.value)
  })

  let originList;

  connectionStore.$subscribe(() => {
    originList = competition
    getOriginList(selectedCycle.value)
  })

  const getOriginList = (selectedCycle = 1, e = [30, 60]) => {
    if(!originList) return;
    const selectedList = []
      // 这里直接用的100次时间周期构成的单次循环
      for(let i = (selectedCycle) * 100; i <= (selectedCycle + 1) * 100; i++){
        selectedList.push(originList[i])
      }
      vehicleStatus[0].data = selectedList[0].yr_modahrmn
      vehicleStatus[2].data = selectedList[0].vehicle_state
      vehicleStatus[3].data = selectedList[0].charging_status
      startTime.value = selectedList[0].yr_modahrmn
      endTime.value = selectedList[99].yr_modahrmn
      selectedStartTime.value = selectedList[e[0]].yr_modahrmn
      selectedEndTime.value = selectedList[e[1]].yr_modahrmn

  }

</script>

<style lang="scss" scoped>
  .sub-title{
    width: 100%;
    height: 17px;
    background-color: #90756a;
    text-align: center;
    line-height: 17px;
    font-size: 11px;
    font-weight: normal;
    color: white;
    border-radius: 2px;
  }

  .border{
    border: 1px solid #e5e5e5;
    border-radius: 3px;
  }

  .container{
    height: 378px;
    width: 100%;
    margin-top: 8px;
    position: relative;

    .top-container{
      width: 100%;
      height: 120px;
      display: flex;
      justify-content: space-between;

      .info-container{
        width: 280px;
        height: 100%;
        padding: 7px;

        .info{
          display: flex;
          justify-content: space-between;
          height: 140px;
          width: 100%;
          margin-top: 8px;

          .pic{
            overflow: hidden;
            height: 86px;
            border-radius: 4px;
            img{
              width: 140px;
            }
          }

          .info-detail-container{
            width: 131px;
            height: 86px;

            .info-detail{
              height: 19px;
              width: 100%;
              white-space: nowrap;
              font-size: 13px;
              line-height: 19px;
              margin-bottom: 3px;
            }
          }
        }
      }

      .vehicle-container{
        height: 120px;
        width: 170px;
        padding: 7px;

        .status-container{
          height: 140px;
          width: 100%;
          margin-top: 8px;

          .status{
            height: 19px;
            margin-bottom: 6px;
            width: 100%;
            white-space: nowrap;
            font-size: 13px;
            line-height: 19px;
          }
        }
      }
    }

    .scroll-bar-container{
      width: 100%;
      height: 55px;
      margin: 15px 0;

      .title-line {
        margin: 10px 0 5px 0;
        display: flex;
        justify-content: space-between;
        width: 70%;
        line-height: 20px;
      }

      .slider {
        display: flex;
        justify-content: center;
        width: 90%;
        margin-left: 5%;
        margin-top: -0%;
        flex-wrap: wrap;

        .slider-span{
          width: 100%;
          display: flex;
          justify-content: space-between;
          margin-top: -6px;
        }
      }
    }

    .bottom-container{
      width: 96.5%;
      height: 160px;
      padding: 7px;

      .legends{
        width: 90%;
        height: 16px;
        display: flex;

        .single-legend{
          width: 70px;
          height: 100%;
          display: flex;
          align-items: center;
          margin-right: 10px;

          .color{
            width: 10px;
            height: 10px;
            margin-right: 5px;
          }

          p{
            font-size: 9px;
            height: 10px;
            line-height: 10px;
            white-space: nowrap;
          }
        }
      }

      .chart-container{
        width: 100%;
        height: 127px;

        .rangeLine{
          width: 100%;
          height: 100%;
        }
      }
    }
  }
  #tip-o-d{
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