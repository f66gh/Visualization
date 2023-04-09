import * as d3 from 'd3'
import mileageList from '@/json/mileageList.json'
import speedList from '@/json/speedList.json'
import tempList from '@/json/tempList.json'
import voltList from '@/json/voltList.json'
export const lineView = (selectedCycle, e) => {
    // slide的input事件会在还没有读取到json的时候触发，判断一下是否已经读完json
    if(!mileageList || !speedList || !tempList || !voltList) return
    const main = d3.select('#rangeLine');
    const width = 460;
    const height = 131;
    const margin = 5;
    main.select('svg').remove()
    //建立svg对象
    const svg = main.append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)

    const tip = d3.select('#tip-o-d')

    // 当前选中循环的所有电压和温度以及行驶里程和速度
    const currTempList = tempList[selectedCycle - 1]
    const currVoltList = voltList[selectedCycle - 1]
    const len = e[1] - e[0]

        let currTempArr = currTempList.map(v => {
            let sum = 0;
            v.forEach(vi => sum += +(vi))
            return sum / len
        })
        let currVoltArr = currVoltList.map(v => {
            let sum = 0;
            v.forEach(vi => sum += +(vi))
            return sum / len
        })

    let currSpeedArr = speedList[selectedCycle - 1]
    let currMileageArr = mileageList[selectedCycle - 1]


    if(e) {
        const tmpTempArr = []
        const tmpVoltArr = []
        const tmpMileageArr = []
        const tmpSpeedArr = []

            for(let i = e[0]; i < e[1]; i++) {
                tmpTempArr.push(currTempArr[i])
                tmpVoltArr.push(currVoltArr[i])
                tmpMileageArr.push(currMileageArr[i])
                tmpSpeedArr.push(currSpeedArr[i])
            }

            currVoltArr = tmpVoltArr
            currTempArr = tmpTempArr
            currMileageArr = tmpMileageArr
            currSpeedArr = tmpSpeedArr
    }

    const currData = {currTempArr, currVoltArr, currSpeedArr, currMileageArr}

        const yScaleLeft = d3.scaleLinear()
            .domain([d3.min(currTempArr) - 1, d3.max(currTempArr) + 1])
            .range([height - margin, margin])
        const yScaleRight = d3.scaleLinear()
            .domain([d3.min(currVoltArr), d3.max(currVoltArr)])
            .range([height - margin, margin])

    const yScaleMileage = d3.scaleLinear()
        .domain(d3.extent(currMileageArr))
        .range([height - margin, margin])
    const yScaleSpeed = d3.scaleLinear()
        .domain([d3.min(currSpeedArr) - 2, d3.max(currSpeedArr) + 1])
        .range([height - margin, margin])
        const xScale = d3.scaleLinear()
            .domain([0, len - 1])
            .range([margin, width - margin])

        const lineTemp = d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScaleLeft(d))
            .curve(d3.curveCardinal)

        const lineVolt = d3.line()
            .x((d, i) => xScale(i))
            .y(d => yScaleRight(d))
            .curve(d3.curveCardinal)

    const lineSpeed = d3.line()
        .x((d, i) => xScale(i))
        .y(d => yScaleSpeed(d))
        .curve(d3.curveCardinal)

    const lineMileage = d3.line()
        .x((d, i) => xScale(i))
        .y(d => yScaleMileage(d))
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
            .datum(currData)
            .attr('d', d => lineTemp(d.currTempArr))
            .attr('stroke', '#4f9a95')
            .attr('stroke-width', 2)
            .attr('fill', 'none')

    svg.append("g")
        .selectAll('circle')
        .data(currTempArr)
        .enter()
        .append('circle')
        .attr('fill', 'white')
        .attr('cx', (d, i) => xScale(i))
        .attr('cy', (d) => yScaleLeft(d))
        .attr('r', d => 2)
        .attr('stroke', '#4f9a95')
        .on("mousemove", ({
                              clientX,
                              clientY
                          }, data) => {
            tip.style('display', 'block')
                .style('left', `${clientX + window.scrollX - 1806}px`)
                .style('top', `${clientY + window.scrollY - 550}px`)
                .html(`
                            <div>temperature: ${data}℃</div>
                        `)
        })
        .on('mouseout', () => {
            tip.style('display', 'none')
        })

    svg.append("path")
        .datum(currData)
        .attr('d', d => lineVolt(d.currVoltArr))
        .attr('stroke', '#bf7105')
        .attr('stroke-width', 2)
        .attr('fill', 'none')

    svg.append("g")
        .selectAll('circle')
        .data(currVoltArr)
        .enter()
        .append('circle')
        .attr('fill', 'white')
        .attr('cx', (d, i) => xScale(i))
        .attr('cy', (d) => yScaleRight(d))
        .attr('r', d => 2)
        .attr('stroke', '#bf7105')
        .on("mousemove", ({
                              clientX,
                              clientY
                          }, data) => {
            tip.style('display', 'block')
                .style('left', `${clientX + window.scrollX - 1806}px`)
                .style('top', `${clientY + window.scrollY - 550}px`)
                .html(`
                            <div>Voltage: ${data}mV</div>
                        `)
        })
        .on('mouseout', () => {
            tip.style('display', 'none')
        })


    svg.append("path")
        .datum(currData)
        .attr('d', d => lineSpeed(d.currSpeedArr))
        .attr('stroke', '#df4343')
        .attr('stroke-width', 1)
        .attr('fill', 'none')

    svg.append("g")
        .selectAll('circle')
        .data(currSpeedArr)
        .enter()
        .append('circle')
        .attr('fill', 'white')
        .attr('cx', (d, i) => xScale(i))
        .attr('cy', (d) => yScaleSpeed(d))
        .attr('r', d => 2)
        .attr('stroke', '#df4343')
        .on("mousemove", ({
                              clientX,
                              clientY
                          }, data) => {
            tip.style('display', 'block')
                .style('left', `${clientX + window.scrollX - 1806}px`)
                .style('top', `${clientY + window.scrollY - 550}px`)
                .html(`
                            <div>Speed: ${data}</div>
                        `)
        })
        .on('mouseout', () => {
            tip.style('display', 'none')
        })


    svg.append("path")
        .datum(currData)
        .attr('d', d => lineMileage(d.currMileageArr))
        .attr('stroke', '#93ae74')
        .attr('stroke-width', 1)
        .attr('fill', 'none')

    svg.append("g")
        .selectAll('circle')
        .data(currMileageArr)
        .enter()
        .append('circle')
        .attr('fill', 'white')
        .attr('cx', (d, i) => xScale(i))
        .attr('cy', (d) => yScaleMileage(d))
        .attr('r', d => 2)
        .attr('stroke', '#93ae74')
        .on("mousemove", ({
                              clientX,
                              clientY
                          }, data) => {
            tip.style('display', 'block')
                .style('left', `${clientX + window.scrollX - 1806}px`)
                .style('top', `${clientY + window.scrollY - 550}px`)
                .html(`
                            <div>Mileage: ${data}</div>
                        `)
        })
        .on('mouseout', () => {
            tip.style('display', 'none')
        })


}