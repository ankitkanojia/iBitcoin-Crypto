var Page = {
    createSummernoteDefault: function() {
      $('.summernote-default').summernote({
        focus: false,
        height: 300,
        minHeight: null,
        maxHeight: null,
        toolbar: [
          ['style', ['bold', 'italic', 'underline', 'clear']],
          ['font', ['strikethrough', 'superscript', 'subscript']],
          ['fontsize', ['fontsize']],
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['height', ['height']]
        ]
      });
    },
    createSummernoteInline: function() {
      $('.summernote-inline').summernote({
        airMode: true
      });
    },
    removeNotePopover: function(){
       $('.note-popover').css({'display': 'none'});
    },
    init:function() {
        this.createSummernoteDefault();
        this.createSummernoteInline();
        this.removeNotePopover();
    }
}
