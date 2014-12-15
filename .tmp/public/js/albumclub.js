// Rating widget
$('div.rating i').click(function() {
  starClicked = parseInt($(this).attr('id'));
  oldRating = $('i.fa-star').length;

  if (starClicked == 1 && oldRating == 1) {
    newRating = 0;
  }
  else {
    newRating = starClicked;
  }

  stars = $('div.rating i');
  for (i=0; i<newRating; i++) {
    $(stars[i]).removeClass('fa-star-o').addClass('fa-star');
  }
  for (i=newRating; i<5; i++) {
    $(stars[i]).removeClass('fa-star').addClass('fa-star-o');
  }

  $('input[name="ratingValue"]').attr('value', newRating);

});

// Datepicker
$('.datepicker').datepicker({
  changeMonth: true,
  changeYear: true,
  yearRange: '1900:' + new Date().getFullYear(),
  dateFormat: "MM d, yy",
});