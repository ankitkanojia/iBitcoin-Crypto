var Page = {
	createPopovers: function() {
		$('[data-toggle="popover"]').popover()
	},
	createTooltips: function(){
		$('[data-toggle="tooltip"]').tooltip()
	},
	init:function() {
		this.createPopovers();
		this.createTooltips();
	}
}