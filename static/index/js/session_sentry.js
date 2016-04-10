/*
$(document).ready(function() {


function session(action) {

    console.log('session_sentry.js');
    var session_sentry = {};
    $.ajax({ async:false, dataType:'json', url:'/session/get/',
        success: function(data){
            session_sentry = data;
        }
    });

     client_id = session_sentry['client_id'];
     console.log('client_id: '+client_id);
     object_id = session_sentry['object_id'];
     console.log('object_id: '+object_id);

    //return result;
})

*/