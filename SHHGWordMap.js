define(["qlik", "./lib/echarts", './lib/world', "./lib/worldoption", "./lib/WMMethod"],
    function(qlik, echarts, world, worldoption) {

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
                        max: 1,
                        items: {
                            longitude: longitude,
                            latitude: latitude
                        }
                    },
                    measures: {
                        uses: "measures",
                        max: 1
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
                            backgroundColor: backgroundColor
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
                            RouteDirection: RouteDirection,
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

                var worldMap = new WorldMap(layout);

                //add your rendering code here
                var height = $element.height();
                var width = $element.width();

                $element.html("<div class='worldMap' style='height: " + height + "px;width: " + width + "px'></div>")

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
                        period: 30,
                        scale: 2.5,
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
               
                function getSeriesList(seriesDataList) {
                    for (var item in seriesDataList) {
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
                                symbolSize: 10,
                                trailLength: 0,
                            },
                            tooltip:{
                                formatter:function(params){
                                    var str = params.data.fromName + '→' + params.data.toName;
                                    return str;
                                }
                            },
                            lineStyle: {
                                normal: {
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, worldMap.getFlightColor(), false),
                                    width: 1,
                                    opacity: 0.6,
                                    curveness: 0.2
                                }
                            },
                            data: worldMap.convertData(seriesDataList[item])
                        })
                    }
                }

                // 获取series循环需要的data
                getSeriesList(seriesDataList);

                // 获取option
                var option = worldMap.getOption(series);

                echarts.init($element.find('.worldMap')[0]).setOption(option);

                return qlik.Promise.resolve();
            }
        };

    });