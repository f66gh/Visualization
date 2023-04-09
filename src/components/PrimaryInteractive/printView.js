import * as d3 from "d3";
import {singleCycleStore} from "@/store/singleCycleStore";
const selectedCycle = (rectData) => {
    const useStore = singleCycleStore()
    useStore.updateSingleCycle(rectData)
}
const updateAve = (aveCtbAll) => {
    const useStore = singleCycleStore()
    useStore.updateAveCtb(aveCtbAll)
}
export const printView = (selectedData, leftMargin, rightMargin) => {
    //颜色
    //计算平均贡献度
    const calAveCtb = (dataAll) => {
        let sumCtb = {
            one: 0,
            two: 0,
            three: 0,
            four: 0,
            five: 0
        }
        let len = dataAll.length
        dataAll.forEach((v) => {
            sumCtb.one += Number.parseFloat(v.one)
            sumCtb.two += Number.parseFloat(v.two)
            sumCtb.three += Number.parseFloat(v.three)
            sumCtb.four += Number.parseFloat(v.four)
            sumCtb.five += Number.parseFloat(v.five)
        })
        let aveCtb = {}
        for (let item in sumCtb) {
            aveCtb[item] = sumCtb[item] / len
        }
        return aveCtb
    }

    //在用户选定循环区间内贡献度平均为正的特征值标记为蓝色，做平均负贡献的特征值标记为粉色
    const colorRule = (aveCtb) => {
        if (aveCtb > 0) return "#5a99c5"
        else return "#ee9a9a"
    }

    //判断特征值放在上侧或下侧
    const sideRule = (curSOH, lastSOH, curCtb, aveCtb, upsideLst, downsideLst) => {
        curCtb = +(curCtb)
        aveCtb = +(aveCtb)
        /*
            台阶上侧固定只放正特征值，下侧只放负特征值
        */

        //如果标志为true则表示放在上侧
        if (curCtb < 0) downsideLst.push({
            curCtb,
            aveCtb
        })
        else upsideLst.push({
            curCtb,
            aveCtb
        })

        return {
            upsideLst,
            downsideLst
        }
    }

    //判断特征值在某一侧的位置
    const posRule = (curCtb, aveCtb, upsideLst, downsideLst, upperLst, lowerLst) => {
        curCtb = +(curCtb)
        aveCtb = +(aveCtb)
        /*
            若当前循环的某一个特征值和其平均特征值符号相反，则放到最外侧
        */
        let flag = true
        if (curCtb < 0) flag = !flag
        if (aveCtb < 0) flag = !flag

        //如果符号不一致说明平均做正/负贡献的特征值在本次循环中做了负/正贡献
        if (!flag) {
            //将做负贡献的值从原数组中抽离出来，单独成数组
            const upLen = upsideLst.length
            const downLen = downsideLst.length
            for (let i = 0; i < upLen; i++) {
                if (upsideLst[i].curCtb === curCtb) {
                    let num = upsideLst.splice(i, 1)
                    upperLst.push(num[0])
                    break
                }
            }
            for (let i = 0; i < downLen; i++) {
                if (downsideLst[i].curCtb === curCtb) {
                    let num = downsideLst.splice(i, 1)
                    lowerLst.push(num[0])
                    break
                }
            }
        }

        return {
            upsideLst,
            downsideLst,
            upperLst,
            lowerLst
        }
    }

    //数组内排序并包装
    const packageUp = (lstObj) => {
        /*
            up,down,upper,lower
        */

        //第一步包装，填写高度和上下侧
        const stepOne = lstObj.map((v, i) => {
            return v.sort((a, b) => a.curCtb - b.curCtb)
                .map((va, id) => {
                    return {
                        height: va.curCtb,
                        side: i === 0 || i === 2 ? 'upside' : 'downside',
                        aveCtb: va.aveCtb
                    }
                })
        })

        let startUp = 0
        let startDown = 0
        //第二步，填写位置号，从1开始算；填写起始高度，注意由于已经定好了在线上还是基准线下，所以v.height均采用绝对值
        let upLst = stepOne[0].concat(stepOne[2])
            .map((v, i) => {
                startUp += Math.abs(v.height)
                return {
                    ...v,
                    pos: i + 1,
                    start: startUp - Math.abs(v.height)
                }
            })
        let downLst = stepOne[1].concat(stepOne[3])
            .map((v, i) => {
                startDown += Math.abs(v.height)
                return {
                    ...v,
                    pos: i + 1,
                    start: startDown - Math.abs(v.height)
                }
            })

        return upLst.concat(downLst)
    }

    //颜色选择
    const color = ['#449d43', '#2741c5'];
    const main = d3.select('#mainView')
        .attr('height', '1350')
        .attr('width', '430')
    main.selectAll('svg').remove()
    //设置上层尺寸
    const width = 1200;
    const upperHeight = 67;
    //设置下层尺寸
    const height = 350;

    const errSvg = main.append('svg')
        .attr('id', 'errSvg')
        .attr('viewBox', `0 0 ${width} ${upperHeight}`)

    //建立svg对象
    const svg = main.append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)

    //数据处理
    const data = selectedData
        // const data = switchCtb(oldData)

        var x_value = [];
        var SOH = []; //SOH数组
        const xTicks = [] //设置条带坐标标签显示
        let errLst = [] //错误数组
        var Y = [];
        let maxSOH = 0
        let minSOH = 10000000

        data.forEach((v, i) => {
            const alarm_info = v.alarm_info
            if(errLst.indexOf(v.alarm_info) === -1 && alarm_info !== '0'){
                errLst.push(v.alarm_info)
            }
        })

        const newSOH = data.map(v => {
            return +v.SOH
        })

        newSOH.forEach(v => {
            if(v > maxSOH) maxSOH = v
            if(v < minSOH) minSOH = v
        })

        let dataLst = []
        //计算平均值
        const aveCtbAll = calAveCtb(data)
        updateAve(aveCtbAll)

        const dataLen = data.length
        // const dataLen = 150
        let lastSOH = data[0].SOH
        //每一次循环针对一次动力电池循环
        for (let i = 1; i < dataLen; i++) {
            let d = data[i]
            let upsideLst = []
            let downsideLst = []
            let upperLst = []
            let lowerLst = []
            //每一次循环针对一个特征值
            for (let item in d) {
                if (item === "one" || item === "two" || item === "three" || item === "four" || item === "five"){
                    const res = sideRule(d.SOH, lastSOH, d[item], aveCtbAll[item], upsideLst, downsideLst)
                    upsideLst = res.upsideLst
                    downsideLst = res.downsideLst
                }
            }
            for (let item in d) {
                if (item === "one" || item === "two" || item === "three" || item === "four" || item === "five"){
                    const res = posRule(d[item], aveCtbAll[item], upsideLst, downsideLst, upperLst, lowerLst)
                    upsideLst = res.upsideLst
                    downsideLst = res.downsideLst
                    upperLst = res.upperLst
                    lowerLst = res.lowerLst
                }
            }
            const resPak = packageUp([upsideLst, downsideLst, upperLst, lowerLst])
            lastSOH = d.SOH
            dataLst.push({
                resPak,
                SOH: d.SOH,
                one: d.one,
                two: d.two,
                three: d.three,
                four: d.four,
                five: d.five,
                SOC: d.SOC_process
            })
        }

        //新思路，可以画一次性的一个特征值，在处理后的数据中加入每一个特征值小于其序号特征值的高度和，这样就可以直接在循环中用

        const dataLstLen = dataLst.length
        dataLst.forEach((d, i) => {

            x_value.push(dataLstLen);
            SOH.push(d.SOH);

            if(i % 5 === 0) xTicks.push(i)
            let sum = 0
            for (let j = 0; j < 5; j++) {
                sum += Math.abs(parseFloat(d.resPak[j].height))
            }
            let tempLst = []
            for (let j = 0; j < 5; j++) {
                tempLst.push({
                    ...d.resPak[j],
                    height: Math.abs(parseFloat(d.resPak[j].height) * 50) / sum,
                    start: Math.abs(parseFloat(d.resPak[j].start) * 50) / sum,
                })
            }

            tempLst.push({
                SOH: parseFloat(d.SOH),
                one: +d.one,
                two: +d.two,
                three: +d.three,
                four: +d.four,
                five: +d.five,
                SOC: d.SOC,
                maxSOH: maxSOH,
                minSOH: minSOH
            })
            Y.push(tempLst);
        })

        const startWidth = 50
        const endWidth = width - 50
        const startHeight = 50
        const endHeight = height - 50
        const xChartData = d3.range(dataLen);
        const xRange = [50, width - 50]
        const highest = +d3.max(SOH)
        const yChartRange = [d3.min(SOH) - 2, highest + 2];
        const yRange = [height - 50, 50];
        const xScale = d3.scaleBand()
            .domain(xChartData)
            .rangeRound(xRange)
            .padding(0.2)

        const yScale = d3.scaleLinear()
            .domain(yChartRange)
            .range(yRange)

        const xAxisGenerator = d3.axisBottom(xScale).tickValues(xTicks);

        const grid = g => g
            .attr('stroke', '#ddd')
            .attr('stroke-opacity', .8)
            .call(g => g.append('g')
                .selectAll('line')
                .data(xTicks)
                .join("line")
                .attr("x1", d => {
                    return 0.5 + xScale(d)
                })
                .attr("x2", d => 0.5 + xScale(d))
                .attr("y1", startHeight)
                .attr("y2", endHeight))
            .call(g => g.append("g")
                .selectAll("line")
                .data(yScale.ticks(20))
                .join("line")
                .attr("y1", d => 0.5 + yScale(d))
                .attr("y2", d => 0.5 + yScale(d))
                .attr("x1", startWidth)
                .attr("x2", endWidth));

        svg.append('g').call(grid)

        svg.append('g')
            .attr('transform', `translate(0,${height-50})`)
            .call(xAxisGenerator)
            .selectAll('text')
            .text(n => {
                return data[n]["number_of_cycles"]
            })
            .attr('font-size', '6px')

        const yAxisGenerator = d3.axisLeft(yScale)
        svg.append('g')
            .attr('transform', `translate(50 0)`)
            .call(yAxisGenerator)
            .attr('font-size', '8px')

        const colW = xScale.bandwidth();
        const corlorLen = color.length;

        const g1 = svg.append('g')
            .attr('transform', 'translate(0 0)')
        const g2 = svg.append('g')
            .attr('transform', 'translate(0 0)')
        const g3 = svg.append('g')
            .attr('transform', 'translate(0 0)')
        const g4 = svg.append('g')
            .attr('transform', 'translate(0 0)')
        const g5 = svg.append('g')
            .attr('transform', 'translate(0 0)')
        const g6 = svg.append('g')
            .attr('transform', 'translate(0 0)')
        const g = svg.append('g')
            .attr('transform', 'translate(0 0)')


        //初始化视图要在单循环视图上绘制第一个循环
        selectedCycle(Y[0])
        g1.selectAll('rect')
            .data(Y)
            .join('rect')
            .attr('x', (rectData, rectInd) => xScale(rectInd))
            .attr('width', colW)
            .attr('y', rectData => {
                if (rectData[0].side === "downside") {
                    return yScale(rectData[5].SOH) + rectData[0].start + (rectData[0].pos + 2)
                } else {
                    return yScale(rectData[5].SOH) - rectData[0].start - rectData[0].height - (rectData[
                        0].pos - 1)
                }
            })
            .attr('height', (rectData) => {
                return rectData[0].height
            })
            .attr('fill', (rectData) => {
                return colorRule(rectData[0].aveCtb)
            })
            .on('click', (dom, rectData) => {

                selectedCycle(rectData)
            })
            .on('mousemove', () => {
                g1.attr('cursor', 'pointer')
            })
        g2.selectAll('rect')
            .data(Y)
            .join('rect')
            .attr('x', (rectData, rectInd) => xScale(rectInd))
            .attr('width', colW)
            .attr('y', rectData => {
                if (rectData[1].side === "downside") {
                    return yScale(rectData[5].SOH) + rectData[1].start + (rectData[1].pos + 2)
                } else {
                    return yScale(rectData[5].SOH) - rectData[1].start - rectData[1].height - (rectData[
                        1].pos - 1)
                }
            })
            .attr('height', (rectData) => {
                return rectData[1].height
            })
            .attr('fill', (rectData) => {
                return colorRule(rectData[1].aveCtb)
            })
            .on('click', (dom, rectData) => {
                selectedCycle(rectData)
            })
            .on('mousemove', () => {
                g2.attr('cursor', 'pointer')
            })
        g3.selectAll('rect')
            .data(Y)
            .join('rect')
            .attr('x', (rectData, rectInd) => xScale(rectInd))
            .attr('width', colW)
            .attr('y', rectData => {
                if (rectData[2].side === "downside") {
                    return yScale(rectData[5].SOH) + rectData[2].start + (rectData[2].pos + 2)
                } else {
                    return yScale(rectData[5].SOH) - rectData[2].start - rectData[2].height - (rectData[
                        2].pos - 1)
                }
            })
            .attr('height', (rectData) => {
                return rectData[2].height
            })
            .attr('fill', (rectData) => {
                return colorRule(rectData[2].aveCtb)
            })
            .on('click', (dom, rectData) => {
                selectedCycle(rectData)
            })
            .on('mousemove', () => {
                g3.attr('cursor', 'pointer')
            })
        g4.selectAll('rect')
            .data(Y)
            .join('rect')
            .attr('x', (rectData, rectInd) => xScale(rectInd))
            .attr('width', colW)
            .attr('y', rectData => {
                if (rectData[3].side === "downside") {
                    return yScale(rectData[5].SOH) + rectData[3].start + (rectData[3].pos + 2)
                } else {
                    return yScale(rectData[5].SOH) - rectData[3].start - rectData[3].height - (rectData[
                        3].pos - 1)
                }
            })
            .attr('height', (rectData) => {
                return rectData[3].height
            })
            .attr('fill', (rectData) => {
                return colorRule(rectData[3].aveCtb)
            })
            .on('click', (dom, rectData) => {
                selectedCycle(rectData)
            })
            .on('mousemove', () => {
                g4.attr('cursor', 'pointer')
            })
        g5.selectAll('rect')
            .data(Y)
            .join('rect')
            .attr('x', (rectData, rectInd) => xScale(rectInd))
            .attr('width', colW)
            .attr('y', rectData => {
                if (rectData[4].side === "downside") {
                    return yScale(rectData[5].SOH) + rectData[4].start + (rectData[4].pos + 2)
                } else {
                    return yScale(rectData[5].SOH) - rectData[4].start - rectData[4].height - (rectData[
                        4].pos - 1)
                }
            })
            .attr('height', (rectData) => {
                return rectData[4].height
            })
            .attr('fill', (rectData) => {
                return colorRule(rectData[4].aveCtb)
            })
            .on('click', (dom, rectData) => {
                selectedCycle(rectData)
            })
            .on('mousemove', () => {
                g5.attr('cursor', 'pointer')
            })
        const pathLine = d3.line()
            .x((rectData, rectInd) => xScale(rectInd) - 1)
            .y(rectData => yScale(rectData[5].SOH) + 1)
            .curve(d3.curveStepAfter)
        const lastY = Y[Y.length - 1]
        Y.push(lastY)
        g.append('path').attr('stroke', 'black').attr('fill', 'none')
            .attr('d', pathLine(Y)) //由于曲线绘画的特性，所以把曲线输入数组末尾再加上一个相同的数据
        //绘制错误视图，可以容纳三个错误
        const interval = upperHeight / 7
        for(let i = 1; i < 7; i++){
            errSvg.append('line')
                .attr('x1', startWidth)
                .attr('y1', i * interval)
                .attr('x2', endWidth)
                .attr('y2', i * interval)
                .attr('stroke', "#aaa")
                .attr('stoke-width', 1)
        }

        const errData = data.map(v => v.alarm_info)
        const findErr = (d) => {
            let num = 0
            errLst.forEach((v, i) => {
                if(d === v) num = i + 1
            })
            return num
        }
        const calY = (d) => {
            const num = findErr(d)
            return num * interval
        }
        const errColor = (d) => {
            const num = findErr(d)
            if(num === 0) return "none"
            const res = num % 4
            if(res === 0) return "#bf7105"
            if(res === 1) return "#ee9a9a"
            if(res === 2) return "#bcaba4"
            if(res === 3) return "#b29ed8"
        }

        errSvg.selectAll('rect.errRect')
            .data(errData)
            .enter()
            .append('rect')
            .attr('class', 'errRect')
            .attr('x', (d, i) => xScale(i))
            .attr('y', d => calY(d))
            .attr('width', (endWidth - startWidth) / dataLen + 0.4)
            .attr('height', interval)
            .attr('fill', d => errColor(d))

}