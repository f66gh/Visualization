//axiosInstance.js
//导入axios
import axios from 'axios'
import {ElLoading} from "element-plus";
import { ElMessage } from 'element-plus'
import {connectionStatusStore} from "@/store/connectionStatusStore";
import store from '@/store/index.js'

// const url = 'http://localhost:8081'
const url = 'http://8.130.111.45:8081/'

//使用axios下面的create([config])方法创建axios实例，其中config参数为axios最基本的配置信息。
const $http = axios.create({
    baseURL: url,
    timeout: 60000
})

const loadingOptions = {
    lock: true,
    background: 'rgba(255,255,255,.6)',
    text: "Be patient if it is a initial loading."
}

const loadingConstance = ElLoading.service(loadingOptions)

const statusStore = connectionStatusStore(store)

let competition, output7, tempList, speedList, mileageList, voltList

export const getAll = () => {
    const competitionPromise = $http.get("/competition")
    const output7Promise = $http.get("/output")
    const tempListPromise = $http.get("/tempList")
    const speedListPromise = $http.get("/speedList")
    const mileageListPromise = $http.get("/mileageList")
    axios.all([competitionPromise, output7Promise, tempListPromise, speedListPromise, mileageListPromise])
        .then((res) => {
            ElMessage({
                message: 'Loading success!',
                type: 'success'
            })
            competition = res[0].data
            output7 = res[1].data
            tempList = JSON.parse(res[2].data[0].data)
            speedList = JSON.parse(res[3].data[0].data)
            mileageList = JSON.parse(res[4].data[0].data)
            voltList = dealData(competition)
            statusStore.updateConnectionStatus(true)
        })
        .catch((err) => {
            ElMessage({
                message: 'Loading failure, please check your connection.',
                type: 'error'
            })
        })
        .finally(() => {
            loadingConstance.close()
        })
}

const dealData = (data) => {
    const result = [];
    for(let i = 0; i < 27900; i+=100) {
        const voltCurrList = []
        for(let j = 0; j < 100; j++){
            const batteryVolt = data[i + j].cell_volt_list.split(':')[1].split('_').map(v => +v)
            // 这里就是一个二维数组，横坐标是电池，纵坐标是数据记录周期
            voltCurrList.push(batteryVolt)
        }
        // 是一个三维数据，注意调用
        result.push(voltCurrList)
    }
    return result
}

export {competition, output7, voltList, tempList, speedList, mileageList}
