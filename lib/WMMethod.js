function WorldMap(layout) {

    this.min = layout.qHyperCube.qMeasureInfo[0].qMin;
    this.max = layout.qHyperCube.qMeasureInfo[0].qMax;

    this.title = layout.qHyperCube.qDimensionInfo[0].qFallbackTitle; //获取维度字段名称
    this.legendLabelSwitch = layout.legendLabelSwitch; //图例开关变量
    this.bgColor = layout.backgroundColor; //地图背景色
    this.FlightIcon = layout.FlightIcon; //航线图标
    this.flightIconColor = layout.flightIconColor; //航线颜色
    this.lengendPositionY = layout.lengendPositionY; //图例Y轴位置
    this.lengendPositionX = layout.lengendPositionX; //图例X轴位置
    this.legendWidth = layout.legendWidth; //图例横向的宽度
    this.flightIconSpeed = layout.flightIconSpeed; //飞行物的运行速度
    this.legendStyle = layout.legendType; //图例的排列方式，是平铺还是scroll
    this.visualMapStatus = layout.visualMapStatus; //阈值条状是否绘制
    this.RouteDirection = layout.RouteDirection; //飞行方向
    this.visualMapColor = layout.visualMapColor;
    this.qHyperCube = layout.qHyperCube;

    this.geoCoordMap = {}; //地点经纬度配置项
    this.seriesDataList = [];
    this.legendData = [];
    this.legendSelected = {};
}

WorldMap.prototype = {
    // 获取航线线路颜色
    getFlightColor: function() {
        if (this.flightIconColor) {
            var flightIconColor = this.flightIconColor;

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
    },
    
    // 获取阈值颜色
    getVisualMapColor: function() {
        if (this.visualMapColor) {
            var visualMapColor = this.visualMapColor;
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
    },

    // 获取geoCoordMap
    getGeoCoordMap: function() {
        var qHyperCube = this.qHyperCube;
        var dataList = qHyperCube.qDataPages[0].qMatrix; //获取数据拼接data
        for (var i in dataList) {
            var geoArr = []; //经纬度坐标数组
            geoArr.push(dataList[i][0].qAttrExps.qValues[0].qNum, dataList[i][0].qAttrExps.qValues[1].qNum, dataList[i][1].qText); //插入经度跟纬度
            this.geoCoordMap[dataList[i][0].qText] = geoArr;
        }
        return this.geoCoordMap
    },

    // 拼接series里边用到的每个data
    getSeriesData: function() {

        var geoCoordMap = this.geoCoordMap;
        var seriesData = [];

        for (var key in geoCoordMap) {
            // 拼接图例
            this.legendData.push({ name: key, icon: 'circle' });
            // 默认选中上海
            if (key == "上海") {
                this.legendSelected[key] = true;
            } else {
                this.legendSelected[key] = false;
            }

            for (var k in geoCoordMap) {
                if (this.RouteDirection == 'out') {
                    obj1 = {
                        name: key
                    }
                    obj2 = {
                        name: k
                    }
                } else if (this.RouteDirection == 'in') {
                    obj1 = {
                        name: k
                    }
                    obj2 = {
                        name: key
                    }
                }

                seriesData.push([obj1, obj2])
            }
            if (this.RouteDirection == 0) {
                this.seriesDataList = {}
            } else {
                this.seriesDataList[key] = seriesData;
                seriesData = [];
            }

        }
        return this.seriesDataList
    },

    getCitys: function() {
        var res = []
        var obj = {};
        for (var key in this.geoCoordMap) {
            obj = {
                "name": key,
                "value": this.geoCoordMap[key]
            }
            res.push(obj)
        }
        return res;
    },

    convertData: function (data) {
        var res = [];
        for (var i = 0; i < data.length; i++) {
            var dataItem = data[i];
            var fromCoord = this.geoCoordMap[dataItem[0].name];
            var toCoord = this.geoCoordMap[dataItem[1].name];
            if (fromCoord && toCoord) {
                res.push({
                    fromName: dataItem[0].name,
                    toName: dataItem[1].name,
                    coords: [fromCoord, toCoord]
                });
            }
        }
        return res;
    },

    getVisualMap: function() {
        var visualMap = [{
            min: this.min,
            max: this.max,
            show: this.visualMapStatus,
            calculable: true,
            left: 'left',
            top: 'bottom',
            origin: 'vertical',
            textStyle: {
                color: "#ccc"
            },
            inRange: {
                color: this.getVisualMapColor()
            }
        }];
        return visualMap
    },

    getOption: function(series) {
        var option = {
            backgroundColor: this.bgColor,
            tooltip: {
                trigger: 'item'
            },
            legend: {
                show: this.legendLabelSwitch,
                x: this.lengendPositionX,
                y: this.lengendPositionY,
                width: this.legendWidth + "%",
                selectedMode: 'single',
                data: this.legendData,
                pageIconColor: "#ccc",
                pageTextStyle: {
                    color: "#ccc"
                },
                type: this.legendStyle,
                selected: this.legendSelected,
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
            visualMap: this.getVisualMap()
        };
        return option
    }
    
}