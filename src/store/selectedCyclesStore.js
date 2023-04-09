import {defineStore} from "pinia";
export const selectedCyclesStore = defineStore( {
    id: 'selectedCycles',
    state: () => {
        return {
            selectedCycleNum: null,
            selectedCycles: null
        }
    },
    actions: {
        updateSelectedCycleNum(selectedCycleNum){
            this.selectedCycleNum = selectedCycleNum
        },
        updateSelectedCycles(selectedCycles){
            this.selectedCycles = selectedCycles
        }
    }
})