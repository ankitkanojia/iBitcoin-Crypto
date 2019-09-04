var Spark = {
  removeNoJs: function(){
    $('html:first').removeClass('no-js');
  },
  removeLoadingScreen: function(){
    $(document).ready(function() {
      $('.splash').removeClass('active');
    });
  },
  animateWidgetsAfterPageLoad: function(){
    $(document).ready(function() {
      var speed = 2000;
      var delay = 0;
      var container = $('.page-content');
      container.each(function() {
          var elements = $(this).find('.widget');
          elements.each(function() {
              var elementOffset = $(this).offset();
              var offset = elementOffset.left * 0.8 + elementOffset.top;
              var delay = (parseFloat(offset / speed) - 0.3).toFixed(2);
              $(this)
                .css('-webkit-animation-delay', delay + 's')
                .css('-o-animation-delay', delay + 's')
                .css('animation-delay', delay + 's');
              $(this).addClass('animated');
          });
      });
    });
  },
  createSidebar: function(){
    $('.sidebar-collapse').on('click', function(){
      $('.page-body').toggleClass('collapsed');
    });
    $('.sidebar-open').on('click', function(){
      $('.page-sidebar').removeClass('toggled');
    });
    $('.sidebar-close').on('click', function(){
      $('.page-sidebar').addClass('toggled');
    });

    $('.nav-stacked').on('show.bs.collapse', function () {
        $('.nav-stacked .in').collapse('hide');
    });
  },
  createSearch: function(){
    var mark = function() {
      var keyword = $('.keyword-search').val();
      $('.page-content').unmark().mark(keyword);
    };

    $('.keyword-search').on('input', mark);
  },
  // createSnackbars: function(){
  //   MDSnackbars.init();
  //   setTimeout(function(){
  //     MDSnackbars.show({text: 'Good afternoon Lucy!', timeout:7500, align: 'right', animation: 'slideup'});
  //   }, 1500);
  //   setTimeout(function(){
  //     MDSnackbars.show({text: '<strong>Robert says:</strong> Good work yesterday! Lunch at 2pm?', timeout:7500, align: 'right', html: true, animation: 'slideup'});
  //   }, 12500);
  // },
  createWidgets: function() {

    $('.widget-minify').on('click', function(e){
      e.preventDefault();
      $(this).closest('.widget').toggleClass('collapsed');
      $(this).find('i').toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
    });

    $('.widget-close').on('click', function(e){
      e.preventDefault();
      $(this).closest('.widget').hide();
    });
  },
  callOnResize: [],
  handleElementsOnResizing: function() {
    var resizing;
    $(window).resize(function() {
      if (resizing) {
        clearTimeout(resizing);
      }
      resizing = setTimeout(function() {
        for (var i = 0; i < Spark.callOnResize.length; i++) {
          Spark.callOnResize[i].call();
        }
      }, 300);
    });
  },
  rightToLeft: function(){

    var rtl = Spark.getUrlParameter('rtl');
    if(rtl && rtl == 'true'){
      $('body').addClass('right-to-left');

      $('a').each(function() {
        if(this.href.indexOf('#') === -1){
          this.href = this.href + '?rtl=true';
        }
      });
    }

  },
  getUrlParameter: function(sParam){
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
  },
  init: function(){
    this.removeNoJs();
    this.removeLoadingScreen();
    this.animateWidgetsAfterPageLoad();
    this.createSidebar();
    this.createSearch();
    //this.createSnackbars();
    this.createWidgets();
    this.handleElementsOnResizing();
    this.rightToLeft();
  }
}
