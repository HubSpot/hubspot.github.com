(($) ->

    apiUrl = (path) ->
        api_base = "https://git.hubteam.com/api/v3/"
        oauth_string = "d677063ec69bf71c781dd86e214c9c5f6919e96a"

        if isLocal()
            paths = path.split("/")
            return "#{paths[paths.length - 1]}.json"

        return api_base + path + "?access_token=#{oauth_string}"

    isLocal = ->
        return window.location.hostname is "localhost"

    repoUrl = (repo) ->
        repoUrls[repo.name] or repo.html_url

    repoDescription = (repo) ->
        repoDescriptions[repo.name] or repo.description

    repoHomepage = (groupName) ->
        "https://git.hubteam.com/pages/HubSpot/hubspot-pages/#{groupName}"

    getRepoGroup = (repo) ->
        hashes = twttr.txt.extractHashtags repo.description
        return hashes[0] ?= "other"

    addRecentlyUpdatedRepo = (repo) ->
        $item = $("<li>")
        $name = $("<a>").attr("href", repo.html_url).text(repo.name)
        $item.append $("<span>").addClass("name").append($name)
        $time = $("<a>").attr("href", repo.html_url + "/commits").text(strftime("%h %e, %Y", repo.pushed_at))
        $item.append $("<span>").addClass("time").append($time)
        $item.append "<span class=\"bullet\">&sdot;</span>"
        $watchers = $("<a>").attr("href", repo.html_url + "/watchers").text(repo.watchers + " watchers")
        $item.append $("<span>").addClass("watchers").append($watchers)
        $item.append "<span class=\"bullet\">&sdot;</span>"
        $forks = $("<a>").attr("href", repo.html_url + "/network").text(repo.forks + " forks")
        $item.append $("<span>").addClass("forks").append($forks)
        $item.appendTo "#recently_updated_repos"

    addRepoGroup = (group) ->
        $item = $("<li>").addClass("repo_group grid-4 flyin ").attr("id", group.name)
        $link = $("<a>").attr("href", "#").appendTo($item)
        $link.append $("<h2>").text(group.name)

        $stats = $("<div>").addClass('stats').appendTo $item

        # Total repos
        $stats.append $("<h3>").text("Total repos: #{group.repos.length}")

        # Hottest repos
        $title = $("<h3>").text("Hottest Projects:").appendTo $stats
        hottest = group.repos[0..2]
        $hotties = $("<ol>").addClass('hottest').appendTo $stats
        $.each hottest, (i, repo) ->
            repoLanguage = repo.language or "Mystery"
            $li = $("<li>").appendTo $hotties
            $label = $("<span>").addClass("label").addClass(repoLanguage).text(repoLanguage).appendTo $li
            $desc = $("<span>").html(" <strong>#{repo.name}</strong>. #{repo.description}").appendTo $li

        # $link.append $("<p>").text(repoDescription(repo))

        $contrbutors = $("<ol>").addClass('contributors').appendTo $item

        $item.appendTo "#tagged_groups"

    addRepo = (repo) ->
        $item = $("<li>").addClass("repo grid-1 flyin " + (repo.language or "").toLowerCase())
        $link = $("<a>").attr("href", repoUrl(repo)).appendTo($item)
        $link.append $("<h2>").text(repo.name)
        $link.append $("<h3>").text(repo.language)
        $link.append $("<p>").text(repoDescription(repo))

        $item.appendTo "#untagged_groups"

    addContributor = (user, target) ->
        $item = $("<li>")
        $link = $("<a>").attr('href', user.url).appendTo $item
        $image = $("<img>").attr('src', user.avatar_url).attr({title: user.login, alt: user.login}).addClass('flyin').appendTo $link

        target.find('.contributors').append $item

    randomItem = (array) ->
        array[Math.floor(Math.random() * array.length)]

    flyzone = ->
        $flyzone = $("<div>").attr("id", "flyzone").prependTo(document.body) unless $flyzone
        $flyzone

    randomOpacity = (threshold) ->
        opacity = Math.random()
        opacity = Math.random() while opacity < threshold
        opacity

    chooseHMFICType = (type) ->
        return "dharmesh"    if type is "cancel"
        "cancel"

    makeHMFIC = (sizeName, speed) ->
        size = sizeDimensions[sizeName]
        top = Math.floor((flyzone().height() - size) * Math.random())
        @HMFIC = chooseHMFICType(@HMFIC)
        $img = $("<img>").addClass("larry size-" + sizeName).attr("src", "assets/" + @HMFIC + ".png").attr("width", size).attr("height", size).css(
            position: "absolute"
            opacity: randomOpacity(0.4)
            top: top
            left: -size
        )
        $img.prependTo flyzone()
        left = flyzone().width() + size
        $img.animate
            left: left
        , speed, ->
            $img.remove()
            makeRandomHMFIC()

        $img

    makeRandomHMFIC = ->
        size = randomItem(sizes)
        speed = Math.floor(Math.random() * 20000) + 15000
        makeHMFIC size, speed

    repoUrls = {}

    repoDescriptions = {}

    repoGroups = []

    buildingRepos = new $.Deferred()
    $.getJSON apiUrl("orgs/HubSpot/repos"), (result) ->
        repos = result
        groups = {}

        console.log "Repos"
        console.log repos

        $ ->
            $("#num_repos").text repos.length

            $.each repos, (i, repo) ->
                repo.pushed_at = new Date(repo.pushed_at)
                weekHalfLife = 1.146 * Math.pow(10, -9)
                pushDelta = (new Date) - Date.parse(repo.pushed_at)
                createdDelta = (new Date) - Date.parse(repo.created_at)
                weightForPush = 1
                weightForWatchers = 1.314 * Math.pow(10, 7)
                repo.hotness = weightForPush * Math.pow(Math.E, -1 * weekHalfLife * pushDelta)
                repo.hotness += weightForWatchers * repo.watchers / createdDelta

                repo.repoGroup = getRepoGroup repo
                groups[repo.repoGroup] ?= {}
                groups[repo.repoGroup]['name'] ?= repo.repoGroup
                groups[repo.repoGroup]['repos'] ?= []
                groups[repo.repoGroup]['repos'].push repo
                groups[repo.repoGroup]['hotness'] ?= 0
                groups[repo.repoGroup]['hotness'] += repo.hotness

            repos.sort (a, b) ->
                return 1 if a.hotness < b.hotness
                return -1 if b.hotness < a.hotness
                0

            repos.sort (a, b) ->
                return 1 if a.pushed_at < b.pushed_at
                return -1 if b.pushed_at < a.pushed_at
                0

            $.each repos.slice(0, 3), (i, repo) ->
                addRecentlyUpdatedRepo repo

            repoGroups = (group for name, group of groups)

            repoGroups.sort (a, b) ->
                return 1 if a.hotness < b.hotness
                return -1 if b.hotness < a.hotness
                0

            $.each repoGroups, (i, group) ->
                if group.name isnt "other"
                    addRepoGroup group
                else
                    $('#homeless').fadeIn()
                    $.each group.repos, (i, repo) ->
                        addRepo repo

            buildingRepos.resolve()

    $.getJSON apiUrl("orgs/HubSpot/members"), (result) ->
        members = result

        console.log "Members"
        console.log members

        $ ->
            $("#num_members").text members.length

    $.when(buildingRepos).then ->
        $.each repoGroups, (i, group) ->
            return if group.name is "other"

            $group = $ document.getElementById group.name
            groupContributors = {}
            console.log "Getting contributors for #{group.name}"

            $.each group.repos, (i, repo) ->
                $.getJSON apiUrl("repos/HubSpot/#{repo.name}/contributors"), (result) ->
                    contributors = result
                    console.log "Contributors to #{repo.name}"
                    console.log contributors

                    $ ->
                        $.each contributors, (i, contributor) ->
                            if not groupContributors[contributor.login]?
                                setTimeout ->
                                    addContributor(contributor, $group)
                                , i * 80
                                groupContributors[contributor.login] = true

    $flyzone = null
    sizes = [ "smaller", "small", "medium", "large", "fat" ]
    sizeDimensions =
        smaller: 50
        small: 80
        medium: 130
        large: 200
        fat: 300

    $ ->
        $("#logo").click ->
            makeRandomHMFIC()

    match = (/\blarry(=(\d+))?\b/i).exec(window.location.search)
    if match
        n = parseInt(match[2]) or 20
        $ ->
            i = 0

            while i < n
                setTimeout makeRandomHMFIC, Math.random() * n * 500
                ++i
) jQuery