var vent;

/*
 * Manages file picker window
 */
var FilePicker = {
  
  enableUpload: function() {
    $('#make-upload').css({display: ''});
    var fakeFileName = $("#modal-file-input").val();
    fakeFileName = fakeFileName.substring( fakeFileName.lastIndexOf("\\") + 1 );
    $('#modal-file-name').html( fakeFileName );
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
