import * as d3 from "d3"
import tempList from '@/json/tempList.json'
import voltList from '@/json/voltList.json'
import {selectedBatteryStore} from "@/store/selectedBatteryStore";
import {batteryListStore} from "@/store/batteryListStore";

// 因为温度探针只有34个，而电池（可检测电压）总数有95个，故只展示34个电池的数据
const batteryLen = tempList[0][0].length
let res;

const updateData = (singleCycle, circleData, res) => {
    const currTemp = res[singleCycle - 1][`battery_${circleData.number}_temp`]
    const currTempList = currTemp.split(',')
    let tempAve = 0, tempHigh = 0, tempLow = 10000
    currTempList.forEach(v => {
        v = +v
        if(v > tempHigh) tempHigh = v
        else if(v < tempLow) tempLow = v
        tempAve += v
    })
    tempAve /= 100

    const currVolt = res[singleCycle - 1][`battery_${circleData.number}_volt`]
    const currVoltList = currVolt.split(',')
    let voltAve = 0, voltHigh = 0, voltLow = 10000
    currVoltList.forEach(v => {
        v = +v
        if(v > voltHigh) voltHigh = v
        else if(v < voltLow) voltLow = v
        voltAve += v
    })
    voltAve /= 100

    const selectedBattery = selectedBatteryStore()
    selectedBattery.updateSelectedBattery(circleData.number, {
        tempAve, tempHigh, tempLow, voltAve, voltHigh, voltLow
    })
}
export const dealData = (tempList, voltList) => {
    const batteryLen = voltList[0][0].length
    const dataList = [{}] // 最终数据
    voltList.forEach((v, i) => {
        const dataArr = [[]] // 临时存储
        v.forEach((va, id) => {
            for(let n = 0; n < batteryLen; n++){
                if(!dataArr[n]) dataArr.push([])
                dataArr[n].push(va[n])
            }
        })
        dataArr.forEach((va, id) => {
            if(!dataList[i]) dataList.push({})
            dataList[i][`battery_${id + 1}_volt`] = va.join(',')
        })
    })
    tempList.forEach((v, i) => {
        const dataArr = [[]] // 临时存储
        v.forEach((va, id) => {
            for(let n = 0; n < batteryLen; n++){
                if(!dataArr[n]) dataArr.push([])
                dataArr[n].push(va[n])
            }
        })
        dataArr.forEach((va, id) => {
            if(!dataList[i]) dataList.push({})
            dataList[i][`battery_${id + 1}_temp`] = va.join(',')
            dataList[i]['number_of_cycles'] = i + 1
        })
    })
    res = dataList
    const listStore = batteryListStore()
    listStore.updateBatteryVoltList(dataList)
}

