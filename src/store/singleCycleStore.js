import {defineStore} from "pinia";

export const singleCycleStore = defineStore({
    id: 'user',
    state: () => {
        return {
            singleCycle: null,
            aveCtb: null
        }
    },
    actions: {
        updateSingleCycle(singleCycle){
            this.singleCycle = singleCycle
        },
        updateAveCtb(aveCtb){
            this.aveCtb = aveCtb
        }
    }
})