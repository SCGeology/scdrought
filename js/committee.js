//color vacant cells for committee members table
$( ".divTableCell:contains('Vacant')" ).parent().css( "color", "#7c1a04" );

$( ".fa-plus-square" ).click(function() {
    $(this).next(".contact-info").slideToggle( "slow", function() {});
  $(this).toggleClass("fa-minus-square fa-plus-square");
});