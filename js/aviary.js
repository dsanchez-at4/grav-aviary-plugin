/**
 * Created by Ricardo on 18/04/2017.
 */

$(document).ready(function () {

    const previewTemplate = `
    <div class="dz-preview dz-image-preview">
      <div class="dz-details">
        <div class="dz-filename"><span data-dz-name></span></div>
        <div class="dz-size" data-dz-size></div>
        <img data-dz-thumbnail />
      </div>
      <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>
      <div class="dz-success-mark"><span>✔</span></div>
      <div class="dz-error-mark"><span>✘</span></div>
      <div class="dz-error-message"><span data-dz-errormessage></span></div>
      <a class="dz-remove" title="Delete" href="javascript:undefined;" data-dz-remove>Delete</a>
      <a class="dz-view" title="View" href="#" target="_blank" data-dz-view>View</a>
      <a class="dz-insert" title="Insert" href="javascript:undefined;" data-dz-insert>Insert}</a>
      <a class="dz-edit" title="Launch Editor" href="javascript:undefined;" data-dz-view>Launch Editor</a>
    </div>`.trim();

    // access the already defined dropzone element
    var myDropzone = Dropzone.forElement("#grav-dropzone");
    myDropzone.options.previewTemplate = previewTemplate;
    // create an element to hold the original image
    var uploadPath = $('#grav-dropzone').attr('data-media-path');
    var phpPath = window.GravAdmin.config.base_url_simple + '/user/plugins/aviary/upload.php';
    var editedImg = {};

    function replaceThumbnail(newURL){
        var files = myDropzone.files;
        $.each(files, function (index, file) {
            if(file.name == editedImg.name){//we have the correct file currently in dropzone
                myDropzone.createThumbnailFromUrl(file, newURL, null, true); // create a new thumbnail from the edited picture
            }
        })
    }

    function getImgfromURL(url){
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var img = new Image();
        img.crossOrigin = true;
        img.src = url;
        img.onload = function () {
            context.drawImage(img,0,0);
            var dataURL = canvas.toDataURL("image/png");
            uploadImg(dataURL,uploadPath, editedImg.name);
        }
    }

    function uploadImg(dataURL, uploadPath, imgName) {
        $.ajax({
            type: "POST",
            url: phpPath,
            data: {
                imgBase64: dataURL,
                uploadPath: uploadPath,
                imgName: imgName
            },
            success: function(data) {
                console.log(data);
            }
        }).done(function(o) {

        });
    }
    // Image Editor configuration
    var csdkImageEditor = new Aviary.Feather({
        apiKey: 'bf06a5ee072248539ec95c826d4366f1',
        onSave: function(imageID, newURL) {
            replaceThumbnail(newURL);
            getImgfromURL(newURL);
            csdkImageEditor.close();
        },
        onError: function(errorObj) {
            console.log(errorObj.code);
            console.log(errorObj.message);
            console.log(errorObj.args);
        }
    });

    // Launch Image Editor
    $('#grav-dropzone').on('click', '.dz-edit', function(event) {
        event.preventDefault();//prevent default so the a's href doesn't send us to the image directly

        var originalImg = document.createElement('img');
        originalImg.src = $(this).attr('href'); // set the original image src

        //grab the currently in editor img file name
        editedImg.name = $(this).parent().find('[data-dz-name]').text();

        // launch the editor with the created img element
         csdkImageEditor.launch({
             image: originalImg,
         });
    });

});