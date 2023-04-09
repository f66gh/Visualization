import {defineStore} from "pinia";
export const batteryListStore = defineStore( {
    id: 'batteryListStore',
    state: () => {
        return {
            batteryTempList: null,
            batteryVoltList: null,
        }
    },
    actions: {
        updateBatteryTempList(batteryTempList){
            this.batteryTempList = batteryTempList
        },
        updateBatteryVoltList(batteryVoltList){
            this.batteryVoltList = batteryVoltList
        }
    }
})