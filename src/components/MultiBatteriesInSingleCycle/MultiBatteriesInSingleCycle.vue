<template>
    <div class="main-title" style="background-color: #31658C;"> Muti-Batteries in Single Cycle View</div>
    <div class="main-container" style="width: 326px; margin: 10px 0 0 0">
      <div class="top-container">
        <div class="grid-view">
          <div id="dotView"></div>
        </div>
        <div class="right-settings">
          <div class="Performance">
            <div class="text">Performance</div>
            <div class="color-container">
              <div class="color" v-for="(item, index) in colorList" :key="index" :style="{backgroundColor: item}"></div>
            </div>
            <div class="label">
              <div class="normal">normal</div>
              <div class="failure">Failure</div>
            </div>
          </div>
          <div class="settings-container">
            <div class="setting-box border" v-for="(item, index) in settingList" :key="index">
              <div class="title">{{item.title}}</div>
              <div class="btn-box">
                <div class="btn" v-for="(btn, id) in item.btnList" :key="id">
                  <el-button style="width: 80%; height: 100%; border-radius: 3px" @click="clickBtn(index, id)"
                    :style="{backgroundColor: selectedBtn[index][id] ? '#529b97' : 'white'}">
                    <p :style="{color: selectedBtn[index][id] ? 'white' : '#529b97'}">{{btn}}</p>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="bottom-container" style="border: none">
        <div class="single-battery border">
          <div class="sub-title">Battery No.05</div>
          <div class="data-text">
            <div class="single-column" v-for="(column, index) in dataColumns" :key="index">
              <div class="single-data" v-for="(data, index) in column" :key="index">{{data.title}}:{{data.data}}</div>
            </div>
          </div>
          <div class="graph-container">
            <div class="line-chart">
              <div id="lineView"></div>
            </div>
            <div class="violin-chart">
              <div class="legends">
                <div class="legend" v-for="(item, index) in violinLegends" :key="index">
                  <div class="color" :style="{backgroundColor: item.color}"></div>
                  <div class="text">{{item.title}}</div>
                </div>
              </div>
              <div class="violin-container">
                <div id="violinView"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="voltage-comparison border">
          <div class="sub-title" style="background-color: #4f9a95">Voltage Comparison</div>
            <div class="violin">
              <div id="violinSetView-volt"></div>
            </div>
        </div>
        <div class="temperature-comparison border">
          <div class="sub-title" style="background-color: #4f9a95">Temperature Comparison</div>
            <div class="violin">
              <div id="violinSetView-temp"></div>
            </div>
        </div>
      </div>
    </div>
</template>

<script setup>
  import {reactive, ref} from "@vue/reactivity";
  import {dotView, violinView, violinSetView, lineView} from "@/components/MultiBatteriesInSingleCycle/printView";
  import {onMounted} from "vue";
  import {singleCycleStore} from "@/store/singleCycleStore";
  import * as d3 from 'd3'

  const colorList = reactive(["#4f9a95", "#93ae74", "#ebbd62", "#bf7105", "#df4343"])
  const settingList = reactive([{title: "xAxisTemp", btnList:["Max", "Min", "Ave"]}, {title: "yAxisTemp", btnList: ["Max", "Min"]}])
  const selectedBtn = reactive([[true, false, false, false], [true, false]])
  const violinLegends = reactive([{title: 'Temp', color: '#BF7105'}, {title: 'Volt', color: '#4f9a95'}])
  const dataColumns = reactive([[{title: "Temp Max", data: "51.3℃"}, {title: "Current Ave", data: "214.5A"}, {title: "Current Max", data: "256.1A"}],
    [{title: "Voltage Ave", data: "5.4v"}, {title: "Voltage Max", data: "6.0v"}, {title: "Temp Ave", data: "45.2℃"}]])
  const cycle = ref({})

  const useStore = singleCycleStore()
  useStore.$subscribe((arg, state) => {

    // 加一个是哪一次循环的字段
    d3.csv('src/csv/output7.csv').then(res => {
      for(let line of res){
        const SOH = parseFloat(line['SOH'])

        if(SOH === state.singleCycle[5].SOH) {
          cycle.value = line['number_of_cycles']
          break
        }
      }
      dotView(cycle.value, 'max', 'max')
      violinView(cycle.value, 5)
      violinSetView('volt', cycle.value)
      violinSetView('temp', cycle.value)
      lineView(cycle.value, 5)
    })
  })
  const clickBtn = (index, id) => {
    selectedBtn[index].fill(false)
    selectedBtn[index][id] = true
    switchAxis(index, id)
  }

  const switchAxis = (index, id) => {
    let volt = 'max'
    let temp = 'max'
    if(index === 0)  {
      if(id === 0) temp = 'max'
      else if(id === 1) temp = 'min'
      else temp = 'ave'
    } else {
      if(id === 0) volt = 'max'
      else volt = 'min'
    }
    dotView(cycle.value, temp, volt)
  }

  onMounted(() => {
    // dotView()
    // violinView()
    // violinSetView('volt')
    // violinSetView('temp')
    // lineView()
  })

