define(["qlik", "./lib/echarts", './lib/world', "./lib/china", "./lib/worldOption", "./lib/worldMap"],
    function(qlik, echarts, world, china, worldOption) {

        function isNotNull(str) {
            if (str === null || str === '' || str === '\\N' || str === undefined || str === 0) {
                return false;
            }
            return true;
        }

        return {
            initialProperties: {
                qHyperCubeDef: {
                    qDimensions: [],
                    qMeasures: [],
                    qInitialDataFetch: [{
                        qWidth: 20,
                        qHeight: 270
                    }]
                }
            },
            definition: {
                type: 'items',
                component: 'accordion',
                items: {
                    dimensions: {
                        uses: 'dimensions',
                        min: 2,
                        max: 2,
                        items: {
                            longitude: longitude,
                            latitude: latitude
                        }
                    },
                    measures: {
                        uses: "measures",
                        max: 8,
                        items: {
                            direction: direction
                        }
                    },
                    sorting: {
                        uses: "sorting"
                    },
                    settings: {
                        uses: "settings"
                    },
                    layout1: {
                        type: "items",
                        label: "地图",
                        items: {
                            backgroundColor: backgroundColor,
                            mapType: mapType
                        }
                    },
                    layout2: {
                        type: "items",
                        label: "图例",
                        items: {
                            Legend: Legend,
                            legendStyle: legendStyle,
                            lengendPositionY: lengendPositionY,
                            lengendPositionX: lengendPositionX,
                            legendWidth: legendWidth
                        }
                    },
                    layout3: {
                        type: "items",
                        label: "航线",
                        items: {
                            // RouteDirection: RouteDirection,
                            FlightIcon: FlightIcon,
                            flightIconSpeed: flightIconSpeed,
                            FlightColor: flightIconColor
                        }
                    },
                    layout4: {
                        type: "items",
                        label: "阈值",
                        items: {
                            visualMapStatus: visualMapStatus,
                            visualMapColor: visualMapColor
                        }
                    }
                }
            },
            support: {
                snapshot: true,
                export: true,
                exportData: false
            },
            paint: function($element, layout) {

                console.log(layout);

                // console.log(layout.qHyperCube.qMeasureInfo[i].direction)

                var worldMap = new WorldMap(layout);

                //add your rendering code here

                var geoCoordMap = worldMap.getGeoCoordMap();
                var seriesDataList = worldMap.getSeriesData();

                var series = [];

                // 添加绘制各个地区圆点的series
                series = [{
                    name: worldMap.title,
                    type: 'effectScatter',
                    effectType: 'ripple',
                    showEffectOn: 'render',
                    coordinateSystem: 'geo',
                    rippleEffect: {
                        period: 6,
                        scale: 2,
                        brushType: 'stroke'
                    },
                    symbol: 'circle',
                    symbolSize: 10,
                    label: {
                        emphasis: {
                            show: false,
                            position: 'top'
                        }
                    },
                    data: worldMap.getCitys(),
                    tooltip: {
                        formatter: function(params) {
                            var name = params.name,
                                value = params.value[params.value.length - 1],
                                seriesName = params.seriesName;
                            var str = seriesName + '<br>' + name + ':' + value;
                            return str;
                        }
                    }
                }];

                // 获取每次被选中的series数组,然后获取当前series里边所在城市的经纬度值来画圆点,默认是0

                function getSeriesList(seriesDataList) {
                    var direction = '';
                    for (var item in seriesDataList) {
                       
                        for(var key = 0; key< layout.qHyperCube.qMeasureInfo.length; key ++) {
                            if(layout.qHyperCube.qMeasureInfo[key].qFallbackTitle == item) {
                                direction = layout.qHyperCube.qMeasureInfo[key].direction
                            }
                        }
                        series.push({
                            name: item,
                            type: 'lines',
                            coordinateSystem: 'geo',
                            zlevel: 2,
                            large: true,
                            effect: {
                                show: true,
                                constantSpeed: worldMap.flightIconSpeed,
                                shadowBlur: 0,
                                symbol: worldMap.FlightIcon,
                                symbolSize: 15,
                                trailLength: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)',
                                    shadowBlur: 10
                            },
                            tooltip: {
                                formatter: function(params) {
                                    var str = params.data.fromName + '→' + params.data.toName;
                                    return str;
                                }
                            },
                            lineStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 0.5, worldMap.getFlightColor(), false),
                                    width: 2,
                                    opacity: 0.4,
                                    curveness: 0.2,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                                    shadowBlur: 10
                                }
                            },
                            data: worldMap.convertData(seriesDataList[item], direction)
                        })
                    }
                }

                // 获取series循环需要的data
                getSeriesList(seriesDataList);

                var height = $element.height();
                var width = $element.width();

                // 插入元素
                $element.html("<div class='worldMap' style='height: " + height + "px;width: " + width + "px'></div>")

                // 获取option
                var option = worldMap.getOption(series);

                var myChart = echarts.init($element.find('.worldMap')[0])
                myChart.setOption(option);
                var dimName = layout.qHyperCube.qDimensionInfo[0].qFallbackTitle;
                var app = qlik.currApp();

                myChart.on('click', function(params) {
                    if (isNotNull(params.name)) {
                        var value = params.name;
                        app.field(dimName).selectValues([{ qText: value }], true, true);
                    }
                });

                // myChart.on('legendselectchanged', function(params) {
                //     console.log(params);
                //     for (var key in params.selected) {
                //         if (params.selected[key] == true) {
                //             console.log(key)
                //             selected = key;
                //         }
                //     }
                // });

                return qlik.Promise.resolve();
            }
        };

    });