<template>
    <div class="main-title" style="background-color: #31658C; justify-content: space-around">
      <p style="margin-left: 20px">Original Data</p>
      <p style="margin-right: 20px">Cycle.465</p>
    </div>
    <div class="container">
      <div class="top-container">
        <div class="info-container border">
          <div class="sub-title" style="background-color: #4f9a95">Car Info.</div>
          <div class="info">
            <div class="pic">
              <img src="" alt="">
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
          Time Range Select
        </div>
        <div class="slider">
          <el-slider v-model="rangeVal" range
                     :max="rangeMax" :min="rangeMin"
                     @input="sliderInput" :show-tooltip="false"
          ></el-slider>
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
    </div>
</template>

<script setup>
  import {reactive, ref} from "@vue/reactivity";
  import {onMounted} from "vue";
  import {lineView} from "@/components/OriginData/printView";

  const rangeVal = ref([5, 10])
  const rangeMax = ref(20)
  const rangeMin = ref(0)
  const sliderInput = () => {

  }

  const info = reactive([{title: 'CarName', data: 'BYD Qin'}, {title: 'Car ID', data: '476532'},
    {title: 'Battery Num', data: '45'}, {title: 'mode', data: 'Electric'}])
  const vehicleStatus = reactive([{title: 'time', data: '2019/3/15'}, {title: 'curr_cycle', data: '143'},
    {title: 'vehicle_status', data: 'Normal'}, {title: 'charging_state', data: 'DrivingCharge'}])

  const legends = reactive([{color: '#bf7105', text: 'Total Volt'}, {color: '#4f9a95', text: 'Total Curr'}, {color: '#df4343', text: 'speed'}, {color: '#93ae74', text: 'mileage'}])

  onMounted(() => {
    lineView()
  })
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
            width: 140px;
            height: 100%
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
      margin: 20px 0;

      title-line {
        margin: 10px 0 5px 0;
      }

      .slider {
        display: flex;
        justify-content: center;
        width: 80%;
        margin-left: 10%;
        margin-top: 3%;
      }
    }

    .bottom-container{
      width: 96.5%;
      height: 156px;
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
</style>