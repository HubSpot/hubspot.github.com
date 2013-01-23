(function($){
    var auth =
        location.hostname == 'hubspot.github.com' ?
            '&client_secret=e6076c603211e64d66d48c32cf280d94608ee3e1&client_id=5ee4cbe96c95a732e360' :
            '&client_secret=1c913440a7f4a217be521afa7e21524f76b99026&client_id=956ae3b51f999e57b020'
    ;

    function addRepos(repos, page) {
        repos = repos || [];
        page = page || 1;

        var uri = '' +
            'https://api.github.com/orgs/HubSpot/repos?callback=?' +
            '&per_page=100' +
            '&page=' + page +
            auth
        ;

        $.getJSON(uri, function (result) {
            if (result.data && result.data.length > 0) {
                repos = repos.concat(result.data);
                addRepos(repos, page + 1);
            } else {
                $(function(){
                    // Remove repos whose descriptions don't contain #hubspot-open-source

                    var temp_repos = [];

                    $.each(repos, function(i, repo){
                        if (/#hubspot-open-source/i.test(repo.description)) {
                            temp_repos.push(repo);
                        }
                    });

                    repos = temp_repos;

                    $('#num-repos').text(repos.length);

                    // Convert pushed_at to Date.
                    $.each(repos, function (i, repo) {
                        repo.pushed_at = new Date(repo.pushed_at);

                        var weekHalfLife  = 1.146 * Math.pow(10, -9);

                        var pushDelta = (+new Date()) - Date.parse(repo.pushed_at);
                        var createdDelta = (+new Date()) - Date.parse(repo.created_at);

                        var weightForPush = 1;
                        var weightForWatchers = 1.314 * Math.pow(10, 7);

                        repo.hotness = weightForPush * Math.pow(Math.E, -1 * weekHalfLife * pushDelta);
                        repo.hotness += weightForWatchers * repo.watchers / createdDelta;
                    });

                    // Sort by highest # of watchers.
                    repos.sort(function (a, b) {
                        if (a.hotness < b.hotness) return 1;
                        if (b.hotness < a.hotness) return -1;
                        return 0;
                    });

                    $.each(repos, function (index, repo) {
                        addRepo(repo, index);
                    });

                    $repos = $('#repos li.repo');

                    $('#repos li.repo > a').click(function(e){
                        e.preventDefault();
                        $link = $(this);
                        $repos.removeClass('selected');
                        $link.parent().addClass('selected');
                        openRepo($link.data('repo_full_name'));
                    });

                    // Sort by most-recently pushed to.
                    repos.sort(function (a, b) {
                        if (a.pushed_at < b.pushed_at) return 1;
                        if (b.pushed_at < a.pushed_at) return -1;
                        return 0;
                    });

                    $.each(repos.slice(0, 3), function (i, repo) {
                        addRecentlyUpdatedRepo(repo);
                    });
                });
            }
        });
    }

    function addRecentlyUpdatedRepo(repo) {
        var $item = $('<li>');

        var $name = $('<a>').attr('href', repo.html_url).text(repo.name);
        $item.append($('<span>').addClass('name').append($name));

        var $time = $('<a>').attr('href', repo.html_url + '/commits').text(strftime('%h %e, %Y', repo.pushed_at));
        $item.append($('<span>').addClass('time').append($time));

        $item.append('<span class="bullet">&sdot;</span>');

        var $watchers = $('<a>').attr('href', repo.html_url + '/watchers').text(repo.watchers + ' watchers');
        $item.append($('<span>').addClass('watchers').append($watchers));

        $item.append('<span class="bullet">&sdot;</span>');

        var $forks = $('<a>').attr('href', repo.html_url + '/network').text(repo.forks + ' forks');
        $item.append($('<span>').addClass('forks').append($forks));

        $item.appendTo('#recently-updated-repos');
    }

    function addRepo(repo, index) {
        var $item = $('<li>').addClass('repo grid-cell grid-item-' + (index % 4) + ' ' + (repo.language || '').toLowerCase());
        var $link = $('<a>').data('repo_full_name', repo.full_name).attr('href', repo.html_url).appendTo($item);
        $link.append($('<h2>').text(repo.name));
        $link.append($('<h3>').text(repo.language));
        $link.append($('<p>').text(repo.description));
        $link.append('<div class="languange-indicator" title="' + repo.language + '"></div>');
        $item.appendTo('#repos');
    }

    function openRepo(repo_full_name) {
        var readmeURL = 'https://api.github.com/repos/' + repo_full_name + '/readme?callback=?' + auth,
            markdown_contents = '',
            contents = ''
        ;

        $.getJSON(readmeURL, function (result) {
            var ghBanner;
            markdown_contents = decode64(result.data.content.substr(0, result.data.content.length - 2));
            marked.setOptions({
                gfm: true,
                tables: true,
                breaks: false,
                pedantic: false,
                sanitize: true,
                smartLists: true
            });

            contents = marked(markdown_contents);
            $('#selected-repo').html(contents).removeClass('hidden');
            window.scrollTo(0, 0);

            ghBanner = '<a href="https://github.com/' + repo_full_name + '"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png" alt="Fork me on GitHub"></a>'
            $('#github-banner').html(ghBanner);
        });
    }

    var keyStr = "ABCDEFGHIJKLMNOP" +
       "QRSTUVWXYZabcdef" +
       "ghijklmnopqrstuv" +
       "wxyz0123456789+/" +
       "=";


    function decode64(input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
            output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
            output = output + String.fromCharCode(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return unescape(output);
    }


    addRepos();

    $.getJSON('https://api.github.com/orgs/HubSpot/members?callback=?' + auth, function (result) {
        var members = result.data;

        $(function(){
            $('#num-members').text(members.length);
        });
    });
})(jQuery);