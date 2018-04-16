//color vacant cells for committee members table
$( document ).ready(function() {
  // Handler for .ready() called.

    $( ".divTableCell:contains('Vacant')" ).parent().css( "color", "#7c1a04" );

    $( ".fa-plus-square" ).click(function() {
        $(this).next(".contact-info").slideToggle( "slow", function() {});
      $(this).toggleClass("fa-minus-square fa-plus-square");
    });

    $( ".col-sm-3:contains('Vacant')" ).css( "color", "#910c00" )
    
});