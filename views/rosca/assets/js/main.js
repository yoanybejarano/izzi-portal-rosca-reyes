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
  });
})(jQuery);
