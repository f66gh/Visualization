import * as d3 from "d3";
export const singleCycle = (rectData, aveCtb) => {
    processSOC(rectData[5])

    // 因为在传数据的时候忘记传数据是对应的哪一个特征值，下面是数据对应特征编号的代码，写得非常弱智
    const tmp = rectData
    for(let i = 0; i < 5; i++){
        const ave = tmp[i].aveCtb
        if(ave === aveCtb.one) rectData[0] = tmp[i]
        else if(ave === aveCtb.two) rectData[1] = tmp[i]
        else if(ave === aveCtb.three) rectData[2] = tmp[i]
        else if(ave === aveCtb.four) rectData[3] = tmp[i]
        else if(ave === aveCtb.five) rectData[4] = tmp[i]
    }

    const main = d3.select('#single-cycle')
        .attr('width', "230")
        .attr('height', "230")
    const width = 230;
    const height = 230;
    main.select('svg').remove()
    const svg = main.append('svg')
        .attr('width', '230')
        .attr('height', '230')
        .attr('viewBox', `0 0 ${width} ${height}`)

    const soc_soh_color = ['#d9efed', '#4f9a95', '#93ae74', '#edf7e4'];
    const outerRadOutside = 115
    const outerRadInside = 100
    const innerRadOutside = 90
    const innerRadInside = 20
    const middleCircle = 15

    const SOHScale = d3.scaleLinear().domain([rectData[5].minSOH, rectData[5].maxSOH]).range([0, 100])
    const currSOCArr = rectData[5].SOC.split(";")
    const currSOC = +currSOCArr[currSOCArr.length - 1]
    const soc_soh = [100 - currSOC, currSOC, SOHScale(rectData[5].SOH), 100 - SOHScale(rectData[5].SOH)];

    const xScale = d3.scaleLinear();
    for (var x = 0; x < 4; x++) {
        soc_soh[x] = (soc_soh[x] / 200) * 2 * 3.1415926;
    }
    const soc = [];
    soc.push(0);
    var sum = 0;
    for (var j = 0; j < 4; j++) {
        sum += soc_soh[j];
        soc.push(sum);
    }


    //存放几次特征值的平均值
    var averageValue = [];
    var averageValueAbs = [];
    var absValue = [];
    var color1 = ['#b29ed8', '#ebbd62', '#ee9a9a', '#5a99c5', '#bcaba4', '#749f83', '#ca8622',
        '#bda29a', '#6e7074', '#546570', '#c4ccd3'
    ];
    var color2 = ['#7754ba', '#bf7105', '#df4343', '#31658c', '#90756a', '#9aec8e', '#116522'];
    // 保存原来的正负
    var value1 = [];
    //保存特征值对应的半径值
    var value2 = [];

    const ctbKeys = Object.keys(rectData[5])

    for (let key of ctbKeys) {
        if (key !== "maxSOH" && key !== "SOC" && key !== "SOH" && key !== "minSOH") {
            const d = rectData[5][key]
            value1.push(d)
            absValue.push(Math.abs(d))
        }
    }
    for (let i = 0; i < 5; i++) {
        const d = rectData[i].aveCtb
        averageValue.push(d)
        averageValueAbs.push(Math.abs(d))
    }

    var max = d3.max(absValue);
    var min = d3.min(absValue);


    //计算每一个特征值应有的半径，用线性比例尺来做
    xScale.domain(d3.extent(absValue)).range([innerRadInside, innerRadOutside]);

    for (var i = 0; i < value1.length; i++) {
        value2.push(xScale(absValue[i]));
    }

    const arr = new Array(5).fill(1)
    const arcData = d3.pie()(arr)

    const xScale3 = d3.arc().innerRadius(innerRadInside).outerRadius(outerRadInside)
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
    //y轴
    const y = d3.scaleLinear()
        .domain(d3.extent(absValue))
        .range([innerRadInside, outerRadInside])
    const yAssistance = d3.scaleLinear()
        .domain(d3.extent(absValue))
        .range([innerRadInside - 15, innerRadOutside])

    //带标签的坐标轴
    const yAxis = g => g
        .call(g => g.selectAll("g")
            .data(y.ticks(5).reverse())
            .join('g')
            .attr("fill", "none")
            .call(g => g.append("text")
                .attr("y", d => -y(d))
                .attr("dy", width / 2).attr("dx", width / 2)
                .attr("stroke", "white")
                .attr("stroke-width", 1)
                .attr("font-size", 6)
                .text((x, i) => `${x.toFixed(1)}`)
                .clone(true)
                .attr("y", d => y(d))
                .selectAll(function () {
                    return [this, this.previousSibling];
                })
                .clone(true)
                .attr("fill", "#777")
                .attr("stroke", "none")
            )
        )
    const yAxisAssistance = g => g
        .call(g => g.selectAll("g")
            .data(y.ticks(15).reverse())
            .join('g')
            .attr("fill", "none")
            .call(g => g.append("circle")
                .attr("stroke", "#ddd")
                .attr("r", yAssistance)
                .attr("cx", width / 2)
                .attr("cy", height / 2)
                .attr("stroke-width", 0.7)
            )
        )
    svg.append('g').call(yAxisAssistance)

    for (var i = 0; i < value1.length; i++) {
        const part = {
            'startAngle': arcData[i].startAngle,
            'endAngle': arcData[i].endAngle
        }
        const pathArc = d3.arc().innerRadius(innerRadInside).outerRadius(value2[i]);

        //绘制特征值的代码
        svg.append('path')
            .attr('stroke', 'white')
            .attr('fill', color1[i])
            .attr('transform', `translate(${width/2} ${height/2})`)
            .attr('d', pathArc(part));

        //处理特征值为负的情况
        if (value1[i] < 0) {
            const part2 = {
                'startAngle': (arcData[i].startAngle + arcData[i].endAngle) / 2,
                'endAngle': (arcData[i].startAngle + arcData[i].endAngle) / 2
            };
            svg.append('path')
                .attr('stroke', 'white')
                .attr('fill', '#698375')
                .attr('transform', `translate(${width/2} ${height/2})`)
                .attr('d', pathArc(part2));
        }

        // 绘制平均值的代码
        const part3 = {
            'startAngle': arcData[i].startAngle,
            'endAngle': arcData[i].endAngle
        }
        var pathArc3 = d3.arc().innerRadius(innerRadOutside + 5).outerRadius(innerRadOutside + 15);
        if (averageValueAbs[i] < max) {
            pathArc3 = d3.arc().innerRadius(xScale(averageValueAbs[i]) - 5).outerRadius(xScale(
                averageValueAbs[i]));
        }
        if (averageValueAbs[i] < min) {
            pathArc3 = d3.arc().innerRadius(innerRadInside - 5).outerRadius(innerRadInside);
        }
        svg.append('path')
            .attr('fill', color2[i])
            .attr('transform', `translate(${width/2} ${height/2})`)
            .attr('d', pathArc3(part3));
        // if (averageValueAbs[i] > max) {
        //     var pathArc4 = d3.arc().innerRadius(innerRadOutside + 5).outerRadius(innerRadOutside + 15);
        //     svg.append('path')
        //         .attr('fill', color2[i])
        //         .attr('transform', `translate(${width/2} ${height/2})`)
        //         .attr('d', pathArc4(part5));
        //     svg.append('path')
        //         .attr('fill', color2[i])
        //         .attr('transform', `translate(${width/2} ${height/2})`)
        //         .attr('d', pathArc4(part6));
        // }


        //绘制平均值为负的情况
        if (averageValue[i] < 0) {

            const part4 = {
                'startAngle': (arcData[i].startAngle + arcData[i].endAngle) / 2,
                'endAngle': (arcData[i].startAngle + arcData[i].endAngle) / 2
            };
            svg.append('path')
                .attr('stroke', 'white')
                .attr('fill', '#698375')
                .attr('transform', `translate(${width/2} ${height/2})`)
                .attr('d', pathArc3(part4));
        }
    }
    for (var i = 0; i < 4; i++) {
        const part1 = {
            'startAngle': soc[i],
            'endAngle': soc[i + 1]
        };
        const pathArc1 = d3.arc().innerRadius(outerRadInside).outerRadius(outerRadOutside);
        svg.append('path')
            .attr('stroke', 'white')
            .attr('fill', soc_soh_color[i])
            .attr('transform', `translate(${width/2} ${height/2})`)
            .attr('d', pathArc1(part1));
    }
    //y轴标签
    svg.append('g').call(yAxis)
    svg.append('circle')
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', middleCircle)
        .attr('fill', '#eee')
}

