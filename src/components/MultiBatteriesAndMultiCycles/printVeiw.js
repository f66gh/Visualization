import * as d3 from 'd3'
// import tempList from '@/json/tempList.json'
import voltList from '@/json/voltList.json'
import {batteryListStore} from "@/store/batteryListStore";
const dealData = (list) => {
    // 第一遍读取数据，得到每一次循环所有电池的数据（平均值）
    const cycleLen = list[0].length
    const batteryLen = list[0][0].length
    const dataArr = list.map((v, i) => {
        const batteryDataList = new Array(batteryLen).fill(0)
        v.map((va, id) => {
            va.map((val, idx) => {
                batteryDataList[idx] += +(val) // 这个是计算每一个电池在一次循环中的数据和
            })
        })
        return batteryDataList.map(v => v / cycleLen) // 电池在这一次循环的数据列表
    })

    // 第二遍，计算每一次循环的平均值和最高最低值
    const dataList = dataArr.map((v, i) => {
        let sum = 0;
        let high = 0;
        let low = 10000;
        v.map((va, id) => {
            sum += va
            if(high < va) high = va
            else if(low > va) low = va
        })
        const ave = sum / batteryLen
        return {
            ave,
            high,
            low
        }
    })

    // 第三遍，将数据结合
    const dealList = dataArr.map((v, i) => {
        return v.map((va, id) => {
            const {ave, high, low} = dataList[i]
            return {
                data: va,
                battery: id + 1,
                cycle: i + 1,
                ave,
                high,
                low,
                status: Math.abs(va - ave) / (high - low)
            }
        })
    })

    // 第四遍，提取最大的n
    let n = 0
    dealList.forEach((v, i) => {
        v.forEach((va, id) => {
            if(va.status > n) n = va.status
        })
    })

    return {dealList, n}
}
export const heatView = () => {

    // 我想这样计算，某一块电池的温度高于或低于当前循环中所有电池的平均温度加减n%的最高最低温差时，以n的数值作为损坏的具体表现
    // 最低值为0，最高值为正无穷
    // 电压同理，电压和温度取最坏者作为电池损坏的具体表现

    // const {dealList: tempArr, n: tempMaxStatus} = dealData(tempList)
    const {dealList: voltArr, n: voltMaxStatus} = dealData(voltList)

    // 第五遍，融合两个数组
    // const sumArr = tempArr.map((v, i) => {
    //     return v.map((va, id) => {
    //         return {
    //             temp: va,
    //             volt: voltArr[i][id]
    //         }
    //     })
    // })


    const cycleLen = voltArr.length
    const batteryLen = voltArr[0].length

    //建立容器对象
    const main = d3.select('#heatView');
    //设置绘图框尺寸
    const width = 950;
    const height = 2790;
    //建立svg对象
    const svg = main.append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)

    const tip = d3.select('#tip')

        const x = d3.scaleLinear()
            .domain([0, batteryLen - 1]).range([0, width])

        const y = d3.scaleLinear()
            .domain([0, cycleLen - 1])
            .rangeRound([0, height])

    const colorScaleVolt = d3.scaleLinear()
            .domain([0, voltMaxStatus])
            .range(['#4f9a95', 'rgba(79,154,149,0)'])

        svg.selectAll('g')
            .data(voltArr)
            .join('g')
            // 因为计算误差，所以为了视觉效果统一设置为10
            // .attr('transform', (d, i) => {
            //     return `translate(0, ${y(i)})`
            // })
            .attr('transform', (d, i) => {
                return `translate(0, ${i * 10})`
            })
            .attr('fill', '#999')
            .attr('width', '200')
            .attr('height', '100')
            .selectAll('rect')
            .data(d => d)
            .join('rect')
            .attr('x', (d, i) => x(i))
             // 因为计算误差，所以为了视觉效果统一设置为9
            // .attr('width', (d, i) => x(i + 1) - x(i) - 1)
            // .attr('height', (d, i) => y(i + 1) - y(i) - 1)
            .attr('width', (d, i) => 9)
            .attr('height', (d, i) => 9)
            .attr("rx", '1')
            .attr('fill', (d, i) => {
                    return colorScaleVolt(d.status)
                }
            )
            .on("mousemove", ({clientX, clientY}, rectData) => {
                tip.style('display', 'block')
                    .style('left', `${clientX + window.scrollX - 1376}px`)
                    .style('top', `${clientY + window.scrollY - 551}px`)
                    .html(`
                            <div>Battery No.${rectData.battery}</div>
                            <div>Cycle No.${rectData.cycle}</div>
                            <div>Volt: ${rectData.data}</div>
                            <div>status: ${
                        rectData.status
                    }</div>
                        `)
            })
            .on('mouseout', () => {
                tip.style('display', 'none')
            })



}