</script>

<style lang="scss" scoped>
.border{
  border: 1px solid #e5e5e5;
  border-radius: 3px;
}

.sub-title{
  width: 308px;
  height: 17px;
  background-color: #90756a;
  text-align: center;
  line-height: 17px;
  font-size: 11px;
  font-weight: normal;
  margin: 5px auto;
  color: white;
  border-radius: 2px;
}

.violin{
  width: 100%;
  height: 70px;
}

  .top-container{
    width: 100%;
    height: 213px;
    display: flex;

    .grid-view{
      width: 200px;
      height: 200px;
    }

    .right-settings{
      height: 100%;
      width: 106px;

      .Performance{
        width: 100%;
        height: 52px;

        .text{
          font-size: 7px;
          margin-bottom: 4px;
        }

        .color-container{
          width: 100%;
          height: 21px;
          display: flex;
          justify-content: space-between;

          .color{
            width: 19%;
            height: 100%;
            background-color: #4f9a95;
          }
        }

        .label{
          display: flex;
          justify-content: space-between;
          height: 11px;
          line-height: 11px;

          &:nth-child(n){
            font-size: 7px;
            color: #A6A6A6;
          }
        }

      }

      .settings-container{
        height: 113px;
        margin-top: 10px;
        width: 100%;

        .setting-box{
          width: 100%;
          height: 48px;
          display: flex;
          flex-wrap: wrap;

          &:nth-of-type(1){
            height: 72px;
            margin-bottom: 10px;
          }

          .title{
            font-size: 12px;
            width: 100%;
            text-align: center;
          }

          .btn-box{
            width: 100px;
            height: 40px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            margin: 0 auto;

            .btn{
              height: 50%;
              width: 50%;
              margin: 2px 0;
              display: flex;
              justify-content: center;
            }
          }
        }
      }
    }
  }

  .bottom-container{
    height: 404px;
    width: 100%;
    top: 225px;

    .single-battery{
      height: 165px;
      width: 317px;

      .data-text{
        width: 100%;
        height: 47.5px;
        display: flex;
        justify-content: space-around;

        .single-column{
          width: 40%;
          height: 100%;

          .single-data{
            height: 30%;
            width: 100%;
            font-size: 13px;
          }
        }
      }

      .graph-container{
        width: 300px;
        height: 79px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;

        .line-chart{
          height: 100%;
          width: 220px;
        }

        .violin-chart{
          height: 100%;
          width: 70px;
          margin-top: 2px;

          .legends{
            width: 100%;
            display: flex;
            justify-content: space-between;
            height: 22px;

            .legend{
              width: 55px;
              height: 22px;
              display: flex;
              flex-wrap: wrap;
              justify-content: center;

              .color{
                height: 10px;
                width: 10px;
              }

              .text{
                font-size: 8px;
                width: 100%;
                text-align: center;
                height: 12px;
                line-height: 12px;
              }
          }
          }

          .violin-container{
            width: 70px;
            height: 55px;

            #violinView{
              width: 70px;
              height: 55px;
            }
          }
        }
      }
    }

    .voltage-comparison{
      height: 100px;
      margin-top: 15px;
      width: 317px;
    }

    .temperature-comparison{
      width: 317px;
      margin-top: 15px;
      height: 100px;
    }
  }


</style>