(function($){
    var specialRepos;

    specialRepos = {
        offline: {
            icon: 'offline',
            casedTitle: 'Offline'
        },
        pace: {
            icon: 'pace',
            casedTitle: 'PACE'
        },
        vex: {
            icon: 'vex',
            casedTitle: 'Vex'
        },
        odometer: {
            icon: 'odometer',
            casedTitle: 'Odometer'
        },
        signet: {
            icon: 'signet',
            casedTitle: 'Signet'
        },
        messenger: {
            icon: 'messenger',
            casedTitle: 'Messenger'
        },
        BuckyClient: {
            icon: 'bucky',
            casedTitle: 'Bucky'
        },
        sortable: {
            icon: 'sortable',
            casedTitle: 'Sortable'
        },
        tether: {
            icon: 'tether',
            casedTitle: 'Tether'
        },
        drop: {
            icon: 'drop',
            casedTitle: 'Drop'
        },
        select: {
            icon: 'select',
            casedTitle: 'Select'
        },
        tooltip: {
            icon: 'tooltip',
            casedTitle: 'Tooltip'
        },
        shepherd: {
            icon: 'shepherd',
            casedTitle: 'Shepherd'
        },
        Singularity: {
            icon: 'singularity',
            casedTitle: 'Singularity'
        },
        'HBase-Support': {
            icon: 'hbase-support',
            casedTitle: 'HBase-Support'
        },
        'general-store': {
          icon: 'general-store',
          casedTitle: 'General Store'
        }
    };

    function addRepos(repos, page) {
        repos = repos || [];
        page = page || 1;

        var uri = '' +
            'https://api.github.com/orgs/HubSpot/repos?callback=?' +
            '&per_page=100' +
            '&page=' + page
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

                    $repos = $('#repos .repo');

                    $('#repos .repo .links a.readmeLink').click(function(e){
                        e.preventDefault();
                        $link = $(this);
                        $repos.removeClass('selected');
                        $link.parent().addClass('selected');
                        openRepo($link.attr('repo_full_name'));
                        window.location.hash = $link.attr('repo_name');
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

                    if (window.location.hash) {
                        return;

                        var repoName = window.location.hash.replace('#', '');
                        var fullRepoName = 'HubSpot/' + repoName;

                        $('a[repo_full_name="' + fullRepoName + '"]').parent().addClass('selected');
                        openRepo(fullRepoName);
                    }
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
        var specialRepoNameLookup = repo.full_name.substr('HubSpot/'.length);
        var specialRepo = specialRepos[specialRepoNameLookup];
        var homepage = repo.homepage || ('/' + specialRepoNameLookup);
        var description = repo.description.replace('#hubspot-open-source', '');
        var stargazersString = repo.stargazers_count.toString().replace(/,/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

        if (!specialRepo) {
            var $item = $('<div>').addClass('repo ' + (repo.language || '').toLowerCase());
            var $links = $('<div>').addClass('links');
            var $mainLink = $('<a class="main-link">').attr('href', homepage).text(repo.name);
            var $docsLink = $mainLink.clone().removeClass('main-link').addClass('docs-link').text('Docs');
            var $githubLink = $('<a>').addClass('github-link').attr('repo_full_name', repo.full_name).attr('repo_name', repo.name).attr('href', repo.html_url).html('GitHub');
            $item.append($('<h2>').append($mainLink).append($docsLink).append($githubLink));
            $item.append($('<p>').text(description));
            if (repo.language) {
                $item.append($('<h3 class="languange-text">').text(repo.language));
                $item.append('<div class="languange-indicator" title="' + repo.language + '"></div>');
            }

            $('#repos').append($item);
        } else {
            var $specialRepo = $('' +
                '<div class="special-repo">' +
                    '<a href="' + homepage + '" class="os-icon-wrapper"><span class="os-icon os-icon-small ' + specialRepo.icon + '-icon"></span></a>' +
                    '<div class="css special-repo-inner">' +
                        '<h2><a href="' + homepage + '">' + specialRepo.casedTitle + '</a></h2>' +
                        '<p>' + description + '</p>' +
                        '<div class="special-repo-bottom">' +
                            '<div class="stargazers"><a href="' + repo.html_url + '">GitHub &#9733; ' + stargazersString + '</a></div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '');
            $('#special-repos').append($specialRepo);
        }
    }

    function openRepo(repo_full_name) {
        var readmeURL = 'https://api.github.com/repos/' + repo_full_name + '/readme?callback=?',
            markdown_contents = '',
            contents = ''
        ;

        $.getJSON(readmeURL, function (result) {
            var ghBanner, $selected;
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

            var $selectedRepo = $('#selected-repo').html(contents).removeClass('hidden');
            $selectedRepo.append('<div id="github-banner"><a href="https://github.com/' + repo_full_name + '"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://s3.amazonaws.com/github/ribbons/forkme_right_orange_ff7600.png" alt="Fork me on GitHub"></a></div>');
            $('html, body').animate({
                scrollTop: ($selectedRepo.offset().top - 20) || 0
            }, 1000);
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

    $.getJSON('https://api.github.com/orgs/HubSpot/members?callback=?', function (result) {
        var members = result.data;

        $(function(){
            $('#num-members').text(members.length);

            members.sort(function (a, b) {
                if (a.login.toLowerCase() < b.login.toLowerCase()) return -1;
                if (b.login.toLowerCase() < a.login.toLowerCase()) return 1;
                return 0;
            });

            $.each(members, function(i, member){
                if (member.type === 'User') {
                    $('#members-list').append('<a href="http://github.com/' + member.login + '"><h2>' + member.login + '</h2><img src="' + member.avatar_url + '&s=200" title="' + member.login + '"></a>');
                }
            });
        });
    });
})(jQuery);