const processSOC = (data) => {
    const width = 190
    const height = 190
    const margin = 20
    const main = d3.select('#re-charging')
        .attr('width', width)
        .attr('height', height)

    main.select('svg').remove()
    const svg = main.append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)

    const SOC_arr_str = data.SOC.split(';').slice(0, -1)
    const SOC_arr = SOC_arr_str.map(v => {
        const strArr = v.split(",")
        const numArr = []
        numArr.push(+strArr[0])
        numArr.push(+strArr[1])
        return numArr
    })

    const SOC_all_arr = []
    SOC_arr_str.forEach(v => {
        const strArr = v.split(',')
        SOC_all_arr.push(+strArr[0])
        SOC_all_arr.push(+strArr[1])
    })

    const xScaleArr = []
    for (let i = 1; i <= SOC_arr.length; i++) {
        xScaleArr.push(i)
    }


    const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin, margin])

    const xScale = d3.scaleBand()
        .domain(xScaleArr)
        .range([margin, width - margin])
        .padding(0.2)

    const xAxis = g => g
        .attr('transform', `translate(0, ${height - margin})`)
        .call(d3.axisBottom(xScale))
        .call(g => g.append('text'))
        .attr('font-size', '6')

    const yAxis = g => g
        .attr('transform', `translate(${margin}, 0)`)
        .call(d3.axisLeft(yScale).ticks(4))
        .call(g => g.append('text'))
        .attr('font-size', '6')

    const grid = g => g
        .attr('stroke', '#ddd')
        .attr('stroke-opacity', .8)
        .call(g => g.append('g')
            .selectAll('line')
            .data(xScaleArr)
            .join("line")
            .attr("x1", d => 10 + xScale(d))
            .attr("x2", d => 10 + xScale(d))
            .attr("y1", margin)
            .attr("y2", height - margin))
        .call(g => g.append("g")
            .selectAll("line")
            .data(yScale.ticks(5))
            .join("line")
            .attr("y1", d => 0.5 + yScale(d))
            .attr("y2", d => 0.5 + yScale(d))
            .attr("x1", margin)
            .attr("x2", width - margin));

    svg.append('g').call(xAxis)
    svg.append('g').call(yAxis)
    svg.append('g').call(grid)

    svg.selectAll('rect')
        .data(SOC_arr)
        .join('rect')
        .attr('height', d => Math.abs(yScale(d[0]) - yScale(d[1])))
        .attr('width', xScale.bandwidth())
        .attr('x', (d, i) => xScale(i + 1))
        .attr('y', d => d[0] > d[1] ? yScale(d[0]) : yScale(d[1]))
        .attr('fill', d => d[0] > d[1] ? '#5a99c5' : '#4f9a95')
}