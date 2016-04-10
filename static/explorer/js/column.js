$(document).ready(function() {
    cnt = 0;
	$('#td_column a:not(.header)').mouseover(function(){
        quad_vertical(0);
//        td_pos = $('#td_column').offset();
//        $('.logo_row').css('left', (td_pos.left)+'px');
    });
})

function quad_vertical(row){
    div_row = '<div class="logo_row count_'+cnt+'" />';
    $('#td_column').prepend(div_row);

    for(cell = 1; cell <= 4; cell++){
        be = Math.round( Math.random() );
        if(be==1){
            $('.count_'+cnt).append(
                '<div class="logo_cell logo_'+row+''+cell+'" />'
            );
        }
    }

    row++;
    if(row < 5){
        setTimeout(function () {
            quad_vertical(row);
        }, 100);
    }

    $('.count_'+cnt).fadeIn(300, function(){
        $(this).fadeOut(500, function(){
            $(this).remove(); });
    });
    cnt++;
}
