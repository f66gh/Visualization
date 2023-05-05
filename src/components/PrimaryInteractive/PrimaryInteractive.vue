<template>
  <div class="container">
    <div class="main-title" style="background-color: #4F9A95;">Primary Interactive View</div>
    <div class="view">
      <div class="sub-title">
        <div class="warn main-title" style="background-color: #bf7105">
          <div style="transform: rotate(-90deg)">WARN</div>
        </div>
        <div class="SOH main-title" style="background-color: #31658c">
          <div style="transform: rotate(-90deg); ">SOH Prediction & Feature Value</div>
        </div>
      </div>
      <div id="mainView">

      </div>
    </div>
  </div>

</template>

<script setup>
  import {printView} from "@/components/PrimaryInteractive/printView";
  import {output7} from '@/plugins/axiosInstance'
  import {selectedCyclesStore} from "@/store/selectedCyclesStore";
  import {batteryListStore} from "@/store/batteryListStore";
  import * as d3 from "d3";
  import Tools from "@/tools";
  const store = selectedCyclesStore()
  const storeForBattery = batteryListStore()
  import {connectionStatusStore} from "@/store/connectionStatusStore";
  import {onMounted} from "vue";
  const connectionStore = connectionStatusStore()

  // 本来是打算每次打开程序都读取一遍数据，但是pinia存取大数据比较慢，所以直接写死了弄成了json
    const readCsv = () => {
    const tempList = []
    const voltList = []
      const speedList = []
      const mileageList = []
    //这里边放的是一个三维数组
    d3.csv('src/csv/competition(original).csv').then((data) => {

      for(let i = 0; i < 27900; i+=100) {
        const tempCurrList = []
        const voltCurrList = []
        const speedCurrList = []
        const mileageCurrList = []
        for(let j = 0; j < 100; j++){
          const batteryTemp = data[i + j].cell_temp_list.split('_').map(v => +v)
          const batteryVolt = data[i + j].cell_volt_list.split(':')[1].split('_').map(v => +v)
          // 这里就是一个二维数组，横坐标是电池，纵坐标是数据记录周期
          tempCurrList.push(batteryTemp)
          voltCurrList.push(batteryVolt)
          // 速度和行驶里程是单列数组
          speedCurrList.push(+data[i + j].speed)
          mileageCurrList.push(+data[i + j].mileage)
        }
        // 是一个三维数据，注意调用
        tempList.push(tempCurrList)
        voltList.push({"col": voltCurrList})
        // 速度和行驶里程是二维数组
        speedList.push(speedCurrList)
        mileageList.push(mileageCurrList)
      }
      storeForBattery.updateBatteryTempList(tempList)
      storeForBattery.updateBatteryVoltList(voltList)
      // Tools.exportJson('tempList.json', JSON.stringify(tempList))
      Tools.exportJson('voltList.json', JSON.stringify(voltList))
      // Tools.exportJson('speedList.json', JSON.stringify(speedList))
      // Tools.exportJson('mileageList.json', JSON.stringify(mileageList))
      // Tools.exportJson('competition.json', JSON.stringify(data))
    })

    d3.csv('src/csv/output7.csv').then((data) => {
      // Tools.exportJson('output7.json', JSON.stringify(data))
    })
  }
  const dealFakeData = (tempList, voltList) => {
    const newTempList = tempList.map((v, i) => {
      return v.map(va => {
        return va.map(val => {
          return i < 220 ? val - 40 : i < 244 ? val - 40 + Math.floor(10 * (270 - i) / 50) :
              val - 35 + Math.floor(10 * (270 - i) / 50)
        })
      })
    })
    const newVoltList = voltList.map(v => {
      return v.map(va => {
        return va.map(val => {
          return val - 1000
        })
      })
    })

    Tools.exportJson('tempList.json', JSON.stringify(newTempList))
    // Tools.exportJson('voltList.json', JSON.stringify(newVoltList))
  }
  store.$subscribe((arg, data) => {
    printView(data.selectedCycles)
  })
  connectionStore.$subscribe(() => {
    printView(output7)
  })
  onMounted(() => {
    // readCsv()
    // dealFakeData(tempList, voltList)
  })
</script>

<style scoped lang="scss">
#mainView{
  margin-top: 26px;
  width: 1750px;
  height: 430px;
}
  .container{
    .view{
      height: 100%;
      display: flex;
      .sub-title{
        width: 27px;
        height: 100%;
        margin-top: 30px;
        .warn{
          height: 64px;
          width: 27px;
          margin-bottom: 20px;
        }

        .SOH{
          height: 350px;
          width: 27px;
          white-space: nowrap;
        }
      }
    }
  }
</style>