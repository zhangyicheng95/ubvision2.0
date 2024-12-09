import React, {
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    Badge,
    Button,
    message,
    Modal,
    Tour,
    Upload,
} from 'antd';
import styles from './index.module.less';
import * as echarts from 'echarts'


const { confirm } = Modal;

interface Props { }
const tipList = [
    '请关闭所有网络适配器的省电模式，防止相机或其他通讯异常',
]

const CaseInfo: React.FC<Props> = (props: any) => {
    useEffect(() => {
        // 基于准备好的dom，初始化echarts实例
        var myChart: any = echarts.init(document.getElementById('chart-panel'));
        // 指定图表的配置项和数据
        var option = {};

        //=============== start ===============//
        /**
         * 🚨🚨非常重要🚨🚨
         * 下面是 网站左侧代码，核心代码
         */
        var data = [
            { name: "北京", value: 199 },
            { name: "天津", value: 42 },
            { name: "河北", value: 102 },
            { name: "山西", value: 81 },
            { name: "内蒙古", value: 47 },
            { name: "辽宁", value: 67 },
            { name: "吉林", value: 82 },
            { name: "黑龙江", value: 123 },
            { name: "上海", value: 24 },
            { name: "江苏", value: 92 },
            { name: "浙江", value: 114 },
            { name: "安徽", value: 109 },
            { name: "福建", value: 116 },
            { name: "江西", value: 91 },
            { name: "山东", value: 119 },
            { name: "河南", value: 137 },
            { name: "湖北", value: 116 },
            { name: "湖南", value: 114 },
            { name: "重庆", value: 91 },
            { name: "四川", value: 125 },
            { name: "贵州", value: 62 },
            { name: "云南", value: 83 },
            { name: "西藏", value: 9 },
            { name: "陕西", value: 80 },
            { name: "甘肃", value: 56 },
            { name: "青海", value: 10 },
            { name: "宁夏", value: 18 },
            { name: "新疆", value: 180 },
            { name: "广东", value: 123 },
            { name: "广西", value: 59 },
            { name: "海南", value: 14 },
            { name: "香港", value: 11 },
            { name: "澳门", value: 35 },
            { name: "台湾", value: 22 },
        ];

        option = {
            title: {
                top: 10,
                text: '平面图地图3D效果，整体地图渐变色，并且两层同步拖拽【基于源：http://echarts.tx.cnmiaosu.com/editor.html?c=xPRYVyWjUJ】',
                left: 'center',
                textStyle: {
                    color: '#fff'
                }
            },
            backgroundColor: 'rgba(0, 10, 52, 1)',
            visualMap: {
                type: 'piecewise',
                pieces: [{
                    max: 30,
                    label: '安全',
                    color: '#45f'
                },
                {
                    min: 30,
                    max: 60,
                    label: '警告',
                    color: '#69f'
                },
                {
                    min: 60,
                    label: '危险',
                    color: '#08f'
                },
                ],
                color: '#fff',
                textStyle: {
                    color: '#fff',
                },
                visibility: 'off'
            },
            geo: {
                map: 'china',
                aspectScale: 0.75,
                layoutCenter: ["50%", "51.5%"], //地图位置
                layoutSize: '118%',
                roam: true,
                itemStyle: {
                    normal: {
                        borderColor: 'rgba(147, 235, 248, 1)',
                        borderWidth: 0.5,
                        color: {
                            type: 'linear-gradient',
                            x: 0,
                            y: 1500,
                            x2: 2500,
                            y2: 0,
                            colorStops: [{
                                offset: 0,
                                color: '#009DA1' // 0% 处的颜色
                            }, {
                                offset: 1,
                                color: '#005B9E' // 50% 处的颜色
                            }],
                            global: true // 缺省为 false
                        },
                        opacity: 0.5,
                    },
                    emphasis: {
                        areaColor: '#2a333d'
                    }
                },
                regions: [{
                    name: '南海诸岛',
                    itemStyle: {
                        areaColor: 'rgba(0, 10, 52, 1)',
                        borderColor: 'rgba(0, 10, 52, 1)'
                    },
                    emphasis: {
                        areaColor: 'rgba(0, 10, 52, 1)',
                        borderColor: 'rgba(0, 10, 52, 1)'
                    }
                }],
                z: 2
            },
            series: [{
                type: 'map',
                map: 'china',
                tooltip: {
                    show: true
                },
                label: {
                    show: true,
                    color: '#FFFFFF',
                    fontSize: 16
                },
                aspectScale: 0.75,
                layoutCenter: ["50%", "50%"], //地图位置
                layoutSize: '118%',
                roam: true,
                itemStyle: {
                    normal: {
                        borderColor: 'rgba(147, 235, 248, 0.6)',
                        borderWidth: 0.8,
                        areaColor: {
                            type: 'linear-gradient',
                            x: 0,
                            y: 1200,
                            x2: 1000,
                            y2: 0,
                            colorStops: [{
                                offset: 0,
                                color: '#009DA1' // 0% 处的颜色
                            }, {
                                offset: 1,
                                color: '#005B9E' // 50% 处的颜色
                            }],
                            global: true // 缺省为 false
                        },
                    },
                    emphasis: {
                        areaColor: 'rgba(147, 235, 248, 50)'    //鼠标滑过高亮
                    }
                },
                zlevel: 2,
                data: data,
            },
            {
                type: 'map',
                map: 'china',
                geoIndex: 0,
                aspectScale: 0.75, //长宽比
                data: data
            }]
        };

        //echarts 设置地图外边框以及多个geo实现缩放拖曳同步
        myChart.on('georoam', function (params: any) {
            var option: any = myChart.getOption(); //获得option对象
            if (params.zoom != null && params.zoom != undefined) { //捕捉到缩放时
                option.geo[0].zoom = option.series[0].zoom; //下层geo的缩放等级跟着上层的geo一起改变
                option.geo[0].center = option.series[0].center; //下层的geo的中心位置随着上层geo一起改变
            } else { //捕捉到拖曳时
                option.geo[0].center = option.series[0].center; //下层的geo的中心位置随着上层geo一起改变
            }
            myChart.setOption(option); //设置option
        });
        //=============== end ===============//

        // 使用刚指定的配置项和数据显示图表。
        if (option && typeof option === 'object') {
            myChart.setOption(option);
        }
        // window.addEventListener('resize', myChart.resize);
    }, [])

    return (
        <div className={`${styles.homePage}`}>
            <div id="chart-panel"></div>
        </div>
    );
};

export default CaseInfo;
