(function($) {
  var scroll = {
    anclas: function() {
      $('a[href*="#"]')
        .not('[href="#"]')
        .not('[href="#0"]')
        .not('[href="#!"]')
        .click(function(event) {
          if (
            location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') &&
            location.hostname == this.hostname
          ) {
            var target = $(this.hash);
            target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
            if (target.length) {
              event.preventDefault();
              $('html, body').animate({
                scrollTop: target.offset().top
              }, 1000, function() {
                var $target = $(target);
                $target.focus();
              });
            }
          }
        });
    },

    init: function() {
      scroll.anclas();
    }
  }

  $(function() {
    scroll.init();
	  
	  $(".rosca-galeria .load-gallery").on('click',function(e){
		$(this).parent().toggleClass("expanded");
		$(this).closest("section").find(".gallery-grid .photo-element.hidden").removeClass("hidden");
		$(this).parent().remove();
		return false;
		});
	  
	  $("#form_ganadores").validate({
		highlight: function(element) {
			$(element).closest('.ctrl-holder').removeClass('valid').addClass('error');
			$(element).closest('.select-holder').removeClass('valid').addClass('error');
		},
		unhighlight: function(element) {
			$(element).closest('.ctrl-holder').addClass('valid').removeClass('error');
			$(element).closest('.select-holder').addClass('valid').removeClass('error');
		},
		rules: {
			'ganadores_nombre': {
				required: true
			},
			'ganadores_empleado': {
				required: true,
				number: true,
				minlength: 8
			},
			'ganadores_localidad': {
				required: true
			}
		},
		messages: {

		},
		submitHandler: function(form, event) {
			form.submit();
		}
	});
  });
})(jQuery);
