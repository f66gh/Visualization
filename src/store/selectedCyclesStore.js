import {defineStore} from "pinia";
export const selectedCyclesStore = defineStore( {
    id: 'selectedCycles',
    state: () => {
        return {
            selectedCycles: null,
        }
    },
    actions: {
        updateSelectedCycles(selectedCycles){
            this.selectedCycles = selectedCycles
        }
    }
})