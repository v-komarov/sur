jQuery.fn.fileupload = function(opt){
    $this = $(this);
    set = {
        'url':'/explorer/upload/',
        'type':'POST',
        'dataType':'json'
    }
    if(opt){ $.extend(set,opt); }
    return this.each(function(){
        $this.change(function(){
            xhr = new XMLHttpRequest;
            xhr.open("POST", set.url, true);
            xhr.setRequestHeader("Content-Type", "application/octet-stream");
            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
            xhr.setRequestHeader("X-File-Name", encodeURIComponent($this.val()));
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.send(this.files[0]);
            xhr.onreadystatechange = function(){
                if (xhr.readyState == 4){
                    if(set.dataType == 'json'){
                        response = $.parseJSON(xhr.responseText);
                        if(response == null) { response = {}; }
                    }else{
                        response = xhr.responseText;
                    }
                    set.success.call('',response);
                }
            }
        });
    });
};