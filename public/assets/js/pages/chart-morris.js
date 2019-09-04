var Page = {
  initLine: function() {
    var $data  = [
      { y: '2010', a: 30, b: 65 },
      { y: '2011', a: 40, b: 50 },
      { y: '2012', a: 85, b: 20 },
      { y: '2013', a: 60, b: 50 },
      { y: '2014', a: 75, b: 40 },
      { y: '2015', a: 130, b: 70 },
      { y: '2016', a: 130, b: 60 }
    ];
    this.createLine('line-chart', $data, 'y', ['a', 'b'], ['Series A', 'Series B'],['0.1'],['#ffffff'],['#999999'], ['#ddd', '#41D492']);
  },
  createLine: function(element, data, xkey, ykeys, labels, opacity, fillColor, stockColor, lineColors){
    Morris.Line({
      element: element,
      data: data,
      xkey: xkey,
      ykeys: ykeys,
      labels: labels,
      fillOpacity: opacity,
      pointFillColors: fillColor,
      pointStrokeColors: stockColor,
      behaveLikeLine: true,
      gridLineColor: '#eef0f2',
      hideHover: 'auto',
      lineWidth: '3px',
      pointSize: 0,
      preUnits: '$ ',
      resize: true, //defaulted to true
      lineColors: lineColors
    });
  },
  initBar: function(){
    var $barData  = [
      { y: '2010', a: 70,  b: 60 , c: 25 },
      { y: '2011', a: 45,  b: 40 , c: 50 },
      { y: '2012', a: 75,  b: 65 , c: 90 },
      { y: '2013', a: 45,  b: 35 , c: 20 },
      { y: '2014', a: 70,  b: 65 , c: 56 },
      { y: '2015', a: 100, b: 95 , c: 60 },
      { y: '2016', a: 100, b: 90 , c: 65 }
    ];
    this.createBar('bar-chart', $barData, 'y', ['a', 'b', 'c'], ['Series A', 'Series B', 'Series C'], ['#5BEEAC','#41D492',"#28BB79"]);
  },
  createBar: function(element, data, xkey, ykeys, labels, lineColors){
    Morris.Bar({
      element: element,
      data: data,
      xkey: xkey,
      ykeys: ykeys,
      labels: labels,
      hideHover: 'auto',
      resize: true, //defaulted to true
      gridLineColor: '#eeeeee',
      barSizeRatio: 0.4,
      barColors: lineColors
    });
  },
  initStacked: function(){
    var $stckedData  = [
      { y: '2007', a: 100, b: 80 },
      { y: '2008', a: 75,  b: 70 },
      { y: '2009', a: 110, b: 65 },
      { y: '2010', a: 70,  b: 65 },
      { y: '2011', a: 40,  b: 35 },
      { y: '2012', a: 75,  b: 65 },
      { y: '2013', a: 60,  b: 40 },
      { y: '2014', a: 70,  b: 60 },
      { y: '2015', a: 105, b: 90 },
      { y: '2016', a: 105,  b: 100 }
    ];
    this.createStacked('stacked-chart', $stckedData, 'y', ['a', 'b'], ['Series A', 'Series B'], ['#28BB79','#41D492']);
  },
  createStacked: function(element, data, xkey, ykeys, labels, lineColors){
    Morris.Bar({
      element: element,
      data: data,
      xkey: xkey,
      ykeys: ykeys,
      stacked: true,
      labels: labels,
      hideHover: 'auto',
      resize: true, //defaulted to true
      gridLineColor: '#eeeeee',
      barColors: lineColors
    });
  },
  initDonut: function(){
    var $donutData = [
      {label: "Online Sales", value: 14},
      {label: "In-Store Sales", value: 28},
      {label: "In-App Sales", value: 22}
    ];
    this.createDonut('donut-chart', $donutData, ['#28BB79','#41D492',"#5BEEAC"], '#fff');
  },
  createDonut: function(element, data, colors, bgColor){
    Morris.Donut({
      element: element,
      data: data,
      resize: true, //defaulted to true
      colors: colors,
      backgroundColor: bgColor
    });
  },
  initArea: function(){
    var $areaData = [
      { y: '2010', a: 75,  b: 60 },
      { y: '2011', a: 50,  b: 45 },
      { y: '2012', a: 85,  b: 65 },
      { y: '2013', a: 50,  b: 35 },
      { y: '2014', a: 65,  b: 65 },
      { y: '2015', a: 90, b: 65 },
      { y: '2016', a: 100, b: 70 }
    ];
    this.createArea('area-chart', 0, 0, $areaData, 'y', ['a', 'b'], ['Series A', 'Series B'], ['#28BB79','#41D492'], '#EEF0F2');
  },
  createArea: function(element, pointSize, lineWidth, data, xkey, ykeys, labels, lineColors, gridLineColor){
    Morris.Area({
      element: element,
      pointSize: 0,
      lineWidth: 0,
      data: data,
      xkey: xkey,
      ykeys: ykeys,
      labels: labels,
      hideHover: 'auto',
      resize: true,
      gridLineColor: gridLineColor,
      lineColors: lineColors
    });
  },
  initAreaDotted: function(){
    var $areaDotData = [
      { y: '2010', a: 65,  b: 55 },
      { y: '2011', a: 50,  b: 40 },
      { y: '2012', a: 75,  b: 70 },
      { y: '2013', a: 50,  b: 40 },
      { y: '2014', a: 75,  b: 60 },
      { y: '2015', a: 85,  b: 60 },
      { y: '2016', a: 100, b: 70 },
    ];
    this.createAreaDotted('area-dotted-chart', 0, 0, $areaDotData, 'y', ['a', 'b'], ['Series A', 'Series B'],['#ffffff'],['#999999'], ['#28BB79','#41D492'], '#eef0f2');
  },
  createAreaDotted: function(element, pointSize, lineWidth, data, xkey, ykeys, labels, Pfillcolor, Pstockcolor, lineColors, gridLineColor){
    Morris.Area({
      element: element,
      pointSize: 3,
      lineWidth: 1,
      data: data,
      xkey: xkey,
      ykeys: ykeys,
      labels: labels,
      hideHover: 'auto',
      pointFillColors: Pfillcolor,
      pointStrokeColors: Pstockcolor,
      resize: true,
      gridLineColor: gridLineColor,
      lineColors: lineColors
    });
  },
  init:function() {
    this.initLine();
    this.initBar();
    this.initStacked();
    this.initDonut();
    this.initArea();
    this.initAreaDotted();
  }
}