const getArr = (res, cycle, battery) => {
    if(battery) {
        const currData = res[+(cycle) + 1]
        const voltArrStr = currData[`battery_${battery}_volt`]
        const tempArrStr = currData[`battery_${battery}_temp`]

        const voltArr = voltArrStr.split(',').map(v => {
            return +v
        })

        const tempArr = tempArrStr.split(',').map(v => {
            return +v
        })
        return {voltArr, tempArr}
    } else {
        const currData = res[+(cycle) + 1]
        let voltArrStr = []
        let tempArrStr = []
        for(let i = 1; i <= batteryLen; i++) {
            voltArrStr.push(currData[`battery_${i}_volt`])
            tempArrStr.push(currData[`battery_${i}_temp`])
        }
        const voltArr = voltArrStr.map(v => v.split(',').map(v => +v))
        const tempArr = tempArrStr.map(v => v.split(',').map(v => +v))

        return {voltArr, tempArr}
    }
}
export const dotView = (singleCycle, currTempBtn, currVoltBtn) => {
    const main = d3.select('#dotView');
    const width = 800;
    const height = 800;
    const margin = 50;
    main.select('svg').remove()
    //建立svg对象
    const svg = main.append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)

    const findMax = (allLst) => {
        return allLst.map((v, i) => {
            return {
                'data': v.sort((a, b) => a - b)[0],
                'number': i + 1
            }
        })
    }

    const findMin = (allLst) => {
        return allLst.map((v, i) => {
            return {
                'data': v.sort((a, b) => b - a)[0],
                'number': i + 1
            }
        })
    }

    const findAve = (allLst) => {
        return allLst.map((v, i) => {
            let sum = 0
            v.forEach(v => sum += v)
            return {
                'data': sum,
                'number': i + 1
            }
        })
    }
        const currData = res[singleCycle - 1]

        const strTempArr = []
        const strVoltArr = []
        let currDotArr = []

        for(let i = 1; i <= batteryLen; i++) {
            strTempArr.push(currData[`battery_${i}_temp`])
            strVoltArr.push(currData[`battery_${i}_volt`])
            currDotArr.push({number: i})
        }

        const tempAllBatteryArr = strTempArr.map(v => {
            const arr = v.split(',')
            const newArr = arr.map(v => parseFloat(v))
            return newArr
        })

        const voltAllBatteryArr = strVoltArr.map(v => {
            const arr = v.split(',')
            const newArr = arr.map(v => parseFloat(v))
            return newArr
        })

        const maxTempArr = findMax(tempAllBatteryArr)
        const minTempArr = findMin(tempAllBatteryArr)
        const aveTempArr = findAve(tempAllBatteryArr)
        const maxVoltArr = findMax(voltAllBatteryArr)
        const minVoltArr = findMin(voltAllBatteryArr)
        const aveVoltArr = findAve(voltAllBatteryArr)

        let currTempArr
        let currVoltArr

        if(currVoltBtn === 'max') {
            currVoltArr = maxVoltArr
        } else if (currVoltBtn === 'min') {
            currVoltArr = minVoltArr
        } else currVoltArr = aveVoltArr

        if(currTempBtn === 'max') {
            currTempArr = maxTempArr
        } else if (currTempBtn === 'min') {
            currTempArr = minTempArr
        } else currTempArr = aveTempArr

    let high = 0
    let low = 10000
    let ave = 0
    currTempArr.forEach(v => {
        v = v.data
        if(v > high) high = v
        else if(v < low) low = v
        ave += v
    })
    ave = ave / batteryLen

    currDotArr = currDotArr.map((v, i) => {
            return {
                volt: currVoltArr[i].data,
                temp: currTempArr[i].data,
                number: i + 1,
                status: Math.abs(currTempArr[i].data - ave) / (high - low)
            }
        })

    const statusList = []
    currDotArr.forEach((v) => {
        statusList.push(v.status)
    })


    function colorScale(num){

        const color = d3.scaleLinear()
            .domain(d3.extent(statusList))
            .range(['#4f9a95', '#df4343'])
        return color(num)
    }

        const yDomain = currVoltArr.map(v => v.data)
        const xDomain = currTempArr.map(v => v.data)

        const yScale = d3.scaleLinear()
            .domain([d3.min(yDomain) - 0.5, d3.max(yDomain) + 0.5])
            .range([height - margin, margin])
        const xScale = d3.scaleLinear()
            .domain([d3.min(xDomain) - 0.5, d3.max(xDomain) + 0.5])
            .range([margin, width - margin])

        const xAxis = g => g
            .attr('transform', `translate(0, ${height - margin})`)
            .call(d3.axisBottom(xScale).ticks(10))
            .call(g => g.append('text').attr('font-size', 40))

        const yAxis = g => g
            .attr('transform', `translate(${margin}, 0)`)
            .call(d3.axisLeft(yScale).ticks(10))
            .call(g => g.append('text'))

        const grid = g => g
            .attr('stroke', '#ddd')
            .attr('stroke-opacity', .8)
            .call(g => g.append('g')
                .selectAll('line')
                .data(xScale.ticks(50))
                .join("line")
                .attr("x1", d => 0.5 + xScale(d))
                .attr("x2", d => 0.5 + xScale(d))
                .attr("y1", margin)
                .attr("y2", height - margin))
            .call(g => g.append("g")
                .selectAll("line")
                .data(yScale.ticks(20))
                .join("line")
                .attr("y1", d => 0.5 + yScale(d))
                .attr("y2", d => 0.5 + yScale(d))
                .attr("x1", margin)
                .attr("x2", width - margin));

        const circle = svg.append("g")
            .selectAll('circle')
            .data(currDotArr)
            .enter()
            .append('circle')
            .attr('fill', d => colorScale(d['status']))
            .attr('cx', d => xScale(d.temp))
            .attr('cy', d => yScale(d.volt))
            .attr('r', d => 14)

    circle.on('mousemove', () => {
        circle.attr('cursor', 'pointer')
    })

    circle.on('click', ({}, circleData) => {
        violinView(singleCycle - 1, circleData.number - 1)
        lineView(singleCycle - 1, circleData.number - 1)
        updateData(singleCycle, circleData, res)
    })

        svg.append("g")
            .selectAll('text')
            .data(currDotArr)
            .enter()
            .append('text')
            .attr('x', d => xScale(d.temp) - 10)
            .attr('y', d => yScale(d.volt) + 5)
            .text(d => d['number'])
            .attr('font-size', 16)
            .attr('fill', 'white')

        svg.append("g").call(xAxis)
        svg.append("g").call(yAxis)
        svg.append("g").call(grid)

    updateData(singleCycle, {number: 1}, res)
}

