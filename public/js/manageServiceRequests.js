 var $btns = $('.note-link').click(function() {
            if (this.id == 'important') {
              var $el = $('.' + this.id).fadeIn();
              $('#note-full-container > div').not($el).hide();
              this.removeClass("d-none");
            } if (this.id == 'all-category') {
              $('all-category').removeClass("d-none");
              var $el = $('.' + this.id).fadeIn();
              $('#note-full-container > div').not($el).hide();
            }if (this.id == 'missing') {
              var $el = $('.' + this.id).fadeIn();
              $('#note-full-container > div').not($el).hide();
              $('missing').removeClass("d-none");
            }
            else {
              $('#note-full-container > div').removeClass("d-none");
              var $el = $('.' + this.id).fadeIn();
              $('#note-full-container > div').not($el).hide();
            }
            $btns.removeClass('active');
            $(this).addClass('active');  
        })
    