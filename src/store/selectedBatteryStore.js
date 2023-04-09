import {defineStore} from "pinia";
export const selectedBatteryStore = defineStore( {
    id: 'selectedBattery',
    state: () => {
        return {
            selectedBattery: null,
            selectedBatteryData: null,
        }
    },
    actions: {
        updateSelectedBattery(selectedBattery, selectedBatteryData){
            this.selectedBattery = selectedBattery;
            this.selectedBatteryData = selectedBatteryData
        },
    }
})