export const violinView = (cycle, battery) => {
    const width = 80

    const height = 55
    const margin = 5
    const offset = 5

    const main = d3.select("#violinView")

    main.selectAll('svg').remove()
    const svg = main
        .append('svg')
        .attr('width', width)
        .attr('height', height)

    const svgLeft = svg.append('g')
        .attr('width', width / 2)
        .attr('height', height)


    const svgRight = svg.append('g')
        .attr('width', width / 2)
        .attr('height', height)
        .attr('transform', `translate(${width / 2}, 0)`)


    function obj(name, value) {
        this.name = name
        this.value = value
    }

    const calcTempDis = (data) => {
        //以后可以自己设置每一段的区间大小和分派多少区间
        let tempDisArr = new Array(11)
        let max = d3.max(data),
            min = d3.min(data),
            n = 10
        tempDisArr[0] = new obj(`>=${max}`, 0)
        tempDisArr[n + 1] = new obj(`<${min}`, 0)
        for (let i = 1; i <= n; i++) {
            const str = `<${max - (i - 1) * (max - min) / (n)} && >=${max - (i) * (max - min) / (n)}`
            tempDisArr[i] = new obj(str, 0)
        }

        data.forEach((v, i) => {
            v = +v
            if (v >= max) {
                tempDisArr[0]['value']++
            } else if (v < min) {
                tempDisArr[n + 1]['value']++
            } else
                for (let i = 1; i <= n; i++) {
                    if (v < max - (i - 1) * (max - min) / (n) && v >= max - (i) * (max - min) / (n)) {
                        tempDisArr[i]['value']++
                    }
                }

        })
        return tempDisArr
    }

    const calcVoltDis = (data) => {
        //以后可以自己设置每一段的区间大小和分派多少区间
        let voltDisArr = new Array(11)
        let max = d3.max(data),
            min = d3.min(data),
            n = 10
        voltDisArr[0] = new obj(`>=${max}`, 0)
        voltDisArr[n + 1] = new obj(`<${min}`, 0)
        for (let i = 1; i <= n; i++) {
            const str = `<${max - (i - 1) * (max - min) / (n)} && >=${max - (i) * (max - min) / (n)}`
            voltDisArr[i] = new obj(str, 0)
        }

        data.forEach((v, i) => {
            v = +v
            if (v >= max) {
                voltDisArr[0]['value']++
            } else if (v < min) {
                voltDisArr[n + 1]['value']++
            } else
                for (let i = 1; i <= n; i++) {
                    if (v < max - (i - 1) * (max - min) / (n) && v >= max - (i) * (max - min) / (n)) {
                        voltDisArr[i]['value']++
                    }
                }

        })
        return voltDisArr
    }

        const {voltArr, tempArr} = getArr(res, cycle, battery)

        const tempDisArr = calcTempDis(tempArr)
        const voltDisArr = calcVoltDis(voltArr)

        const yScaleTemp = d3.scaleBand()
            .domain(tempDisArr.map(d => d.name)).range([margin, height - margin])
        const yScaleVolt = d3.scaleBand()
            .domain(voltDisArr.map(d => d.name)).range([margin, height - margin])

        const xScaleTemp = d3.scaleLinear()
            .domain([d3.max(tempDisArr.map(d => d.value)), d3.min(tempDisArr.map(d => -d.value))])
            .range([1, width / 2 - margin * 2 - 1])
        const xScaleVolt = d3.scaleLinear()
            .domain([d3.max(voltDisArr.map(d => d.value)), d3.min(voltDisArr.map(d => -d.value))])
            .range([1, width / 2 - margin * 2 - 1])

        const xAxisTemp = d3.axisBottom().scale(xScaleTemp)
        const xAxisVolt = d3.axisBottom().scale(xScaleVolt)

        const middleLineTemp = d3.line()
            .x(d => xScaleTemp(0))
            .y(d => yScaleTemp(d.name))

        const middleLineVolt = d3.line()
            .x(d => xScaleVolt(0))
            .y(d => yScaleVolt(d.name))

        const areaTempPos = d3.area()
            .y(d => yScaleTemp(d.name))
            .x0(xScaleTemp(0))
            .x1(d => xScaleTemp(d.value))
            .curve(d3.curveCardinal)

        const areaTempNeg = d3.area()
            .y(d => yScaleTemp(d.name))
            .x0(xScaleTemp(0))
            .x1(d => xScaleTemp(-d.value))
            .curve(d3.curveCardinal)

        const areaVoltPos = d3.area()
            .y(d => yScaleVolt(d.name))
            .x0(xScaleVolt(0))
            .x1(d => xScaleVolt(d.value))
            .curve(d3.curveCardinal)

        const areaVoltNeg = d3.area()
            .y(d => yScaleVolt(d.name))
            .x0(xScaleVolt(0))
            .x1(d => xScaleVolt(-d.value))
            .curve(d3.curveCardinal)

        // svgLeft.append('g').call(yAxisTemp).attr('transform', `translate(${margin * 2}, 0)`)
        // svgRight.append('g').call(yAxisVolt).attr('transform', `translate(${width / 2 - margin * 2}, 0)`)

        svgLeft.append('g').call(xAxisTemp).attr('transform',
            `translate(${margin}, ${height - margin + 3})`)
        svgRight.append('g').call(xAxisVolt).attr('transform', `translate(0, ${height - margin + 3})`)

        svgLeft.append('path')
            .datum(tempDisArr)
            .attr('transform', `translate(${offset},${offset})`)
            .attr('d', d => areaTempPos(d))
            .attr('fill', "#5a99c5")
            .attr('stroke', 'none')

        svgLeft.append('path')
            .datum(tempDisArr)
            .attr('transform', `translate(${offset},${offset})`)
            .attr('d', d => areaTempNeg(d))
            .attr('fill', "#5a99c5")

        svgLeft.append('path')
            .datum(tempDisArr)
            .attr('d', d => middleLineTemp(d))
            .attr('stroke', '#a6a6a6')
            .attr('stroke-width', '2')
            .attr('transform', `translate(${offset},${offset})`)

        svgRight.append('path')
            .datum(voltDisArr)
            .attr('fill', '#bcaba4')
            .attr('transform', `translate(0,${offset})`)
            .attr('d', d => areaVoltPos(d))

        svgRight.append('path')
            .datum(voltDisArr)
            .attr('fill', '#bcaba4')
            .attr('transform', `translate(0,${offset})`)
            .attr('d', d => areaVoltNeg(d))

        svgRight.append('path')
            .datum(voltDisArr)
            .attr('d', d => middleLineVolt(d))
            .attr('stroke', '#a6a6a6')
            .attr('stroke-width', '2')
            .attr('transform', `translate(0,${offset})`)
}

