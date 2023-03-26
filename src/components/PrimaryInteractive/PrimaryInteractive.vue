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
  import {onMounted} from "vue";
  import {selectedCyclesStore} from "@/store/selectedCyclesStore";
  import * as d3 from "d3";
  const store = selectedCyclesStore()
  store.$subscribe((arg, data) => {
    printView(data.selectedCycles)
  })
  onMounted(() => {
    d3.csv('src/csv/output7.csv').then(data => {
      printView(data)
    })
  })


</script>

<style scoped lang="scss">
#mainView{
  margin-top: 26px;
  width: 1350px;
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