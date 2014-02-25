(function(){
    var $ = window.jQuery;

    var render = function(_copy){
        return '<p>' + _copy.join('</p><p>') + '</p>';
    };
        
    var navSignature = {

        template: function(key){
            return '<div class="nav-signature-wrap"><div class="hs-page-width-normal"><div class="row-fluid"><div class="span12"><div class="clearfix">' +
                    '<h1>' + sigs[key].title + '</h1>' +
                    '<div class="nav-content-wrap">' +
                        '<div class="nav-signature-content">' +
                            render(sigs[key].copy) +
                        '</div>' +
                        '<div class="nav-signature-form"></div>' +
                    '</div>' +
                '</div></div></div></div></div>'
        }
    };

    var sigs = {};

    sigs.intern = $.extend({}, navSignature, {
        href: '#intern-jobs',

        title: 'Open Source Interns',

        copy: [
            'HubSpot is looking for interns on our Open Source Infrastructure team in Boston. The open source infrastructure team is a very small group of engineers who build and maintain our open source projects for HubSpot and the community at large. You will work with us to maintain existing projects (review pull requests, close issues), and to build new libraries (including those of your own design).',
            'What you work on will be forever immortalized on GitHub, and will be used by real developers, not shelved away. You will be given as much responsibility as you can handle, and day-to-day guidance from a team with over 25k GitHub stars.',
            'We believe in building small, single-purpose, libraries which execute a single thing very well. We believe that it\'s by solving the thorny technical problems in isolation, that we make it possible for product to be built that solves the thorny user problems. We believe that there are limitless opportunities to build things better. We believe that it doesn\'t count if no one uses it.',
            'We don\'t build experimental projects that get shelved away. We build real software that developers use every day, around the world. We are passionate about making building software for the web easier.',
            'If you have a love for the frontend and spend your time building things, please apply.'
        ]
    });

    sigs.frontend = $.extend({}, navSignature, {
        href: '#frontend-jobs',

        title: 'Frontend Engineering',

        copy: [
            'If you\'re a good fit, we believe HubSpot is one of the best places to be a Frontend Engineer.',
            'Frontend engineers at HubSpot drive the product direction.  Along with two or three other engineers on their small team, they decide what the customer needs, what to build, and when to deploy it.  Virtually complete control is left with the individual team to make the decisions and deliver value.',
            'We deploy entirely static apps on top of our robust APIs, serving our apps directly from the CDN.  There is no middleman between the fronted developer and the data they are using.  We have a robust style guide full of reusable components, and maintain numerous open source projects we are proud of.',
            'We move quickly and without design reviews, process, or overhead.  On average, an engineer will deploy to production one to three times a day, as he or she finishes features and bug fixes.  We use feature gating, pull requests, and have a robust static versioning system to share code between projects.',
            'If you are results-driven and passionate, please get in touch.',
            'Unfortunately, we are not currently sponsoring H1B visas, but we do have an <a href="http://international.hubspot.com/">Ireland HQ</a>.'
        ]
    });

    sigs.thanks = $.extend({}, navSignature, {
        href: '#thanks',

        title: 'Thanks',

        copy: [
            'Thanks so much for applying!  It\'s not always possible for us to write to every applicant, but we will be sure to get in touch if it looks like you are a good fit.',
            'We look forward to meeting you!'
        ]
    });

    var $el;
    var init = function() {
        $el = $('<div class="nav-signature"></div>');
        $('#hs-nav-v3 .hs-nav-section.main-nav').prepend($el);
    }

    var show = function(key) {
        var sig = sigs[key];

        var formSelector = '.nav-signature-form';

        $el.html(sig.template(key));

        var $originalActiveNavItem = $('.current-nav-item');

        var close = function(){
            $('body').removeClass('nav-signature-opened');
            $('[data-nav-signature-opener]').removeClass('current-nav-item');

            $el.css('height', $el.find('.nav-signature-wrap').height());

            setTimeout(function(){
              $el.css('height', 0);
            });

            $originalActiveNavItem.addClass('current-nav-item');

            window.location.href = '#0';
        };

        var open = function(){
            $('body').addClass('nav-signature-opened');
            $('[data-nav-signature-opener]').addClass('current-nav-item');

            $el.css('height', $el.find('.nav-signature-wrap').height());

            setTimeout(function(){
              if (!isOpen()) {
                $el.css('height', 'auto');
              }
            }, 1000);

            $originalActiveNavItem.removeClass('current-nav-item');

            window.scrollTo(0, 0);
            window.location.href = sig.href;
        };

        $('[data-nav-signature-opener]').click(function(e){
            e.preventDefault();
            e.stopPropagation();

            if (isOpen())
                close();
            else
                open();
        });

        $('body').click(function(e){
            if (!$(e.target).parents('.nav-signature').length && 
                !$(e.target).parents('.widearea-overlayLayer').length &&
                !$(e.target).is('[data-nav-signature-opener]') &&
                isOpen()){
                close();
            }
        });

        hbspt.forms.create({
            portalId: '51294',
            formId: '7e6c8151-397a-47ec-83cf-b9910b67a4aa',
            redirectUrl: document.location.href.split('#')[0] + sigs.thanks.href,
            target: formSelector
        });

        var poll = function(){
            var textarea = $el[0].querySelector('textarea[name="why_are_you_the_right_person_for_the_job_"]');

            if (!textarea){
                setTimeout(poll, 250);
                return;
            } else {
                textarea.setAttribute('data-widearea', 'enable');
                wideArea();
            }
        };

        poll();

        open();
    };

    var isOpen = function(){
        return $('[data-nav-signature-opener]').hasClass('current-nav-item');
    }

    var maybeShow = function(){
        for (var type in sigs){
            var sig = sigs[type];

            if (window.location.hash === sig.href && !isOpen()) {
                show(type);
                $('body').removeClass('nav-signature-opened');
            }
        }
    }

    $(init);

    $(function(){
        maybeShow();
        window.addEventListener('hashchange', maybeShow);
    })

})();
