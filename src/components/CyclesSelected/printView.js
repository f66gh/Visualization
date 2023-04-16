import * as d3 from "d3";
import {selectedCyclesStore} from "@/store/selectedCyclesStore";

export const printView = (leftMargin, rightMargin) => {
    //颜色
    const color = {
        gray1: "#A6A6A6",
        gray2: "#E5E5E5",
        white1: "#f6f6f6",
        pink1: "#DC667E",
        pink2: "#EE9A9A",
        brown1: "#BF7105",
        green1: "#71ae49",
        green2: "#93AE74",
        yellow1: "#EBBD62",
        blue1: "#3A4A60"
    }

    let boundary = 90;

    const width = 380;
    const height = 380;
    const main = d3.select('#main').attr('width', 380).attr('height', 380);
    const svg = main.append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
    const xScale1 = d3.scaleLinear();
    const xScale2 = d3.scaleLinear();

    //圈数比例尺
    let angleScale = null;

    /*
     * data设置 每一行数据放在一个类里边
     * [{prop1: value1, prop2: value2}, {prop1: value3, prop2: value4}]
     *
     * */
    let origin = d3.csv("src/csv/output7.csv")
    origin.then(data => {

        let soh_data = [];
        let soc_data = [];
        let soh_error_data = [];
        let warning_data = [];
        let errType = []
        data.forEach(d => {
            if(errType.indexOf(d.alarm_info) === -1 && d.alarm_info !== "0") {
                errType.push(d.alarm_info)
            }
        })

        data.forEach(d => {
            d.SOH = +(d.SOH);
            const SOCLst = d.SOC_process.split(";")
            d.SOC = +SOCLst[SOCLst.length - 1];
            if(d.alarm_info !== "0"){
                if(d.alarm_info === errType[0]){
                    warning_data.push(d.alarm_info)
                    soh_error_data.push("0")
                }
                else {
                    soh_error_data.push(d.alarm_info)
                    warning_data.push("0")
                }
            }else{
                soh_error_data.push('0');
                warning_data.push('0');
            }
            soh_data.push(d.SOH);
            soc_data.push(d.SOC);
        })
        const pie = d3.pie().value(1);
        const arcData = pie(data)
        const circlePart = {
            'startAngle': 0,
            'endAngle': 6.28
        };

        //规定视图交互范围
        const rangeCircle = d3.arc().innerRadius(90).outerRadius(160)
        const rangeSvg = svg.append('path')
            .attr('transform', `translate(${width / 2}, ${height / 2})`)
            .attr('d', rangeCircle(circlePart))
            .attr('fill', 'transparent')

        //绘制三个大圈
        for (let i = 1; i < 4; i++) {
            const circlePartArc = d3.arc().innerRadius(145 + i * 5).outerRadius(145 + i * 5);
            svg.append('path')
                .attr('stroke', color.gray1)
                .attr('transform', `translate(${width/2} ${height/2})`)
                .attr('d', circlePartArc(circlePart));
        }
        //绘制y轴
        const innerRadius = 90
        const outerRadius = 150
        const y = d3.scaleLinear()
            .domain([d3.min(data, d => d.SOH), d3.max(data, d => d.SOH)])
            .range([innerRadius, outerRadius])
        const yAssistance = d3.scaleLinear()
            .domain([d3.min(data, d => d.SOH), d3.max(data, d => d.SOH)])
            .range([innerRadius - 15, outerRadius])
        //带标签的坐标轴
        const yAxis = g => g
            .call(g => g.selectAll("g")
                .data(y.ticks(5).reverse())
                .join('g')
                .attr("fill", "none")
                .call(g => g.append("text")
                    .attr("y", d => -y(d))
                    .attr("dy", 193).attr("dx", 187)
                    .attr("stroke", color.white1)
                    .attr("stroke-width", 1)
                    .attr("font-size", 6)
                    .text((x, i) => `${x.toFixed(0)}`)
                    .clone(true)
                    .attr("y", d => y(d))
                    .selectAll(function () {
                        return [this, this.previousSibling];
                    })
                    .clone(true)
                    .attr("fill", color.gray1)
                    .attr("stroke", "none")
                )
            )
        const yAxisAssistance = g => g
            .call(g => g.selectAll("g")
                .data(y.ticks(15).reverse())
                .join('g')
                .attr("fill", "none")
                .call(g => g.append("circle")
                    .attr("stroke", color.white1)
                    .attr("r", yAssistance)
                    .attr("cx", 190)
                    .attr("cy", 190)
                    .attr("stroke-width", 0.7)
                )
            )
        svg.append("g").call(yAxisAssistance)
        svg.append("g").call(yAxis)



        const xScale3 = d3.arc().innerRadius(60).outerRadius(150)
        // 绘制x轴
        for (let i = 0; i < 16; i++) {
            svg.append('path')
                .attr('fill', 'none')
                .attr('stroke', '#ccc')
                .attr('transform', `translate(${width / 2}, ${height / 2})`)
                .attr('stroke-width', .2)
                .attr('d', xScale3({
                    'startAngle': i * 3.14 / 8,
                    'endAngle': i * 3.14 / 8 + 0.005
                }))
        }

        //处理异常情况
        for (let i = 0; i < soh_data.length; i++) {
            const partError = {
                'startAngle': arcData[i].startAngle,
                'endAngle': arcData[i].endAngle
            }
            let pathArcError;
            //如果soh出现异常，则显示在最外圈，其余异常显示在内圈
            if (soh_error_data[i] != "0") {
                pathArcError = d3.arc().innerRadius(150).outerRadius(155)
                if (soh_error_data[i] === errType[1]) {
                    svg.append('path')
                        .attr('fill', color.pink1)
                        .attr('transform', `translate(${width/2} ${height/2})`)
                        .attr('d', pathArcError(partError));
                }
                else {
                    svg.append('path')
                        .attr('fill', color.pink2)
                        .attr('transform', `translate(${width/2} ${height/2})`)
                        .attr('d', pathArcError(partError));
                }
            }
            //其他异常
            if (warning_data[i] !== "0") {
                pathArcError = d3.arc().innerRadius(155).outerRadius(160)
                svg.append('path')
                    .attr('fill', color.brown1)
                    .attr('transform', `translate(${width/2} ${height/2})`)
                    .attr('d', pathArcError(partError));
            }
        }

        //SOH阈值圈
        const radiusScaleSOH = d3.scaleLinear()
            .domain([d3.min(data, d => d.SOH) - 2, d3.max(data, d => d.SOH) + 2])
            .range([boundary, 150])
        const boundaryPartArc = d3.arc().innerRadius(60).outerRadius(radiusScaleSOH(130));
        svg.append('path')
            .attr('fill', '#5a99c5')
            .attr("fill-opacity", 0.2)
            .attr('transform', `translate(${width/2} ${height/2})`)
            .attr('d', boundaryPartArc(circlePart));

        //SOC范围圈
        const boundaryPartArcSOC = d3.arc().innerRadius(60).outerRadius(90);
        svg.append('path')
            .attr('fill', color.pink2)
            .attr("fill-opacity", .7)
            .attr('transform', `translate(${width/2} ${height/2})`)
            .attr('d', boundaryPartArcSOC(circlePart));

        //绘制SOH
        angleScale = d3.scaleLinear().domain([0, soc_data.length - 1]).range([0, 6.28])
        const curveSOH = d3.lineRadial()
            .angle((d, i) => angleScale(i))
            .radius((d, i) => radiusScaleSOH(d))

        svg.append('path')
            .datum(soh_data)
            .attr('d', d => curveSOH(d))
            .attr('stroke', color.green1)
            .attr('stroke-width', 2)
            .attr('fill', 'none')
            .attr('transform', `translate(${width/2} ${height/2})`)

        //绘制SOC
        const radiusScale = d3.scaleLinear().domain([110, 0]).range([60, boundary])
        const curveSOC = d3.lineRadial()
            .angle((d, i) => angleScale(i))
            .radius((d, i) => radiusScale(d))

        svg.append('path')
            .datum(soc_data)
            .attr('d', d => curveSOC(d))
            .attr('stroke', '#bf7105')
            .attr('stroke-width', 1.5)
            .attr('fill', 'none')
            .attr('transform', `translate(${width/2} ${height/2})`)

        //绘制开始曲线，结束曲线，预测曲线
        let s = [0, 1.28, 5.33];
        for (let i = 0; i < 1; i++) {
            const part1 = {
                'startAngle': s[i],
                'endAngle': s[i]
            };
            const part1Arc = d3.arc().innerRadius(60).outerRadius(160);
            svg.append('path')
                .attr('stroke', color.blue1)
                .attr('stroke-opacity', .8)
                .attr('transform', `translate(${width/2} ${height/2})`)
                .attr('d', part1Arc(part1));
        }

        arcsBrush(rangeSvg, svg)
    })

    var calAngle = (clientX, clientY) => {
        const rx = clientX - width / 2
        const ry = clientY - height / 2
        const sinA = rx / Math.sqrt(rx * rx + ry * ry)
        let A = Math.asin(sinA)
        if (clientX > width / 2 && clientY > height / 2) A = 3.14 - A
        if (clientX <= width / 2 && clientY > height / 2) A = 3.14 - A
        if (clientX <= width / 2 && clientY <= height / 2) A = 6.28 + A
        return A
    }

    //自己写一个环交互刷,参数分别为：点击区域，画板
    //1.在环形区域内点击，会蹦出一个环形，多次点击只能出现一个环形
    var arcsBrush = function (clickArea, svg) {
        const partArc = d3.arc().innerRadius(60).outerRadius(150)
        const partArcBar = d3.arc().innerRadius(60).outerRadius(160)
        const partArcDiv = d3.arc().innerRadius(160).outerRadius(175)
        clickArea.on("mousemove", () => {
            clickArea.attr('cursor', 'pointer')
        })
        let interactive = null;
        let leftBar = null;
        let rightBar = null;
        let leftDiv = null;
        let rightDiv = null;
        let leftAngle = 1;
        let rightAngle = 1;
        //计算弧度
        let A = 0
        let startA = 0
        let calA = 0
        clickArea.on("click", ({
                                   clientX,
                                   clientY
                               }, rectData) => {
            svg.selectAll('.interactive').remove() //删除上一个区域
            interactive = null
            leftBar = null
            rightBar = null
            A = calAngle(clientX, clientY)
            //防止越界
            if (A > 5.28) rightAngle = 6.28 - A
            else if (A < 1) leftAngle = A
            else {
                leftAngle = 1
                rightAngle = 1
            }
            interactive = svg.append('path')
                .attr('fill', '#446')
                .attr('fill-opacity', .2)
                .attr('transform', `translate(${width / 2}, ${height / 2})`)
                .attr('d', calRange(partArc, A, leftAngle, rightAngle))
                .attr('class', 'interactive')
            leftBar = svg.append('path')
                .attr('class', 'interactive')
                .attr('fill', '#31658c')
                .attr('transform', `translate(${width / 2}, ${height / 2})`)
                .attr('d', calRangeBar(partArcBar, A, leftAngle, rightAngle, 'left'))
            leftDiv = svg.append('path')
                .attr('class', 'interactive')
                .attr('fill', '#31658c')
                .attr('transform', `translate(${width / 2}, ${height / 2})`)
                .attr('d', calRangeDiv(partArcDiv, A, leftAngle, rightAngle, 'left'))
            rightDiv = svg.append('path')
                .attr('class', 'interactive')
                .attr('fill', '#31658c')
                .attr('transform', `translate(${width / 2}, ${height / 2})`)
                .attr('d', calRangeDiv(partArcDiv, A, leftAngle, rightAngle, 'right'))
            rightBar = svg.append('path')
                .attr('class', 'interactive')
                .attr('fill', '#31658c')
                .attr('transform', `translate(${width / 2}, ${height / 2})`)
                .attr('d', calRangeBar(partArcBar, A, leftAngle, rightAngle, 'right'))
            dragArea(interactive, A, startA, leftBar, rightBar, partArc, leftAngle, rightAngle,
                partArcBar, leftDiv, rightDiv, partArcDiv)
            printRange(A - leftAngle, A + rightAngle)
        })
    }

    //2.扇形图可以拖动，边缘可以拖动
    var dragArea = (interactive, A, startA, leftBar, rightBar, partArc, leftAngle, rightAngle, partArcBar, leftDiv,
                    rightDiv, partArcDiv) => {
        let calA = 0
        let newLeftAngle = leftAngle
        let newRightAngle = rightAngle
        interactive.on("mousemove", () => {
            interactive.attr('cursor', 'pointer')
        })
        interactive.on('mousedown', ({
                                         clientX,
                                         clientY
                                     }) => {
            startA = calAngle(clientX, clientY)
            interactive.on('mousemove', ({
                                             clientX,
                                             clientY
                                         }) => {
                //计算弧度，注意需要在步骤一算得的角度上加减角度，而不是直接把鼠标位置所得角度直接作为位置参数
                const nowA = calAngle(clientX, clientY)
                calA = A + nowA - startA
                //注意越界
                if (calA - leftAngle < 0 || calA + rightAngle > 6.28) return
                interactive.attr('d', calRange(partArc, calA, leftAngle, rightAngle))
                leftBar.attr('d', calRangeBar(partArcBar, calA, leftAngle, rightAngle, 'left'))
                rightBar.attr('d', calRangeBar(partArcBar, calA, leftAngle, rightAngle,
                    'right'))
                leftDiv.attr('d', calRangeDiv(partArcDiv, calA, leftAngle, rightAngle, 'left'))
                rightDiv.attr('d', calRangeDiv(partArcDiv, calA, leftAngle, rightAngle,
                    'right'))
            })
        })
        interactive.on('mouseup', ({
                                       clientX,
                                       clientY
                                   }) => {
            //当不按左键时，需要将当前角度覆盖至上一次移动的角度
            A = A + calAngle(clientX, clientY) - startA
            interactive.on('mousemove', null)
            printRange(A - leftAngle, A + rightAngle)
        })

        leftDiv.on("mousemove", () => {
            leftDiv.attr('cursor', 'pointer')
        })
        leftDiv.on('mousedown', ({
                                     clientX,
                                     clientY
                                 }) => {
            const startDivA = calAngle(clientX, clientY)
            leftDiv.on('mousemove', ({
                                         clientX,
                                         clientY
                                     }) => {
                const nowDivA = calAngle(clientX, clientY)
                newLeftAngle = leftAngle - nowDivA + startDivA //这块计算需要画图，容易把cpu干烧了
                //注意越界
                if (A - newLeftAngle < 0 || newRightAngle + newLeftAngle < 0.5) return
                leftDiv.attr('d', calRangeDiv(partArcDiv, A, newLeftAngle, newRightAngle,
                    'left'))
                leftBar.attr('d', calRangeBar(partArcBar, A, newLeftAngle, newRightAngle,
                    'left'))
                interactive.attr('d', calRange(partArc, A, newLeftAngle, newRightAngle))
            })
        })
        leftDiv.on('mouseup', ({
                                   clientX,
                                   clientY
                               }) => {
            //当不按左键时，需要将当前角度覆盖至上一次移动的角度
            leftAngle = newLeftAngle
            leftDiv.on('mousemove', null)
            printRange(A - leftAngle, A + rightAngle)
        })
        leftDiv.on('mouseout', ({
                                    clientX,
                                    clientY
                                }) => {
            //当鼠标移出时，需要将当前角度覆盖至上一次移动的角度
            leftAngle = newLeftAngle
            leftDiv.on('mousemove', null)
            printRange(A - leftAngle, A + rightAngle)
        })

        rightDiv.on("mousemove", () => {
            rightDiv.attr('cursor', 'pointer')
        })
        rightDiv.on('mousedown', ({
                                      clientX,
                                      clientY
                                  }) => {
            const startDivA = calAngle(clientX, clientY)
            rightDiv.on('mousemove', ({
                                          clientX,
                                          clientY
                                      }) => {
                const nowDivA = calAngle(clientX, clientY)
                newRightAngle = rightAngle + nowDivA - startDivA //这块计算需要画图，容易把cpu干烧了
                //注意越界
                if (A + newRightAngle < 0 || newRightAngle + newLeftAngle < 0.5) return
                rightDiv.attr('d', calRangeDiv(partArcDiv, A, newLeftAngle, newRightAngle,
                    'right'))
                rightBar.attr('d', calRangeBar(partArcBar, A, newLeftAngle, newRightAngle,
                    'right'))
                interactive.attr('d', calRange(partArc, A, newLeftAngle, newRightAngle))
            })
        })
        rightDiv.on('mouseup', ({
                                    clientX,
                                    clientY
                                }) => {
            //当不按左键时，需要将当前角度覆盖至上一次移动的角度
            rightAngle = newRightAngle
            rightDiv.on('mousemove', null)
            printRange(A - leftAngle, A + rightAngle)
        })
        rightDiv.on('mouseout', ({
                                     clientX,
                                     clientY
                                 }) => {
            //当鼠标移出时，需要将当前角度覆盖至上一次移动的角度
            rightAngle = newRightAngle
            rightDiv.on('mousemove', null)
            printRange(A - leftAngle, A + rightAngle)
        })
    }

    //3. 根据选中区域和比例尺输出主视图展示的循环范围
    var printRange = function (left, right) {
        const rangeLeft = parseInt(angleScale.invert(left))
        const rangeRight = parseInt(angleScale.invert(right))
        const selectedData = []
        d3.csv('src/csv/output7.csv').then((data) => {
            for(let i = rangeLeft; i <= rangeRight; i++){
                selectedData.push(data[i])
            }
            const store = selectedCyclesStore()
            store.updateSelectedCycles(selectedData)
        })
    }

    var calRange = function (partArc, calA, leftAngle, rightAngle) {
        return partArc({
            'startAngle': calA - leftAngle,
            'endAngle': calA + rightAngle
        })
    }

    var calRangeBar = function (partArcBar, calA, leftAngle, rightAngle, dir) {
        if (dir === 'left') return partArcBar({
            'startAngle': calA - leftAngle,
            'endAngle': calA - leftAngle + 0.02
        })
        else return partArcBar({
            'startAngle': calA + rightAngle,
            'endAngle': calA + rightAngle - 0.02
        })
    }

    var calRangeDiv = function (partArcDiv, calA, leftAngle, rightAngle, dir) {
        if (dir === 'left') return partArcDiv({
            'startAngle': calA - leftAngle - 0.05,
            'endAngle': calA - leftAngle + 0.07
        })
        else return partArcDiv({
            'startAngle': calA + rightAngle + 0.05,
            'endAngle': calA + rightAngle - 0.07
        })
    }

    //禁止选中文字
    document.addEventListener('selectstart',function(e){
        e.preventDefault();
    })
}