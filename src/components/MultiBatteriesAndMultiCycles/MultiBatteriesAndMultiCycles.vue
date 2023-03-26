<template>
    <div class="main-title" style="background-color: #31658C;">Multi-Batteries & Multi-Cycles Matrix</div>
    <div class="container">
      <div class="performance-line">
        <p>performance</p>
        <div class="performance">
          <div class="color" v-for="(item, index) in colorList" :key="index" :style="{backgroundColor: item}"></div>
        </div>
      </div>
      <div class="view-container">
        <div id="heatView"></div>
      </div>
    </div>
</template>

<script setup>
  import {reactive} from "@vue/reactivity";
  import {onMounted} from "vue";
  import {heatView} from "@/components/MultiBatteriesAndMultiCycles/printVeiw";

  const colorList = reactive(["#4f9a95", "#93ae74", "#ebbd62", "#bf7105", "#df4343"])

  onMounted(() => {
    heatView()
  })
</script>

<style scoped lang="scss">
::-webkit-scrollbar{
  display: none;
}
  .container{
    width: 387px;
    height: 330px;

    .performance-line{
      display: flex;
      justify-content: flex-end;
      height: 15px;
      align-items: center;

      p{
        font-size: 7px;
        height: 15px;
        line-height: 15px;
        margin-right: 5px;
      }

      .performance{
        width: 58px;
        height: 10px;
        display: flex;
        justify-content: space-between;

        .color{
          width: 19%;
          height: 100%;
          background-color: #4f9a95;
        }
      }
    }

    .view-container{
      width: 386px;
      height: 315px;
      margin: 0 0 0 10px;
      overflow-y: auto;

      #heatView{
        height: 1200px;
        width: 860px;
        margin-top: -375px;

      }
    }
  }
</style>