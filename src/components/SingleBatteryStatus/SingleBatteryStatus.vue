<template>
  <div class="main-container-ver">
    <div class="main-title-ver" style="background-color: #4F9A95;"><p>Batteries Status</p></div>
    <div class="batteries-container" style="border: none">
      <div class="battery" v-for="(single, index) in batteries" :key="index">
        <div class="sub-title"><p>{{single.title}}</p></div>
        <div class="info">
          <div class="detail" v-for="(detail, id) in single.info" :key="id">
            {{detail.text}}:{{detail.data}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  const batteries = [{title: "No.1", info: [{text: 'Volt', data: "4.7v"}, {text: 'Temp', data: "56℃"}, {text: 'SOC', data: '72%'}]},
    {title: "No.2", info: [{text: 'Volt', data: "4.8v"}, {text: 'Temp', data: "48℃"}, {text: 'SOC', data: '69%'}]},
    {title: "No.3", info: [{text: 'Volt', data: "5.7v"}, {text: 'Temp', data: "50℃"}, {text: 'SOC', data: '87%'}]},
    {title: "No.4", info: [{text: 'Volt', data: "4.7v"}, {text: 'Temp', data: "51℃"}, {text: 'SOC', data: '85%'}]},
    {title: "No.5", info: [{text: 'Volt', data: "4.6v"}, {text: 'Temp', data: "53℃"}, {text: 'SOC', data: '36%'}]}]
</script>

<style scoped lang="scss">
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

  .battery{
    height: 50px;
    width: 90px;
    justify-content: space-between;
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