export const violinSetView = (type, cycle) => {
    const width = 2100
    let height = 67
    const margin = 5
    let color = null

    const main = d3.select(`#violinSetView-${type}`)
    main.selectAll('svg').remove()
    const svg = main
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)

        let newArr = []
        const {voltArr, tempArr} = getArr(res, cycle)
        if(type === 'volt'){
            color = '#afa8a5'

            newArr = voltArr
        }else {
            color = '#5a99c5'
            newArr = tempArr
        }

        let max = 0
        let min = 10000

        for(let i = 0; i < batteryLen; i++) {
            max = max < d3.max(newArr[i]) ? d3.max(newArr[i]) : max
            min = min > d3.min(newArr[i]) ? d3.min(newArr[i]) : min
        }

        const yScale = d3.scaleLinear()
            .domain([min, max])
            .range([height, 0])

        const yScaleArea = d3.scaleLinear()
            .domain([0, yScale.ticks(20).length])
            .range([0, height])

        const xScaleVio = d3.scaleLinear()
            .domain([0, batteryLen])
            .range([margin, width - margin])


        const areaGen = d3.area()
            .y((d, i) => {
                return yScaleArea(i)
            })
            .x0(d => -d.length)
            .x1(d => d.length)
            .curve(d3.curveCatmullRom)


        const histoGramGen = d3.histogram()
            .domain(yScale.domain())
            .thresholds(yScale.ticks(20))

        svg.selectAll('.violinPath')
            .data(newArr)
            .enter()
            .append('path')
            .attr('id', (d, i) => 'violinPath' + i)
            .attr('class', 'violinPath')
            .attr('transform', (d, i) => `translate(${xScaleVio(i) + 35}, 2)`)
            .attr('d', d => {
                return areaGen(histoGramGen(d))
            })
            .style('fill', color)

    svg.selectAll('.violinText')
        .data(newArr)
        .enter()
            .append('text')
        .attr('class', 'violinPath')
            .attr('transform', (d, i) => `translate(${xScaleVio(i) + 28}, 8)`)
            .text((d, i) => `No.${i + 1}`)
            .attr("font-size", 8)
            .attr("fill", '#888')

}

