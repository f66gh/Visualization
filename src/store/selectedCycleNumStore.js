import {defineStore} from "pinia";
export const selectedCycleNumStore = defineStore( {
    id: 'selectedCycleNum',
    state: () => {
        return {
            selectedCycleNum: null,
            // 这里存的是100次原始时间周期数据构成的假循环中的部分字段
            selectedCycleOriginDataList: null,
        }
    },
    actions: {
        updateSelectedCycleNum(selectedCycleNum){
            this.selectedCycleNum = selectedCycleNum
        },
        updateSelectedCycleOriginDataList(selectedCycleOriginDataList){
            this.selectedCycleOriginDataList = selectedCycleOriginDataList
        }
    }
})