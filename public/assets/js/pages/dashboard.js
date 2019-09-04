var Page = {
    createChartProfit: function() {
    	//chartProfit
        var chartProfitData = [
            {
                color: "#4DD495",
                label: "Loss",
                data: [
                    [3, 6], [4, 7], [5, 8], [6, 11],
                    [7, 9], [8, 11], [9, 8], [10, 14],
                    [11, 12], [12, 16], [13, 9], [14, 10],
                    [15, 14], [16, 15], [17, 9], [18, 12],
                    [19, 16], [20, 19], [21, 21], [22, 18],
                    [23, 24], [24, 32], [25, 31], [26, 36]
                ],

                lines: {
                    show: true,
                    fill: true,
                    fillColor: {
                        colors: [
                            {
                                opacity: 0.1
                            }, {
                                opacity: 0.1
                            }
                        ]
                    }
                },
                points: {
                    show: true
                },
                shadowSize: 0
            },
            {
                color: "#AFBBBF",
                label: "Profit",
                data: [
                    [3, 3], [4, 5], [5, 4], [6, 9],
                    [7, 5], [8, 8], [9, 5], [10, 6],
                    [11, 4], [12, 7], [13, 4], [14, 3],
                    [15, 4], [16, 6], [17, 4], [18, 7],
                    [19, 12], [20, 12], [21, 18], [22, 15],
                    [23, 20], [24, 25], [25, 22], [26, 25]
                ],
                lines: {
                    show: true,
                    fill: true,
                    fillColor: {
                        colors: [
                            {
                                opacity: 0.2
                            }, {
                                opacity: 0.2
                            }
                        ]
                    }
                },
                points: {
                    show: true
                },
                shadowSize: 0
            }
        ];
        var chartProfitOptions = {
            xaxis: {
                tickLength: 0,
                // tickDecimals: 0,
                color: '#353535',
                // tickFormatter: function(val, axis) {
                //     return "";
                // }
            },
            yaxis: {
                tickLength: 0,
                // min: 0,
                color: '#353535',
                // tickFormatter: function(val, axis) {
                //     return "";
                // }
            },
            grid: {
                hoverable: true,
                clickable: false,
                borderWidth: 0,
                aboveData: false,

            },
            legend: {
                noColumns: 2,
                container: $("#chart-profit-legend")
            },
            tooltip: true,
            tooltipOpts: {
                defaultTheme: false,
                content: " <span>%x.0 May</span> , <span>%s</span> : <span>%y.0M</span>",
            }
        };
        $.plot($("#chart-profit"), chartProfitData, chartProfitOptions);
    },
    createChartPie: function() {

        var chartPieData = [
            {
                "label": "Series1",
                "data": 44,
                "color": "#41D492"
            },
            {
                "label": "Series2",
                "data": 40,
                "color": "#5C59ED"
            },
            {
                "label": "Series3",
                "data": 16,
                "color": "#F2B51D"
            }
        ];

        var chartPieOptions = {
            series: {
                pie: {
                    show: true,
                    innerRadius: 0.6,
                    label: {
                        show: false
                    }
                }
            },
            legend: {
                show: false
            }
        };

        $.plot('#chart-pie', chartPieData, chartPieOptions);
    },
    createWorldMap: function() {

        var mapData = {
            "US": 298,
            "SA": 200,
            "DE": 220,
            "FR": 540,
            "CN": 120,
            "AU": 760,
            "BR": 550,
            "IN": 200,
            "GB": 120,
        };

        $('#world-map').vectorMap({
            map: 'world_mill',
            backgroundColor: "transparent",
            regionStyle: {
                initial: {
                    fill: '#e4e4e4',
                    "fill-opacity": 0.9,
                    stroke: 'none',
                    "stroke-width": 0,
                    "stroke-opacity": 0
                }
            },

            series: {
                regions: [{
                    values: mapData,
                    scale: ["#34A874", "#41D492"],
                    normalizeFunction: 'polynomial'
                }]
            },
        });
    },
    createSalesSlider: function() {
        $('.resellers-slider').bxSlider({
            mode: 'vertical',
            auto: true,
            controls: false,
            pager: false,
            pause: 6000
        });
    },
    createCalendar: function() {
        $(".calendar").zabuto_calendar({
            language: "en",
            cell_border: false,
            today: true,
            show_days: true,
            nav_icon: {
              prev: '<i class="ion ion-ios-arrow-left"></i>',
              next: '<i class="ion ion-ios-arrow-right"></i>'
            }
          });
    },
    createToDoList: function() {
        $('.todo-item').on('click', function(e){
            e.preventDefault();
            $(this).toggleClass('done');
            $(this).find('.checkbox').toggleClass('fa-check-square').toggleClass('fa-square-o');
        });
    },
    init:function() {
        this.createChartProfit();
        this.createChartPie();
        this.createWorldMap();
        this.createSalesSlider();
        this.createCalendar();
        this.createToDoList();
    }
}
