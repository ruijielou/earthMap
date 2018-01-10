define(["qlik", "./lib/echarts", './lib/world', "./lib/worldoption"],
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

                console.log(layout);

                var _layout = layout

                var title = _layout.qHyperCube.qDimensionInfo[0].qFallbackTitle;//获取维度字段名称

                var legendLabelSwitch = _layout.legendLabelSwitch; //图例开关变量
                var bgColor = _layout.backgroundColor; //地图背景色
                var FlightIcon = _layout.FlightIcon; //航线图标
                var flightIconColor = _layout.flightIconColor;//航线颜色
                var lengendPositionY = _layout.lengendPositionY;//图例Y轴位置
                var lengendPositionX = _layout.lengendPositionX;//图例X轴位置
                var legendWidth = _layout.legendWidth;//图例横向的宽度
                var flightIconSpeed = _layout.flightIconSpeed;//飞行物的运行速度
                var legendStyle = _layout.legendType;//图例的排列方式，是平铺还是scroll
                var visualMapStatus = _layout.visualMapStatus;//阈值条状是否绘制
                var RouteDirection = _layout.RouteDirection;//飞行方向
                var visualMapColor = _layout.visualMapColor
                 // 数据处理
                 var qHyperCube = _layout.qHyperCube
                 var dataList = qHyperCube.qDataPages[0].qMatrix; //获取数据拼接data
 
                 var geoCoordMap = {}; //地点经纬度配置项
                // 获取数据最大最小值
                var min = qHyperCube.qMeasureInfo[0].qMin,
                    max = qHyperCube.qMeasureInfo[0].qMax;

                function getFlightColor(flightIconColor) {
                    if (flightIconColor) {

                        var flightColor = [];
                        var obj = {};
                        // 如果输入的是中文的逗号则转换成英文逗号
                        flightIconColor = flightIconColor.replace(/，/ig,',');
    
                        var flightColorList = flightIconColor.split(',');
                        for (var i = 0; i < flightColorList.length; i++) {
                            var offset = 1 / flightColorList.length * i
                            if (i == 0) {
                                offset = 0;
                            } else if (i == (flightColorList.length - 1)) {
                                offset = 1;
                            }
                            obj = {
                                offset: offset,
                                color: flightColorList[i]
                            }
                            flightColor.push(obj);
                        }
                        return flightColor
                    }
                }
               
                function getVisualMapColor(visualMapColor) {
                    if(visualMapColor) {
                        var visualColor = [];
                        // 如果输入的是中文的逗号则转换成英文逗号
                        visualMapColor = visualMapColor.replace(/，/ig,',');
    
                        var visualColorList = visualMapColor.split(',');
                        // if(visualColorList.length == 0) return
                        for (var i = 0; i < visualColorList.length; i++) {
                            visualColor.push(visualColorList[i]);
                        }
                        return visualColor
                    }
                }

                for (var i in dataList) {
                    var geoArr = []; //经纬度坐标数组
                    geoArr.push(dataList[i][0].qAttrExps.qValues[0].qNum, dataList[i][0].qAttrExps.qValues[1].qNum, dataList[i][1].qText); //插入经度跟纬度
                    geoCoordMap[dataList[i][0].qText] = geoArr;
                }


                //add your rendering code here
                var height = $element.height();
                var width = $element.width();

                // $element.html("<div class='contentcanvas' style='position:relative'><button style='position: absolute;right: 10px;top:10px;z-index: 9999;' class='qui-popover-button qui-dropdown ng-binding ng-scope ng-isolate-scope lui-button--toolbar lui-button' title='切换中心城市'>切换中心城市</button><div class='worldMap' style='height: " + height + "px;width: " + width + "px'></div></div>");
                $element.html("<div class='worldMap' style='height: " + height + "px;width: " + width + "px'></div>")

                var seriesDataList = [];
                var seriesData = [];
                var obj1 = {}
                var obj2 = {}
                var SHData = []

                var legendData = [];
                var legendSelected = {};

                function outSeriesList(RouteDirection) {

                    for (var key in geoCoordMap) {
                        // 拼接图例
                        legendData.push({ name: key, icon: 'circle' });
                        // 默认选中上海
                        if (key == "上海") {
                            legendSelected[key] = true;
                        } else {
                            legendSelected[key] = false;
                        }

                        for (var k in geoCoordMap) {
                            if (RouteDirection == 'out') {
                                obj1 = {
                                    name: key
                                }
                                obj2 = {
                                    name: k
                                }
                            } else if (RouteDirection == 'in') {
                                obj1 = {
                                    name: k
                                }
                                obj2 = {
                                    name: key
                                }
                            }

                            seriesData.push([obj1, obj2])
                        }
                        if (RouteDirection == 0) {
                            seriesDataList = {}
                        } else {
                            seriesDataList[key] = seriesData;
                            seriesData = [];
                        }

                    }
                };

                outSeriesList(RouteDirection);

                function getCitys() {
                    var res = []
                    var obj = {};
                    for (var key in geoCoordMap) {
                        obj = {
                            "name": key,
                            "value": geoCoordMap[key]
                        }
                        res.push(obj)
                    }
                    return res;
                }

                var convertData = function(data) {
                    var res = [];
                    for (var i = 0; i < data.length; i++) {
                        var dataItem = data[i];
                        var fromCoord = geoCoordMap[dataItem[0].name];
                        var toCoord = geoCoordMap[dataItem[1].name];
                        if (fromCoord && toCoord) {
                            res.push({
                                fromName: dataItem[0].name,
                                toName: dataItem[1].name,
                                coords: [fromCoord, toCoord]
                            });
                        }
                    }
                    return res;
                };

                var series = [];

                series = [{
                    name: title,
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
                    data: getCitys(),
                    tooltip: {
                        formatter: function(params) {
                            var name = params.name,
                                value = params.value[params.value.length - 1],
                                seriesName = params.seriesName;
                            var str = seriesName + '<br>' + name + ':' + value;
                            return str;
                        }
                    }
                }]

                for (var item in seriesDataList) {
                    series.push({
                        name: item,
                        type: 'lines',
                        coordinateSystem: 'geo',
                        zlevel: 2,
                        large: true,
                        effect: {
                            show: true,
                            constantSpeed: flightIconSpeed,
                            shadowBlur: 0,
                            symbol: FlightIcon,
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
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, getFlightColor(flightIconColor), false),
                                width: 1,
                                opacity: 0.6,
                                curveness: 0.2
                            }
                        },
                        data: convertData(seriesDataList[item])
                    })
                }

                var visualMap = [{
                    min: min,
                    max: max,
                    show: visualMapStatus,
                    calculable: true,
                    left: 'left',
                    top: 'bottom',
                    origin: 'vertical',
                    textStyle: {
                        color: "#ccc"
                    },
                    inRange: {
                        color: getVisualMapColor(visualMapColor)
                    }
                }];

                var option = {
                    backgroundColor: layout.backgroundColor,
                    tooltip: {
                        trigger: 'item'
                    },
                    legend: {
                        show: legendLabelSwitch,
                        x: lengendPositionX,
                        y: lengendPositionY,
                        width: legendWidth + "%",
                        selectedMode: 'single',
                        data: legendData,
                        pageIconColor: "#ccc",
                        pageTextStyle: {
                            color: "#ccc"
                        },
                        type: legendStyle,
                        selected: legendSelected,
                        textStyle: {
                            color: '#ccc'
                        }
                    },
                    geo: {
                        map: 'world',
                        label: {
                            emphasis: {
                                show: false
                            }
                        },
                        roam: true,
                        itemStyle: {
                            normal: {
                                areaColor: 'transparent',
                                borderColor: '#fff'
                            },
                            emphasis: {
                                areaColor: 'rgba(0,0,0,0)'
                            }
                        }
                    },
                    series: series,
                    visualMap: visualMap
                };

                var myCharts = echarts.init($element.find('.worldMap')[0]);
                myCharts.setOption(option);

                return qlik.Promise.resolve();
            }
        };

    });