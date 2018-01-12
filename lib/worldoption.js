//  map option

var planePath = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z';

var flagPath = "path://M930.317968 40.699906c-5.53904-3.492004-25.16651-13.365945-48.647225 8.669802-2.889934 2.76952-5.900282 5.53904-8.669802 8.308561-61.170273 58.159925-101.508937 96.451552-325.960489 21.072437-60.327375-20.349953-121.738476-29.380997-182.427093-26.972719-48.526811 1.926623-96.812794 11.198495-143.172154 27.574788C142.088429 107.288805 95.126999 146.302916 93.200376 147.988711c-1.685795 1.444967-3.251176 3.130762-4.575729 4.816557-11.439323 7.104421-16.25588 21.79492-10.596425 34.558796l347.394167 784.737535c6.14111 13.968015 22.39699 20.229539 36.365005 14.088429 13.968015-6.14111 20.229539-22.39699 14.088429-36.365005L314.882408 586.174976c0.842897-1.685795 1.806209-3.37159 2.649106-5.177799C354.016933 511.157103 395.439323 432.165569 608.09031 450.950141c38.773283 3.492004 76.703669-2.889934 112.827846-18.904986 2.287865-0.963311 4.455315-2.047037 6.74318-3.130762 32.752587-15.65381 64.060207-39.375353 92.839135-70.442145 45.034807-48.647225 84.771402-116.921919 108.9746-187.364064 9.271872-26.852305 15.292568-51.657573 17.700847-71.887112C949.463782 80.316087 950.065851 53.463782 930.317968 40.699906z"

var longitude = {
    type: 'string',
    component: 'expression',
    label: '经度',
    ref: 'qAttributeExpressions.0.qExpression'
}

var latitude = {
    type: 'string',
    component: 'expression',
    label: '纬度',
    ref: 'qAttributeExpressions.1.qExpression'
}

var direction = {
    // type: 'string',
    // component: 'expression',
    // label: '纬度',
    // ref: 'qAttributeExpressions.1.qExpression'

    type: "string",
    component: "dropdown",
    label: "航线方向",
    ref: "qDef.direction",
    options: [{
        value: 'out',
        label: "out"
    }, {
        value: 'in',
        label: "in"
    }, {
        value: '0',
        label: "none"
    }],
    defaultValue: 'out'
}

var Legend = {
    type: 'boolean',
    component: 'switch',
    label: '开启图例',
    ref: 'legendLabelSwitch',
    options: [{
            value: true,
            label: 'On'
        },
        {
            value: false,
            label: 'Off'
        }
    ],
    defaultValue: true
}

var legendWidth = {
    type: "number",
    component: "slider",
    label: "图例宽度",
    ref: "legendWidth",
    min: 10,
    max: 100,
    step: 10,
    defaultValue: 100,
    show: function(data) {
        return data.legendLabelSwitch != false;
    }
}
var legendStyle = {
    type: 'string',
    component: "dropdown",
    label: "显示方式",
    ref: "legendType",
    options: [{
        value: 'plain',
        label: "repeat"
    }, {
        value: 'scroll',
        label: "scroll"
    }],

    show: function(data) {
        return data.legendLabelSwitch != false;
    },
    defaultValue: 'plain',
}
var lengendPositionX = {
    type: "string",
    component: "dropdown",
    label: "图例X轴方向位置",
    ref: "lengendPositionX",
    options: [{
        value: 'left',
        label: "left"
    }, {
        value: 'center',
        label: "center"
    }, {
        value: 'right',
        label: "right"
    }],
    show: function(data) {
        return data.legendLabelSwitch != false;
    },
    defaultValue: 'left'
}
var lengendPositionY = {
    type: "string",
    component: "dropdown",
    label: "图例Y轴方向位置",
    ref: "lengendPositionY",
    options: [{
        value: 'top',
        label: "top"
    }, {
        value: 'middle',
        label: "middle"
    }, {
        value: 'bottom',
        label: "bottom"
    }],
    show: function(data) {
        return data.legendLabelSwitch != false;
    },
    defaultValue: 'top'
}
var FlightIcon = {
    type: "string",
    component: "dropdown",
    label: "航线图标",
    ref: "FlightIcon",
    options: [{
        value: planePath,
        label: "plane"
    },{
        value: flagPath,
        label: "flag"
    }, {
        value: 'circle',
        label: "circle"
    }, {
        value: 'rect',
        label: "rect"
    }, {
        value: 'roundRect',
        label: "roundRect"
    }, {
        value: 'triangle',
        label: "triangle"
    }, {
        value: 'diamond',
        label: "diamond"
    }],
    defaultValue: planePath,
    show: function(data) {
        return data.RouteDirection != 0;
    }
}

var flightIconSpeed = {
    type: "number",
    component: "slider",
    label: "图标速度",
    ref: "flightIconSpeed",
    min: 5,
    max: 50,
    step: 5,
    defaultValue: 30,
    show: function(data) {
        return data.RouteDirection != 0;
    }
}

// var RouteDirection = {
//     type: "string",
//     component: "dropdown",
//     label: "航线方向",
//     ref: "RouteDirection",
//     options: [{
//         value: 0,
//         label: "None"
//     }, {
//         value: 'out',
//         label: "out"
//     }, {
//         value: 'in',
//         label: "in"
//     }],
//     defaultValue: 'out'
// };


var flightIconColor = {
    ref: "flightIconColor",
    label: "航线颜色(添加多个颜色请用逗号分隔)",
    type: "string",
    defaultValue: '#58B3CC, #F58158',
    show: function(data) {
        return data.RouteDirection != 0;
    }
}
var backgroundColor = {
    ref: "backgroundColor",
    label: "背景色(rgb, 十六进制, 颜色值)",
    type: "string",
    defaultValue: '#044061'
}

// 阈值显示状态
var visualMapStatus = {
    type: 'boolean',
    component: 'switch',
    label: '是否显示阈值状态条',
    ref: 'visualMapStatus',
    options: [{
            value: true,
            label: 'ON'
        },
        {
            value: false,
            label: 'Off'
        }
    ],
    defaultValue: true
}

//  阈值颜色
var visualMapColor = {
   ref: "visualMapColor",
   label: "阈值颜色(添加多个颜色请用逗号分隔)",
   type: "string",
   defaultValue: '#58B3CC, #F58158',
   show: function(data) {
       return data.visualMapStatus != false;
   }
}

var mapType = {
   type: "string",
   component: "dropdown",
   label: "地图切换",
   ref: "mapType",
   options: [{
       value: 'world',
       label: "world"
   }, {
       value: 'china',
       label: "china"
   }],
   defaultValue: 'world'
}

