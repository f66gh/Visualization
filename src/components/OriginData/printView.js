import * as d3 from 'd3'

export const lineView = () => {
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

    const tip = main.append('div')
        .attr('id', 'tip')

    d3.csv('src/csv/lineData.csv').then(res => {
        let currTempArr = res.map(v => {
            return +v.currTemp
        })
        let currVoltArr = res.map(v => {
            return +v.currVolt
        })

        const yScaleLeft = d3.scaleLinear()
            .domain([d3.min(currTempArr) - 1, d3.max(currTempArr) + 1])
            .range([height - margin, margin])
        const yScaleRight = d3.scaleLinear()
            .domain([d3.min(currVoltArr) - 1, d3.max(currVoltArr) + 1])
            .range([height - margin, margin])
        const xScale = d3.scaleLinear()
            .domain([1, res.length])
            .range([margin, width - margin])

        const lineTemp = d3.line()
            .x(d => xScale(+d.cycle))
            .y(d => yScaleLeft(+d.currTemp))
            .curve(d3.curveCardinal)

        const lineVolt = d3.line()
            .x(d => xScale(+d.cycle))
            .y(d => yScaleRight(+d.currVolt))
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
            .datum(res)
            .attr('d', d => lineTemp(d))
            .attr('stroke', '#4f9a95')
            .attr('stroke-width', 2)
            .attr('fill', 'none')

        svg.append("path")
            .datum(res)
            .attr('d', d => lineVolt(d))
            .attr('stroke', '#bf7105')
            .attr('stroke-width', 2)
            .attr('fill', 'none')

        svg.append("g")
            .selectAll("circle")
            .data(res)
            .enter()
            .append('circle')
            .attr('fill', 'white')
            .attr('stroke', '#4f9a95')
            .attr('cx', d => xScale(d.cycle))
            .attr('cy', d => yScaleLeft(d.currTemp))
            .attr('r', d => 2)
            .on("mousemove", ({
                                  clientX,
                                  clientY
                              }, data) => {
                tip.style('display', 'block')
                    .style('left', `${clientX + window.scrollX}px`)
                    .style('top', `${clientY + window.scrollY}px`)
                    .html(`
                            <div>${data.currTemp}℃</div>
                            <div>第${data.cycle}次循环</div>
                        `)
            })
            .on('mouseout', () => {
                tip.style('display', 'none')
            })

        svg.append("g")
            .selectAll("circle")
            .data(res)
            .enter()
            .append('circle')
            .attr('fill', 'white')
            .attr('stroke', '#bf7105')
            .attr('cx', d => xScale(d.cycle))
            .attr('cy', d => yScaleRight(d.currVolt))
            .attr('r', d => 2)
            .on("mousemove", ({
                                  clientX,
                                  clientY
                              }, data) => {
                tip.style('display', 'block')
                    .style('left', `${clientX + window.scrollX}px`)
                    .style('top', `${clientY + window.scrollY}px`)
                    .html(`
                            <div>${data.currVolt}V</div>
                            <div>第${data.cycle}次循环</div>
                        `)
            })
            .on('mouseout', () => {
                tip.style('display', 'none')
            })
    })
}