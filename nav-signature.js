(function(){

    var $ = window.jQuery;

    if (!$) {
        return;
    }

    var copyParagraphs = [
        'HubSpot is looking for two interns on our Open Source Infrastructure team in Boston. The open source infrastructure team is a very small group of engineers who build and maintain our open source projects for HubSpot and the community at large. You will work with us to maintain existing projects (review pull requests, close issues), and to build new libraries (including those of your own design).',
        'What you work on will be forever immortalized on GitHub, and will be used by real developers, not shelved away. You will given as much responsibility as you can handle, and day-to-day guidance from a team with over 25k GitHub stars.',
        'We believe in building small, single-purpose, libraries which execute a single thing very well. We believe that it\'s by solving the thorny technical problems in isolation, that we make it possible for product to be built that solves the thorny user problems. We believe that there are limitless opportunities to build things better. We believe that it doesn\'t count if no one uses it.',
        'We don\'t build experimental projects that get shelved away. We build real software that developers use every day, around the world. We are passionate about making building software for the web easier.',
        'If you\'re a student or recent grad with a love the frontend, please apply.'
    ];

    var navSignature = {};

    navSignature.$el = $('<div class="nav-signature"></div>');

    navSignature.href = '#intern-jobs';

    navSignature.template =
        '<div class="nav-signature-wrap"><div class="hs-page-width-normal"><div class="row-fluid"><div class="span12"><div class="clearfix">' +
            '<h1>Open Source Interns</h1>' +
            '<div class="nav-content-wrap">' +
                '<div class="nav-signature-content">' +
                    '<p>' + copyParagraphs.join('</p><p>') + '</p>' +
                '</div>' +
                '<div class="nav-signature-form"></div>' +
            '</div>' +
        '</div></div></div></div></div>'
    ;

    navSignature.init = function() {
        $('#hs-nav-v3 .hs-nav-section.main-nav').prepend(navSignature.$el);

        navSignature.$el.html(navSignature.template);

        hbspt.forms.create({
            portalId: '51294',
            formId: '7e6c8151-397a-47ec-83cf-b9910b67a4aa',
            target: '.nav-signature .nav-signature-form'
        });

        var $originalActiveNavItem = $('.current-nav-item');

        $('[data-nav-signature-opener]').click(function(e){
            e.preventDefault();
            e.stopPropagation();
            if ($(this).hasClass('current-nav-item')) {
                $('body').removeClass('nav-signature-opened');
                $(this).removeClass('current-nav-item');
                navSignature.$el.css('height', navSignature.$el.find('.nav-signature-wrap').height());
                setTimeout(function(){ navSignature.$el.css('height', 0); });
                $originalActiveNavItem.addClass('current-nav-item');
                window.location.href = '#0';
            } else {
                $('body').addClass('nav-signature-opened');
                $(this).addClass('current-nav-item');
                navSignature.$el.css('height', navSignature.$el.find('.nav-signature-wrap').height());
                setTimeout(function(){if ($(this).hasClass('current-nav-item')) { navSignature.$el.css('height', 'auto'); }}, 1000);
                $originalActiveNavItem.removeClass('current-nav-item');
                window.location.href = navSignature.href;
            }
        });

        $('.nav-signature').click(function(e){
            e.preventDefault();
            e.stopPropagation();
        });

        $('body').click(function(){
            if ($('[data-nav-signature-opener]').hasClass('current-nav-item')) {
                $('[data-nav-signature-opener]').click();
            }
        });

        if (window.location.hash === navSignature.href) {
            navSignature.$el.css('height', 'auto');
            $('[data-nav-signature-opener]').click();
        }
    };

    $(navSignature.init);

    window.navSignature = navSignature;

})();