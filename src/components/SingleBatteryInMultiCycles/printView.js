import * as d3 from 'd3'

export const printView = (type, selectedData, middleLeft , middleRight, selectedBattery = 1) => {
    const leftBox = d3.select('#left-box-' + type)
    const middleLine = d3.select('#middle-line-' + type)
    const rightBox = d3.select('#right-box-' + type)
    const bottomLeftBox = d3.select('#bottom-left-box-' + type)
    const bottomRightBox = d3.select('#bottom-right-box-' + type)
    const bottomLine = d3.select('#bottom-line-' + type)
    const topAxisLeftBox = d3.select("#top-left-Axis-" + type)
    const topAxisRightBox = d3.select("#top-right-Axis-" + type)
    const topAxisMiddleBox = d3.select('#top-middle-Axis-' + type)
    const height = 124;
    const bottomHeight = 20;
    const margin = 10;
    const boxWidth = 140
    const lineWidth = 628
    const barStroke = '#6e6e6e'
    const middleLineStroke = '#1a1a1a'
    const middleRange = middleRight - middleLeft + 1 || 5
    const singleCycleLen = 100 // 注意这个写死了


    const dealArrLst = (lst) => {
        let arrLst = []
        lst.forEach((v, i) => {
            arrLst.push(v.split(","))
        })
        return arrLst
    }

    const dealAveLst = (arrLst) => {
        let aveLst = []
        arrLst.forEach((v, i) => {
            let tmp = 0
            v.forEach((v, i) => {
                tmp += +v
            })
            aveLst.push(tmp / v.length)
        })
        return aveLst
    }

    const dealObjLst = (aveLst, boxDomain) => {
        let arrLst = [[], [], [], [], []]
        boxDomain.forEach((v, id) => {
            for(let i = v[0]; i < v[1]; i++){
                arrLst[id].push(aveLst[i])
            }
        })
        return arrLst.map((v) => {
            v.sort((a, b) => a - b)
            return { //中位数，上下四分位数以及最大值
                Q1: d3.quantile(v, 0.25),
                Q2: d3.quantile(v, 0.5),
                Q3: d3.quantile(v, 0.75),
                min: +v[0],
                max: +v[v.length - 1]
            }
        })
    }

    const dealBox = (svg, scaleX, objLst, leftBoxDomainStr, barStroke, middleLineStroke, scaleY, pos) => {
        const groups = svg.selectAll('.g').data(objLst)
        const groupsEnter = groups.enter().append('g').attr('class', 'g')
        groupsEnter.append('rect').attr('fill-opacity', '0').attr('stroke', barStroke)
        groupsEnter.each(function () { //注意这里不能写成箭头函数，this指针往外找了（
            for (let i = 0; i < 5; i++) {
                d3.select(this).append('line')
                    .attr('stroke', barStroke)
            }
        })
        let groupsUpdate = groupsEnter.merge(groups)

        let num = 0
        groupsUpdate.selectAll('rect') //绘制盒子矩形
            .attr('x', (d, i) => scaleX(leftBoxDomainStr[num++]))
            .attr('y', (d) => scaleY(d.Q3))
            .attr('width', scaleX.bandwidth())
            .attr('height', (d) => scaleY(d.Q1) - scaleY(d.Q3))
            .attr('stroke', '#6e6e6e')
            .attr('stroke-width', 0.5)

        let yAxisGenerator

        if(pos === 'l') yAxisGenerator = d3.axisLeft(scaleY).ticks(3)
        else yAxisGenerator = d3.axisRight(scaleY).ticks(3)

        svg.append('g')
            .attr('transform', pos === 'r' ? `translate(0, 0)` : `translate(${boxWidth}, 0)`)
            .call(yAxisGenerator)
            .selectAll('text')
            .text(d => d)
            .attr('font-size', '8px')
            .attr('fill', '#31658c')

        groupsUpdate.each(function (d, i) { //绘制五条连接线
            let x1 = scaleX(leftBoxDomainStr[i % 5]);
            let x2 = x1 + scaleX.bandwidth();
            let middle = (x1 + x2) / 2;

            let minLine = {
                x1: x1,
                y1: scaleY(d.min),
                x2: x2,
                y2: scaleY(d.min)
            };
            let Q2Line = {
                x1: x1,
                y1: scaleY(d.Q2),
                x2: x2,
                y2: scaleY(d.Q2)
            };
            let maxLine = {
                x1: x1,
                y1: scaleY(d.max),
                x2: x2,
                y2: scaleY(d.max)
            };
            let linkLine1 = {
                x1: middle,
                y1: scaleY(d.max),
                x2: middle,
                y2: scaleY(d.min)
            };
            let linkLine2 = {
                x1: middle,
                y1: scaleY(d.Q3),
                x2: middle,
                y2: scaleY(d.Q3)
            };
            let lines = [minLine, Q2Line, maxLine, linkLine1, linkLine2];

            d3.select(this)
                .selectAll('line')
                .each(function (d, i) {
                    d3.select(this)
                        .attr('x1', lines[i].x1)
                        .attr('x2', lines[i].x2)
                        .attr('y1', lines[i].y1)
                        .attr('y2', lines[i].y2)
                        .attr('stroke', '#a6a6a6')
                        .attr('stroke-width', 1)
                        .attr('stroke-dasharray', () => i === 3 ? "2,2" : "")
                });
        });
    }

    const dealAve = (aveLst, boxDomain) => {
        let aveAveLst = []
        boxDomain.forEach((v, id) => {
            let tmp = 0
            for(let i = v[0]; i < v[1]; i++){
                tmp += +aveLst[i]
            }
            aveAveLst.push(tmp / (v[1] - v[0]))
        })
        return aveAveLst
    }

    const printBoxHorAxis = (box, xScale, boxWidth, boxHeight, p, AxisColor, padding, topAxis) => {
        box.selectAll("g.cell")
            .data(xScale.domain())
            .enter().append("g").classed("cell", true)
        topAxis.selectAll("g.cell")
            .data(xScale.domain())
            .enter().append("g").classed("cell", true)

        box.selectAll("g.cell")
            .data(xScale.domain())
            .exit().remove()
        topAxis.selectAll("g.cell")
            .data(xScale.domain())
            .exit().remove()

        topAxis.selectAll("g.cell")
            .data(xScale.domain())
            .attr("width", 10)
            .attr("height", 10)
            .attr("transform", (d, i) => `translate(${xScale(d) - 4}, 10)`)
            .append("text")
            .text(() => `-${padding}-`)
            .attr("font-size", 8)
            .attr("fill", AxisColor)

        box.append('line')
            .attr('x2', boxWidth)
            .attr('stroke', '#a6a6a6')
            .attr('stroke-width', 2)
            .clone(true)
            .attr('y1', boxHeight)
            .attr('y2', boxHeight)

        if(p) {
            box.append('line')
                .attr('stroke', '#a6a6a6')
                .attr('stroke-width', 2)
                .attr('x1', boxWidth)
                .attr('x2', boxWidth)
                .attr('y1', 0)
                .attr('y2', boxHeight)

        }
        else box.append('line')
            .attr('stroke', '#a6a6a6')
            .attr('stroke-width', 2)
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', boxHeight)
    }

    const printDivider = (box, xScale, boxHeight, middleRange) => {
        for(let i = 1; i < middleRange; i++) {
            box.append('line')
                .attr('x1', xScale(i * singleCycleLen))
                .attr('x2', xScale(i * singleCycleLen))
                .attr('stroke', '#a6a6a6')
                .attr('y2', boxHeight)
                .attr("stroke-dasharray", "2,2")
        }
    }


    const lineColor = () => type === 't' ? '#31658c' : '#df4343'
    const rectColor = () => type === 't' ? '#4f9a95' : '#bf7105'
    const aveLineColor = () => type === 't' ? '#55453f' : '#b29ed8'
    const AxisColor = '#31658c'
    const horizontalLineColor = '#ebbd62'
    const name = () => type === 't' ? 'temp' : 'volt'

    leftBox.selectAll('svg').remove()
    middleLine.selectAll('svg').remove()
    rightBox.selectAll('svg').remove()
    bottomLeftBox.selectAll('svg').remove()
    bottomRightBox.selectAll('svg').remove()
    bottomLine.selectAll('svg').remove()
    topAxisLeftBox.selectAll('svg').remove()
    topAxisRightBox.selectAll('svg').remove()
    topAxisMiddleBox.selectAll('svg').remove()

    const svgLeft = leftBox.append('svg')
        .attr('viewBox', `0 0 ${boxWidth} ${height}`)

    const svgMiddle = middleLine.append('svg')
        .attr('viewBox', `0 0 ${lineWidth} ${height}`)

    const svgRight = rightBox.append('svg')
        .attr('viewBox', `0 0 ${boxWidth} ${height}`)

    const svgLeftBottom = bottomLeftBox.append('svg')
        .attr('viewBox', `0 0 ${boxWidth} ${bottomHeight}`)

    const svgRightBottom = bottomRightBox.append('svg')
        .attr('viewBox', `0 0 ${boxWidth} ${bottomHeight}`)

    const svgBottomAbove = bottomLine.append('svg')
        .attr('viewBox', `0 0 936 ${bottomHeight}`)

    const svgTopAxisLeft = topAxisLeftBox.append('svg')
        .attr('viewBox', `0 0 ${boxWidth} 10`)

    const svgTopAxisRight = topAxisRightBox.append('svg')
        .attr('viewBox', `0 0 ${boxWidth} 10`)

    const svgTopAxisMiddle = topAxisMiddleBox.append('svg')
        .attr('viewBox', `0 0 ${lineWidth} 10`)

    svgMiddle.append('rect')
        .attr('height', height)
        .attr('width', lineWidth)
        .attr('stroke', '#a6a6a6')
        .attr('fill', 'none')
        .attr('stroke-width', 2)

    const batteryData = selectedData
        //计划入下：全局数据，用曲线图表示中间五个电池数据，两侧分别用五个箱线图等分覆盖所有数据。
        //设计中间五个电池的序号取值范围可变，设计两边电池数据序号范围可变。若超出了数据范围则不显示

        const lineRangeInit = middleLeft || Math.floor(batteryData.length / 2)
        const lineRangeEnd = middleRight || Math.floor(batteryData.length / 2) + 5
        let lineRange = [] //初始化显示中间5个
        let lineRangeForCycleId = [] //五个循环的标号
        let lineMaxForCycleId = 0
        let lineMinForCycleId = 0

        let leftBoxDomain = []
        let rightBoxDomain = []

        const leftBoxSingleRange = Math.floor(lineRangeInit / 5)
        const rightBoxSingleRange = Math.floor((batteryData.length - lineRangeEnd) / 5)

        // 左右两边箱线图的5次循环
        for (let i = 0; i < 5; i++) {
            leftBoxDomain.unshift([lineRangeInit - (i + 1) * leftBoxSingleRange, lineRangeInit - i *
            leftBoxSingleRange - 1
            ])
            rightBoxDomain.push([lineRangeInit + i * rightBoxSingleRange + middleRange, lineRangeInit + (i + 1) *
            rightBoxSingleRange + middleRange - 1
            ])
        }


        // 中间折线图的n次循环
    for(let i = 0; i < middleRange; i++) {
        lineRange.push(lineRangeInit + i)
        lineRangeForCycleId.push(parseInt(batteryData[lineRangeInit + i]['number_of_cycles']))
    }

    const noneDisplayPadding = Math.floor(lineRangeForCycleId.length / 10) + 1 // 隐藏坐标轴标签的间隔

        lineMinForCycleId = parseInt(batteryData[leftBoxDomain[0][0]]['number_of_cycles'])
        lineMaxForCycleId = parseInt(batteryData[rightBoxDomain[4][1] - 1   ]['number_of_cycles'])

        let tempLst = []
        batteryData.forEach((v, i) => {
            tempLst.push(v[`battery_${selectedBattery}_${name()}`])
        })
        const leftBoxDomainStr = leftBoxDomain.map(v => {
            return v.join("-")
        })
        const rightBoxDomainStr = rightBoxDomain.map(v => {
            return v.join("-")
        })
        let tempArrLst = dealArrLst(tempLst)
        //求最大值和最小值，注意因为Map在操控元素为对象的数组时采用的是地址拷贝，所以其实是会改变原数组的
        const max = tempArrLst.map(v => {
            const tmp = [...v]
            return tmp.sort((a, b) => a - b)[0]
        }).sort((a, b) => a - b)[0]
        const min = tempArrLst.map(v => {
            const tmp = [...v]
            return tmp.sort((a, b) => b - a)[0]
        }).sort((a, b) => b - a)[0]
        let tempAveLst = dealAveLst(tempArrLst)
        let tempObjLstLeft = dealObjLst(tempAveLst, leftBoxDomain)
        let tempObjLstRight = dealObjLst(tempAveLst, rightBoxDomain)

        let aveAve = 0
        tempAveLst.forEach(v => {
            aveAve += v
        })
        aveAve = aveAve / tempAveLst.length

        const leftScaleX = d3.scaleBand()
            .domain(leftBoxDomainStr)
            .range([margin, boxWidth - margin])
            .padding(0.6)

        const rightScaleX = d3.scaleBand()
            .domain(rightBoxDomainStr)
            .range([margin, boxWidth - margin])
            .padding(0.6)

        const scaleY = d3.scaleLinear()
            .domain([max, min])
            .range([height, 0])

        dealBox(svgLeft, leftScaleX, tempObjLstLeft, leftBoxDomainStr, barStroke, middleLineStroke, scaleY, 'l')
        dealBox(svgRight, rightScaleX, tempObjLstRight, rightBoxDomainStr, barStroke, middleLineStroke, scaleY, 'r')

        let lineArr = []
        for(let i = 0; i < middleRange; i++){
            lineArr = lineArr.concat(tempArrLst[lineRange[i]])
        }

        const xScaleLine = d3.scaleLinear()
            .domain([1, middleRange * singleCycleLen - 1])
            .range([margin, lineWidth - margin])

        const linePath = d3.line()
            .x((d, i) => xScaleLine(i))
            .y(d => scaleY(+d))
            .curve(d3.curveCardinal)

        svgMiddle.append("path")
            .datum(lineArr)
            .attr('d', d => linePath(d))
            .attr('stroke', lineColor)
            .attr('stroke-width', 1)
            .attr('fill', 'none')

        const leftAve = dealAve(tempAveLst, leftBoxDomain)
        const rightAve = dealAve(tempAveLst, rightBoxDomain)

        const yScaleRect = d3.scaleLinear()
            .domain(d3.extent(leftAve.concat(rightAve)))
            .range([0, bottomHeight])

        svgLeftBottom.selectAll('rect')
            .data(leftAve)
            .join('rect')
            .attr('height', d => yScaleRect(d))
            .attr('width', d => leftScaleX.bandwidth() * 0.6)
            .attr('x', (d, i) => leftScaleX(leftBoxDomainStr[i]))
            .attr('y', d => bottomHeight - yScaleRect(d))
            .attr('fill', rectColor())

        svgRightBottom.selectAll('rect')
            .data(rightAve)
            .join('rect')
            .attr('height', d => yScaleRect(d))
            .attr('width', d => rightScaleX.bandwidth() * 0.6)
            .attr('x', (d, i) => rightScaleX(rightBoxDomainStr[i]))
            .attr('y', d => bottomHeight - yScaleRect(d))
            .attr('fill', rectColor())

        svgBottomAbove.append('line')
            .attr('x1', 0)
            .attr('y1', yScaleRect(aveAve))
            .attr('x2', 936)
            .attr('y2', yScaleRect(aveAve))
            .attr('stroke', aveLineColor())
            .attr('stroke-width', 2)
            .attr("stroke-dasharray", "3,1")

        svgBottomAbove.append('g')
            .append('rect')
            .attr('height', 10)
            .attr('width', 40)
            .attr('x', 936 / 2 - 20)
            .attr('y', yScaleRect(aveAve) - 10 / 2)
            .attr('fill', aveLineColor())
            .style("stroke-dasharray","10,5")


        svgBottomAbove.select('g')
            .append('text')
            .style('display', 'inline-block')
            .text(d => aveAve.toFixed(2))
            .attr('fill', '#fff')
            .attr('font-size', 8)
            .attr('transform', type === 't' ?
                `translate (${936 / 2 - 10} ${yScaleRect(aveAve) + 2})`
                : `translate (${936 / 2 - 13} ${yScaleRect(aveAve) + 2})`
            )

        //线横坐标标签
        const cal = (i) => (xScaleLine(i * singleCycleLen) + xScaleLine((i + 1) * singleCycleLen)) / 2
        svgTopAxisMiddle.selectAll("g.cell")
            .data(lineRangeForCycleId)
            .enter().append("g").classed('cell', true)
        svgTopAxisMiddle.selectAll("g.cell")
            .data(lineRangeForCycleId)
            .exit().remove()
        svgTopAxisMiddle.selectAll("g.cell")
            .data(lineRangeForCycleId)
            .attr("width", 10)
            .attr("height", 10)
            .attr("transform", (d, i) => `translate(${cal(i) - 10.5}, 10)`)
            .append("text")
            .text(d => `-${d}-`)
            .attr('display', (d, i) => i % noneDisplayPadding === 0 ? 'inline-block' : 'none')
            .attr("font-size", 8)
            .attr("fill", AxisColor)

        //坐标轴
        printBoxHorAxis(svgLeft, leftScaleX, boxWidth, height, true, AxisColor, leftBoxSingleRange, svgTopAxisLeft)
        printBoxHorAxis(svgRight, rightScaleX, boxWidth, height, false, AxisColor, rightBoxSingleRange, svgTopAxisRight)

        //分隔的虚线
        printDivider(svgMiddle, xScaleLine, height, middleRange)

        return {
            lineMaxForCycleId,
            lineMinForCycleId,
            lineRangeForCycleId
        }
}