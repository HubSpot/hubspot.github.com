(function() {

  (function($) {
    var $flyzone, addContributor, addRecentlyUpdatedRepo, addRepo, addRepoGroup, apiUrl, buildingRepos, chooseHMFICType, flyzone, getRepoGroup, isLocal, makeHMFIC, makeRandomHMFIC, match, n, randomItem, randomOpacity, repoDescription, repoDescriptions, repoGroups, repoHomepage, repoUrl, repoUrls, sizeDimensions, sizes;
    apiUrl = function(path) {
      var api_base, oauth_string, paths;
      api_base = "https://api.github.com/";
      oauth_string = "d677063ec69bf71c781dd86e214c9c5f6919e96a";
      if (isLocal()) {
        paths = path.split("/");
        return "" + paths[paths.length - 1] + ".json";
      }
      return api_base + path + ("?access_token=" + oauth_string);
    };
    isLocal = function() {
      return window.location.hostname === "localhost";
    };
    repoUrl = function(repo) {
      return repoUrls[repo.name] || repo.html_url;
    };
    repoDescription = function(repo) {
      return repoDescriptions[repo.name] || repo.description;
    };
    repoHomepage = function(groupName) {
      return "https://github.com/HubSpot/hubspot.github.com/" + groupName;
    };
    getRepoGroup = function(repo) {
      var hashes, _ref;
      hashes = twttr.txt.extractHashtags(repo.description);
      return (_ref = hashes[0]) != null ? _ref : hashes[0] = "other";
    };
    addRecentlyUpdatedRepo = function(repo) {
      var $forks, $item, $name, $time, $watchers;
      $item = $("<li>");
      $name = $("<a>").attr("href", repo.html_url).text(repo.name);
      $item.append($("<span>").addClass("name").append($name));
      $time = $("<a>").attr("href", repo.html_url + "/commits").text(strftime("%h %e, %Y", repo.pushed_at));
      $item.append($("<span>").addClass("time").append($time));
      $item.append("<span class=\"bullet\">&sdot;</span>");
      $watchers = $("<a>").attr("href", repo.html_url + "/watchers").text(repo.watchers + " watchers");
      $item.append($("<span>").addClass("watchers").append($watchers));
      $item.append("<span class=\"bullet\">&sdot;</span>");
      $forks = $("<a>").attr("href", repo.html_url + "/network").text(repo.forks + " forks");
      $item.append($("<span>").addClass("forks").append($forks));
      return $item.appendTo("#recently_updated_repos");
    };
    addRepoGroup = function(group) {
      var $contrbutors, $hotties, $item, $link, $stats, $title, hottest;
      $item = $("<li>").addClass("repo_group grid-4 flyin ").attr("id", group.name);
      $link = $("<a>").attr("href", "#").appendTo($item);
      $link.append($("<h2>").text(group.name));
      $stats = $("<div>").addClass('stats').appendTo($item);
      $stats.append($("<h3>").text("Total repos: " + group.repos.length));
      $title = $("<h3>").text("Hottest Projects:").appendTo($stats);
      hottest = group.repos.slice(0, 3);
      $hotties = $("<ol>").addClass('hottest').appendTo($stats);
      $.each(hottest, function(i, repo) {
        var $desc, $label, $li, repoLanguage;
        repoLanguage = repo.language || "Mystery";
        $li = $("<li>").appendTo($hotties);
        $label = $("<span>").addClass("label").addClass(repoLanguage).text(repoLanguage).appendTo($li);
        return $desc = $("<span>").html(" <strong>" + repo.name + "</strong>. " + repo.description).appendTo($li);
      });
      $contrbutors = $("<ol>").addClass('contributors').appendTo($item);
      return $item.appendTo("#tagged_groups");
    };
    addRepo = function(repo) {
      var $item, $link;
      $item = $("<li>").addClass("repo grid-1 flyin " + (repo.language || "").toLowerCase());
      $link = $("<a>").attr("href", repoUrl(repo)).appendTo($item);
      $link.append($("<h2>").text(repo.name));
      $link.append($("<h3>").text(repo.language));
      $link.append($("<p>").text(repoDescription(repo)));
      return $item.appendTo("#untagged_groups");
    };
    addContributor = function(user, target) {
      var $image, $item, $link;
      $item = $("<li>");
      $link = $("<a>").attr('href', user.url).appendTo($item);
      $image = $("<img>").attr('src', user.avatar_url).attr({
        title: user.login,
        alt: user.login
      }).addClass('flyin').appendTo($link);
      return target.find('.contributors').append($item);
    };
    randomItem = function(array) {
      return array[Math.floor(Math.random() * array.length)];
    };
    flyzone = function() {
      var $flyzone;
      if (!$flyzone) {
        $flyzone = $("<div>").attr("id", "flyzone").prependTo(document.body);
      }
      return $flyzone;
    };
    randomOpacity = function(threshold) {
      var opacity;
      opacity = Math.random();
      while (opacity < threshold) {
        opacity = Math.random();
      }
      return opacity;
    };
    chooseHMFICType = function(type) {
      if (type === "cancel") return "dharmesh";
      return "cancel";
    };
    makeHMFIC = function(sizeName, speed) {
      var $img, left, size, top;
      size = sizeDimensions[sizeName];
      top = Math.floor((flyzone().height() - size) * Math.random());
      this.HMFIC = chooseHMFICType(this.HMFIC);
      $img = $("<img>").addClass("larry size-" + sizeName).attr("src", "assets/" + this.HMFIC + ".png").attr("width", size).attr("height", size).css({
        position: "absolute",
        opacity: randomOpacity(0.4),
        top: top,
        left: -size
      });
      $img.prependTo(flyzone());
      left = flyzone().width() + size;
      $img.animate({
        left: left
      }, speed, function() {
        $img.remove();
        return makeRandomHMFIC();
      });
      return $img;
    };
    makeRandomHMFIC = function() {
      var size, speed;
      size = randomItem(sizes);
      speed = Math.floor(Math.random() * 20000) + 15000;
      return makeHMFIC(size, speed);
    };
    repoUrls = {};
    repoDescriptions = {};
    repoGroups = [];
    buildingRepos = new $.Deferred();
    $.getJSON(apiUrl("orgs/HubSpot/repos"), function(result) {
      var groups, repos;
      repos = result;
      groups = {};
      console.log("Repos");
      console.log(repos);
      return $(function() {
        var group, name;
        $("#num_repos").text(repos.length);
        $.each(repos, function(i, repo) {
          var createdDelta, pushDelta, weekHalfLife, weightForPush, weightForWatchers, _base, _base2, _base3, _name;
          repo.pushed_at = new Date(repo.pushed_at);
          weekHalfLife = 1.146 * Math.pow(10, -9);
          pushDelta = (new Date) - Date.parse(repo.pushed_at);
          createdDelta = (new Date) - Date.parse(repo.created_at);
          weightForPush = 1;
          weightForWatchers = 1.314 * Math.pow(10, 7);
          repo.hotness = weightForPush * Math.pow(Math.E, -1 * weekHalfLife * pushDelta);
          repo.hotness += weightForWatchers * repo.watchers / createdDelta;
          repo.repoGroup = getRepoGroup(repo);
          if (groups[_name = repo.repoGroup] == null) groups[_name] = {};
          if ((_base = groups[repo.repoGroup])['name'] == null) {
            _base['name'] = repo.repoGroup;
          }
          if ((_base2 = groups[repo.repoGroup])['repos'] == null) {
            _base2['repos'] = [];
          }
          groups[repo.repoGroup]['repos'].push(repo);
          if ((_base3 = groups[repo.repoGroup])['hotness'] == null) {
            _base3['hotness'] = 0;
          }
          return groups[repo.repoGroup]['hotness'] += repo.hotness;
        });
        repos.sort(function(a, b) {
          if (a.hotness < b.hotness) return 1;
          if (b.hotness < a.hotness) return -1;
          return 0;
        });
        repos.sort(function(a, b) {
          if (a.pushed_at < b.pushed_at) return 1;
          if (b.pushed_at < a.pushed_at) return -1;
          return 0;
        });
        $.each(repos.slice(0, 3), function(i, repo) {
          return addRecentlyUpdatedRepo(repo);
        });
        repoGroups = (function() {
          var _results;
          _results = [];
          for (name in groups) {
            group = groups[name];
            _results.push(group);
          }
          return _results;
        })();
        repoGroups.sort(function(a, b) {
          if (a.hotness < b.hotness) return 1;
          if (b.hotness < a.hotness) return -1;
          return 0;
        });
        $.each(repoGroups, function(i, group) {
          if (group.name !== "other") {
            return addRepoGroup(group);
          } else {
            $('#homeless').fadeIn();
            return $.each(group.repos, function(i, repo) {
              return addRepo(repo);
            });
          }
        });
        return buildingRepos.resolve();
      });
    });
    $.getJSON(apiUrl("orgs/HubSpot/members"), function(result) {
      var members;
      members = result;
      console.log("Members");
      console.log(members);
      return $(function() {
        return $("#num_members").text(members.length);
      });
    });
    $.when(buildingRepos).then(function() {
      return $.each(repoGroups, function(i, group) {
        var $group, groupContributors;
        if (group.name === "other") return;
        $group = $(document.getElementById(group.name));
        groupContributors = {};
        console.log("Getting contributors for " + group.name);
        return $.each(group.repos, function(i, repo) {
          return $.getJSON(apiUrl("repos/HubSpot/" + repo.name + "/contributors"), function(result) {
            var contributors;
            contributors = result;
            console.log("Contributors to " + repo.name);
            console.log(contributors);
            return $(function() {
              return $.each(contributors, function(i, contributor) {
                if (!(groupContributors[contributor.login] != null)) {
                  setTimeout(function() {
                    return addContributor(contributor, $group);
                  }, i * 80);
                  return groupContributors[contributor.login] = true;
                }
              });
            });
          });
        });
      });
    });
    $flyzone = null;
    sizes = ["smaller", "small", "medium", "large", "fat"];
    sizeDimensions = {
      smaller: 50,
      small: 80,
      medium: 130,
      large: 200,
      fat: 300
    };
    $(function() {
      return $("#logo").click(function() {
        return makeRandomHMFIC();
      });
    });
    match = /\blarry(=(\d+))?\b/i.exec(window.location.search);
    if (match) {
      n = parseInt(match[2]) || 20;
      return $(function() {
        var i, _results;
        i = 0;
        _results = [];
        while (i < n) {
          setTimeout(makeRandomHMFIC, Math.random() * n * 500);
          _results.push(++i);
        }
        return _results;
      });
    }
  })(jQuery);

}).call(this);
