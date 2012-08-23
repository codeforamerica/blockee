var vent;

/*
 * Manages file picker window
 */
var FilePicker = {
  
  enableUpload: function() {
    $('#make-upload').css({display: ''});
  },
  
  submitFile: function() {
    $('#upload-form').submit();
  },
  
  toggle: function(v) {
    vent = v;
    var aModal = $("#fileModal");
    $("#fileModal").modal('toggle');
    $("#modal-file-input").change(FilePicker.enableUpload)
  }
}
