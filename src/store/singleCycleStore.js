import {defineStore} from "pinia";

export const singleCycleStore = defineStore({
    id: 'user',
    state: () => {
        return {
            singleCycle: null
        }
    },
    actions: {
        updateSingleCycle(singleCycle){
            this.singleCycle = singleCycle
        }
    }
})