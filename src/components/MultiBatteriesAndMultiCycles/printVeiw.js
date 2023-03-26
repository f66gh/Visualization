import * as d3 from 'd3'

export const heatView = () => {

    //颜色选择
    const color = ['#449d43', '#2741c5'];
    //建立容器对象
    const main = d3.select('#heatView');
    //设置绘图框尺寸
    const width = 1200;
    const height = 600;
    //建立svg对象
    const svg = main.append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)

    const tip = main.append('div')
        .attr('id', 'tip')

    let batteryData = d3.csv("src/csv/multi.csv")
    let newRes = []
    batteryData.then(res => {
        const len = Object.keys(res[0]).length
        newRes = res.map((v, i) => {
            v['0'] = null
            v.length = len
            let newArr = Array.from(v)
            newArr.splice(0, 1)
            newArr = newArr.map((va, it) => {
                return {
                    data: va,
                    battery: it,
                    circle: i
                }
            })
            return newArr
        })

        const x = d3.scaleLinear()
            .domain([0, newRes.length]).rangeRound([0, width])

        const y = d3.scaleLinear()
            .domain([0, newRes[0].length])
            .rangeRound([0, height])

        // const colorScale = (num) => {
        //     if(num <= 100 && num > 80) return '#31658c'
        //     else if(num <= 80 && num > 60) return '#ffeb3b'
        //     else if(num <= 60 && num > 40) return '#ffc300'
        //     else if(num <= 40 && num > 20) return '#ff8d1a'
        //     else if(num <= 20 && num > 0) return '#d43030'
        //     else return 'black'
        // }

        const colorScale = d3.scaleLinear()
            .domain([100, 0])
            .range(['#4f9a95', '#d43030'])

        let data = newRes.splice(1)
        svg.selectAll('g')
            .data((d, i) => data)
            .join('g')
            .attr('transform', (d, i) => {
                return `translate(0, ${y(i)})`
            })
            .attr('fill', '#999')
            .attr('width', '200')
            .attr('height', '100')
            .selectAll('rect')
            .data(d => d)
            .join('rect')
            .attr('x', (d, i) => x(i))
            .attr('width', (d, i) => x(i + 1) - x(i) - 1)
            .attr('height', (d, i) => y(i + 1) - y(i) - 1)
            .attr("rx", '1')
            .attr('fill', (d, i) => {
                const newD = d.data
                if(newD !== null && newD.indexOf("%") !== -1) {
                    let num = +newD.split("%")[0]
                    return colorScale(num)
                }
                return colorScale(+newD)
            })
            .on("mousemove", ({clientX, clientY}, rectData) => {
                tip.style('display', 'block')
                    .style('left', `${clientX + window.scrollX}px`)
                    .style('top', `${clientY + window.scrollY}px`)
                    .html(`
                            <div>第${rectData.battery}号电池</div>
                            <div>第${rectData.circle}次循环</div>
                            <div>状态: ${rectData.data}</div>
                        `)
            })
            .on('mouseout', () => {
                tip.style('display', 'none')
            })

    })
}