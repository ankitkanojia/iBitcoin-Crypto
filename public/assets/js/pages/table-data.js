var Page = {
	createDataTableNormal: function(){
        $('#table-normal').DataTable();
	},
    createDataTableTwo: function(){
        $('#table-two').DataTable({
            "pagingType": "simple" 
        });	
    },
    createDataTableFour: function(){
        $('#table-four').DataTable({
            "pagingType": "full" 
        });	
    },
	init:function() {
		this.createDataTableNormal();
        this.createDataTableTwo();
        this.createDataTableFour();
	}
}