import {defineStore} from "pinia";
export const connectionStatusStore = defineStore( {
    id: 'connectionStatusStore',
    state: () => {
        return {
            connectionStatus: false,
        }
    },
    actions: {
        updateConnectionStatus(connectionStatus){
            this.connectionStatus = connectionStatus
        },
    }
})