export const lineView = (cycle, battery) => {
    const main = d3.select('#lineView');
    const width = 219;
    const height = 85;
    const margin = 5;
    main.selectAll('svg').remove()
    //建立svg对象
    const svg = main.append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)

        const {voltArr, tempArr} = getArr(res, cycle, battery)

        const yScaleLeft = d3.scaleLinear()
            .domain([d3.min(tempArr) - 1, d3.max(tempArr) + 1])
            .range([height - margin, margin])
        const yScaleRight = d3.scaleLinear()
            .domain([d3.min(voltArr) - 1, d3.max(voltArr) + 1])
            .range([height - margin, margin])
        const xScale = d3.scaleLinear()
            .domain([1, tempArr.length])
            .range([margin, width - margin])

        const lineTemp = d3.line()
            .x((d, i) => xScale(i + 1))
            .y(d => yScaleLeft(d))
            .curve(d3.curveCardinal)

        const lineVolt = d3.line()
            .x((d, i) => xScale(i + 1))
            .y(d => yScaleRight(d))
            .curve(d3.curveCardinal)

        const xAxis = g => g
            .attr('transform', `translate(0, ${height - margin})`)
            .call(d3.axisBottom(xScale).ticks(10))
            .call(g => g.append('text'))

        const yAxisLeft = g => g
            .attr('transform', `translate(${margin}, 0)`)
            .call(d3.axisLeft(yScaleLeft).ticks(10))
            .call(g => g.append('text'))

        const yAxisRight = g => g
            .attr('transform', `translate(${width - margin}, 0)`)
            .call(d3.axisRight(yScaleRight).ticks(10))
            .call(g => g.append('text'))


        const grid = g => g
            .attr('stroke', '#ddd')
            .attr('stroke-opacity', .8)
            .call(g => g.append('g')
                .selectAll('line')
                .data(xScale.ticks(50))
                .join("line")
                .attr("x1", d => 0.5 + xScale(d))
                .attr("x2", d => 0.5 + xScale(d))
                .attr("y1", margin)
                .attr("y2", height - margin))
            .call(g => g.append("g")
                .selectAll("line")
                .data(yScaleLeft.ticks(20))
                .join("line")
                .attr("y1", d => 0.5 + yScaleLeft(d))
                .attr("y2", d => 0.5 + yScaleLeft(d))
                .attr("x1", margin)
                .attr("x2", width - margin));

        svg.append("g").call(xAxis)
        svg.append("g").call(yAxisLeft)
        svg.append("g").call(yAxisRight)
        svg.append("g").call(grid)

        svg.append("path")
            .datum(tempArr)
            .attr('d', d => lineTemp(d))
            .attr('stroke', '#4f9a95')
            .attr('stroke-width', 2)
            .attr('fill', 'none')

        svg.append("path")
            .datum(voltArr)
            .attr('d', d => lineVolt(d))
            .attr('stroke', '#bf7105')
            .attr('stroke-width', 2)
            .attr('fill', 'none')

    document.addEventListener('selectstart',function(e){
        e.preventDefault();
    })

}