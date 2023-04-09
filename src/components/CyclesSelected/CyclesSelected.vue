<template>
    <div class="container">
      <div class="SC_legend">
        <img src="src/assets/SC_Lenged.png" alt="">
      </div>
        <div class="main-title" style="background-color: #31658C;"> Cycles Selected View</div>
        <div class="top">
            <div class="legend">
                <div class="title">Edge Layer Legend</div>
                <div class="legends" v-for="(item, index) in leftLegends" :key="index">
                    <div class="color" 
                        :style="{ backgroundColor: item.color }"
                        style="margin-right: 4px;"></div>
                    <div class="text">{{ item.text }}</div>
                </div>
            </div>
            <div class="legend">
                <div class="title" style="text-align: right;">Main Layer Legend</div>
                <div class="legends" 
                    v-for="(item, index) in rightLegends" 
                    :key="index"
                    style="justify-content:right;">
                    <div class="text" style="margin-right: 4px;">{{ item.text }}</div>
                    <div class="color" :style="{ backgroundColor: item.color }"></div>
                </div>
            </div>
        </div>
        <div class="view">
          <div id="main"></div>
        </div>
        <div class="bottom-legend">
            <div class="color"></div>
            <div class="text">State of Charge</div>
        </div>
    </div>
</template>

<script>
import { reactive } from "@vue/reactivity";
import {printView} from "@/components/CyclesSelected/printView";
import {defineComponent, onMounted} from "vue";

export default defineComponent({
  setup(){
    const leftLegends = reactive([
      { text: "value1 Abnormal", color: "#DA667E" },
      { text: "value2 Abnormal", color: "#BF7105" }
    ])
    const rightLegends = reactive([
      { text: "State of Health", color: "#93AE74" },
      { text: "Warning Range", color: "#EE9A9A" }
    ])
    onMounted(() => {
      const div = document.getElementById('main')
      const divProperty = div.getClientRects()[0]
      printView(divProperty.left, divProperty.right)
    })

    return{
      leftLegends,
      rightLegends,
    }
  }
})

</script>

<style lang="scss" scoped>
.legend {
    width: 120px;
    height: 100%;

    .title {
        font-size: 9px;
        margin-bottom: 3px;
    }

    .legends {
        width: 100%;
        height: 14px;
        display: flex;
        align-items: center;

        .color {
            width: 10px;
            height: 10px;
        }

        .text {
            font-size: 9px;
            color: #a6a6a6;
        }
    }
}

.container {
    width: 100%;
  position: relative;

  .SC_legend {
    position: absolute;
    left: -48px;
    top: 72px;
    pointer-events: none;

    img{
      transform: scale(0.46);
    }
  }

    .top {
        height: 45px;
        width: 100%;
        display: flex;
        justify-content: space-between;
        margin-top: 10px;
    }

    .view{
      width: 100%;
      height: 320px;
    }

    .bottom-legend{
        display: flex;
        align-items: center;
        //margin-top: 320px;
        .color {
            width: 10px;
            height: 10px;
            background-color: #EBBD62;
            margin-right: 4px;
        }

        .text{
            font-size: 9px;
            color: #a6a6a6;
        }
    }
}
</style>