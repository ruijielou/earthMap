define(["qlik", "./echarts", './world', "./china", "./worldProp"],
    function(qlik, echarts, world, china, worldProp) {

        // 定义全局变量状态
        var worldReset = {
            isInit: true, //开始的时候定义初始化状态
			selected: '',
			selectedLegend: {}, //
			visualMap: {}, //存储每个度量的阈值样式
			legendData: [],
			minMax: {}
        }

        return {
            initialProperties: {
                qHyperCubeDef: {
                    qDimensions: [],
                    qMeasures: [],
                    qInitialDataFetch: [{
                        qWidth: 20,
                        qHeight: 20
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
                        max: 6,
                        items: {
                            centerCityStatus: centerCityStatus,
                            centerCity: centerCity,
                            direction: direction,
                            flightIconSpeed: flightIconSpeed,
                            FlightIcon: FlightIcon,
                            flightIconColor: flightIconColor,
                            visualMapStatus: visualMapStatus,
                            visualMapColor: visualMapColor
                        }
                    },
                    layout1: {
                        type: "items",
                        label: "地图",
                        items: {
							backgroundColor: backgroundColor,
							areaColor: areaColor,
                            mapType: mapType,
                            symbolSize: symbolSize,
                            Legend: Legend,
                            // legendStyle: legendStyle,
                            lengendPositionY: lengendPositionY,
                            lengendPositionX: lengendPositionX,
                            // legendWidth: legendWidth
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

				var app = qlik.currApp();//获取当前应用程序的引用

                //add your rendering code here
                var height = $element.height();
                var width = $element.width();

                // 插入元素
                $element.html("<div class='worldMap' style='height: " + height + "px;width: " + width + "px'></div>");

				var qHyperCube = layout.qHyperCube;
				var qMatrix = qHyperCube.qDataPages[0].qMatrix;
                var geoCoordMap = getGeoCoordMap();
                var legendData = [];
				var seriesDataList = getSeriesData();
				
				var series = [];

                function getGeoCoordMap() {
                    var geoCoordMapData = {}

                    var dataList = qMatrix; //获取数据拼接data

                    for (var i in dataList) {
                        var geoArr = []; //经纬度坐标数组
                        var geoArr2 = []; //经纬度坐标数组

                        geoArr.push(dataList[i][0].qAttrExps.qValues[0].qNum, dataList[i][0].qAttrExps.qValues[1].qNum, dataList[i][2].qText); //插入经度跟纬度
                        geoCoordMapData[dataList[i][0].qText] = geoArr;

                        geoArr2.push(dataList[i][1].qAttrExps.qValues[0].qNum, dataList[i][1].qAttrExps.qValues[1].qNum, dataList[i][2].qText); //插入经度跟纬度
						
						if (!geoCoordMapData[dataList[i][1].qText]) {
                            geoCoordMapData[dataList[i][1].qText] = geoArr2;
                        }
					}
					
                    return geoCoordMapData
                }

                function getSeriesData() {

                    var seriesDataList = {};
                    var seriesData = [];
					var dimensionData = [];
					
                    for (var key in qMatrix) {
                        dimensionData.push(qMatrix[key].slice(0, 2))
                        seriesData.push(qMatrix[key].slice(2))
                    }

                    var datas = [];
					var qMeasureInfo = qHyperCube.qMeasureInfo;
					worldReset.legendData = [];

                    for (var i = 0; i < qMeasureInfo.length; i++) {

						legendData.push({ name: qMeasureInfo[i].qFallbackTitle, icon: 'circle' });

						worldReset.legendData.push({ name: qMeasureInfo[i].qFallbackTitle, icon: 'circle' });

						if(worldReset.minMax[qMeasureInfo[i].qFallbackTitle] == undefined) {
							worldReset.minMax[qMeasureInfo[i].qFallbackTitle] = {
								min: qMeasureInfo[i].qMin,
								max: qMeasureInfo[i].qMax
							}
						}
						

						// 如果当前有选中状态的值则走选中状态
						if(worldReset.selected == qMeasureInfo[i].qFallbackTitle) {
							worldReset.selectedLegend[qMeasureInfo[i].qFallbackTitle] = true;
						}else {
							worldReset.selectedLegend[qMeasureInfo[i].qFallbackTitle] = false;
						}

						datas = [];
						
                        for (var item in seriesData) {

                            if (seriesData[item][i].qText !== '0') {
                                var value = seriesData[item][i].qText;
                                var obj1 = {},
                                    obj2 = {};

                                obj1 = {
                                    name: dimensionData[item][0].qText,

                                }
                                obj2 = {
                                    name: dimensionData[item][1].qText,
                                    value: value
                                }
                                datas.push([obj1, obj2])
                            }
                        }
                        seriesDataList[qMeasureInfo[i].qFallbackTitle] = datas;

                    }

                    return seriesDataList;
                }

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

                function getFlightColor(color) {
                    if (color) {
                        var flightIconColor = color;

                        var flightColor = [];
                        var obj = {};
                        // 如果输入的是中文的逗号则转换成英文逗号
                        flightIconColor = flightIconColor.replace(/，/ig, ',');

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

                function convertData(data, parmes) {

                    var direction = parmes.direction;
                    var center = parmes.center || "上海";
					var centerCityStatus = parmes.centerCityStatus;

                    if (parmes.direction == undefined) {
                        direction = 'out';
					}
					
                    var res = [];
                    for (var i = 0; i < data.length; i++) {
                        var dataItem = data[i];
                        var fromCoord = [];
                        var toCoord = []
                            // 如果中心城市不为空的话就按照中心城市
                            // 如果开启了城市中心过滤
                        if (centerCityStatus) {
                         
							center = center == "" ? (this.geoCoordMap['上海'] == undefined ? '' : "上海") : center;
							
							if (center == '') return
							
                            fromCoord = geoCoordMap[center];
                            toCoord = geoCoordMap[dataItem[1].name];

                            if (fromCoord && toCoord) {
                                if (direction == 'out') {
                                    res.push({
                                        fromName: center,
                                        toName: dataItem[1].name,
                                        coords: [fromCoord, toCoord]
                                    });
                                } else if (direction == "in") {
                                    res.push({
                                        fromName: dataItem[1].name,
                                        toName: center,
                                        coords: [toCoord, fromCoord]
                                    });
                                } else if (direction == '0') {
                                    res = []
                                }
                            }
                        } else {

                            fromCoord = geoCoordMap[dataItem[0].name];
							toCoord = geoCoordMap[dataItem[1].name];
							
                            if (fromCoord && toCoord) {
                                if (direction == 'out') {
                                    res.push({
                                        fromName: dataItem[0].name,
                                        toName: dataItem[1].name,
                                        coords: [fromCoord, toCoord]
                                    });
                                } else if (direction == "in") {
                                    res.push({
                                        fromName: dataItem[1].name,
                                        toName: dataItem[0].name,
                                        coords: [toCoord, fromCoord]
                                    });
                                } else if (direction == '0') {
                                    res = []
                                }
                            }
                        }
                    }
                    return res;
				}
				
				function getSeriesList(seriesDataList) {
                    // 以下变量为每个度量上的单独变量， 根据当前选择的图例而改变
                    var direction = '';
                    var flightIconSpeed = '';
                    var FlightIcon = '';
                    var flightIconColor = '';
                    var center = "";
                    var centerCityStatus = '';
                    var visualMapStatus = '';
                    var visualMapColor = '';

                    for (var key = 0; key < qMeasureInfo.length; key++) {
						
                        var title = qMeasureInfo[key].qFallbackTitle;

                        var measureInfo = qMeasureInfo[key];

                        // 第一次加载没有值选择默认值
                        direction = measureInfo.direction || 'out';
                        flightIconSpeed = measureInfo.flightIconSpeed || 10;
                        FlightIcon = measureInfo.FlightIcon || "plane";
                        flightIconColor = getFlightColor(measureInfo.flightIconColor);
                        centerCityStatus = measureInfo.centerCityStatus;

						// 添加进去方便每次切换度量的时候获取改变
                        worldReset.visualMap[title] = {
                            "visualMapStatus": measureInfo.visualMapStatus,
                            "visualMapColor": measureInfo.visualMapColor
                        }

                        if (centerCityStatus != false) {
                            center = measureInfo.centerCity;
                        } else {
                            center = ''
                        }

                        series.push({
                            name: title,
                            type: 'lines',
                            coordinateSystem: 'geo',
                            zlevel: 2,
                            large: true,
                            effect: {
                                show: true,
                                constantSpeed: flightIconSpeed,
                                shadowBlur: 0,
                                symbol: FlightIcon,
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
                                    color: new echarts.graphic.LinearGradient(0, 0, 0, 0.5, flightIconColor, false),
                                    width: 2,
                                    opacity: 0.4,
                                    curveness: 0.2,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)',
                                    shadowBlur: 10
                                }
                            },
                            // 传一个center的城市为当前过滤项
                            data: convertData(seriesDataList[title], { direction: direction, center: center, centerCityStatus: centerCityStatus })
                        })
                    }
				}

				function getVisualMapColor(color) {
					if (color) {
						var visualMapColor = color;
						var visualColor = [];
						// 如果输入的是中文的逗号则转换成英文逗号
						visualMapColor = visualMapColor.replace(/，/ig, ',');
			
						var visualColorList = visualMapColor.split(',');
						// if(visualColorList.length == 0) return
						for (var i = 0; i < visualColorList.length; i++) {
							visualColor.push(visualColorList[i]);
						}
						return visualColor
					}
				}
				
				var qMeasureInfo = layout.qHyperCube.qMeasureInfo;

				getSeriesList(seriesDataList);

                var title = qHyperCube.qDimensionInfo[0].qFallbackTitle;
                var symbolSize = layout.symbolSize;
				var bgColor = layout.backgroundColor; //地图背景色
				var areaColor = layout.areaColor;
                var legendLabelSwitch = layout.legendLabelSwitch; //图例开关变量
                var lengendPositionY = layout.lengendPositionY; //图例Y轴位置
                var lengendPositionX = layout.lengendPositionX; //图例X轴位置
				var mapType = layout.mapType;
				
				var selecte = worldReset.legendData[0].name
				var minMaxData = worldReset.minMax[worldReset.selected] == undefined?worldReset.minMax[selecte] : worldReset.minMax[worldReset.selected];
				console.log(minMaxData)

				var min = minMaxData.min;
				var max = minMaxData.max;

				console.log(min + '==========min' + max)

				console.log(worldReset)
				
				var visualMapColor = worldReset.visualMap[worldReset.selected] == undefined? worldReset.visualMap[selecte].visualMapColor : worldReset.visualMap[worldReset.selected].visualMapColor;
				var visualMapStatus =  worldReset.visualMap[worldReset.selected] == undefined? worldReset.visualMap[selecte].visualMapStatus : worldReset.visualMap[worldReset.selected].visualMapStatus;

                // 添加绘制各个地区圆点的series
                series.push({
                    name: title,
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
                    symbolSize: symbolSize,
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
				});

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
                    backgroundColor: bgColor,
                    tooltip: {
                        trigger: 'item'
                    },
                    legend: {
                        show: legendLabelSwitch,
                        x: lengendPositionX,
                        y: lengendPositionY,
                        selectedMode: 'single',
                        data: legendData,
                        pageIconColor: "#ccc",
                        pageTextStyle: {
                            color: "#ccc"
                        },
                        // type: this.legendStyle,
                        selected: worldReset.selectedLegend,
                        textStyle: {
                            color: '#ccc'
                        }
                    },
                    geo: {
                        map: mapType,
                        label: {
                            emphasis: {
                                show: false
                            }
                        },
                        roam: true,
                        itemStyle: {
                            normal: {
                                areaColor: areaColor,
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

				var myChart = echarts.init($element.find('.worldMap')[0]);

				myChart.setOption(option);
				
				myChart.on('legendselectchanged', function(params) {
                    // console.log(params)
                    worldReset.selected = params.name
					var visualMapStatus = worldReset.visualMap[worldReset.selected].visualMapStatus;
					var visualMapColor = worldReset.visualMap[worldReset.selected].visualMapColor;
					
					for(var key in worldReset.selectedLegend) {

						if(key == worldReset.selected) {

							worldReset.selectedLegend[worldReset.selected] = true;

						}else {

							worldReset.selectedLegend[key] = false;

						}

					}

					option.selected = worldReset.selectedLegend;


					visualMap[0].min = worldReset.minMax[worldReset.selected].min;
					visualMap[0].max = worldReset.minMax[worldReset.selected].max;
					visualMap[0].show = visualMapStatus;
					visualMap[0].inRange.color = getVisualMapColor(visualMapColor);

					myChart.clear();
					myChart.setOption(option);

					worldReset.isInit = false;
                    
				});

				var name1 = qHyperCube.qDimensionInfo[0].qFallbackTitle;
				var name2 = qHyperCube.qDimensionInfo[1].qFallbackTitle;

				myChart.on('click', function(params){
					// console.log(params)
					if(params.name !== "") {
						var value = params.name;
						app.field(name1).selectValues([{qText: value}], true, false);
						app.field(name2).selectValues([{qText: value}], true, false);
						worldReset.isInit = false;
					}
				});

                //needed for export
                return qlik.Promise.resolve();
            }
        };

    });