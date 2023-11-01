var app = angular.module("members", ['webicon']);

app.directive("navbar", function() {
  return {
    restrict: "E",
    templateUrl: "templates/navbar.html"
  }
});

app.filter("sortDate", function(){
  return function(obj) {
    const items = [];

    const now = new Date();

    const today = now.getDay();
    // NOTE: assumes meetings are always during PM. Subtract 12 hours. 
    const currentTime = now.getHours() * 60 + now.getMinutes() - 12 * 60;
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    angular.forEach(obj, function(val, _) {
      let relativeDay = days.indexOf(val.day) - today % 7;

      const timeParts = val.time.split(":");
      let relativeTime = Number(timeParts[0]) * 60 + Number(timeParts[1]) - currentTime;

      let beginTime = "Beginning Soon (tm)";

      // We don't move meetings that are still going on.
      const shiftDate = (relativeTime < -val.lengthMinutes && relativeDay == 0) 
                        || (relativeTime < 0 && relativeDay > 0)
      if (shiftDate) {
        relativeTime += 1440;
        relativeDay--;
      }
      if (relativeDay < 0) {
        relativeDay = relativeDay + 5 + today;
      }

      if (relativeDay > 0) {
        const daysUntil = Math.round(relativeDay + relativeTime / 1440)
        if (daysUntil == 1) {
          beginTime = "Tomorrow";
        } else {
          beginTime = `In ${daysUntil} Days`;
        }
      } else if (relativeTime > 60) {
        beginTime = `In ${Math.round(relativeTime / 60)} Hour${relativeTime >= 90 ? "s" : ""}`;
      } else if (relativeTime > 5) {
        beginTime = `In ${Math.round(relativeTime)} Minutes`;
      } else {
        // Meeting time is less than 5, and may be negative. 
        // That means the meeting is going on right now. 
        beginTime = "RIGHT NOW!"
      }

      val.relaTime = relativeTime;
      val.relaDay = relativeDay;
      val.beginTime = beginTime;
      items.push(val);

    });
    items.sort(function(a,b){
      if (a.relaDay === b.relaDay) {
        return a.relaTime - b.relaTime;
      }
      return a.relaDay - b.relaDay;
    })
    return items;
  };
});

app.directive("side", function() {
  return {
    restrict: "E",
    templateUrl: "templates/side.html",
    scope: {
      meetings: "=data"
    }
  };
});

app.controller("MembersController", ['$scope', '$http', function($scope, $http) {

  // Toggle showing the icons
  $scope.saveIconSetting = function() {
    window.localStorage.setItem("showIcons", $scope.showIcons);
  };

  // Get the meeting times
  $scope.meetings = [];
  $http.get("./data/meetings.json").success(function (response) {
    $scope.meetings = response;
  }).error(function (error) {
    console.error("Error getting meetings.json");
  });

  // Get all the links
  $scope.sections = [];
  $scope.popular = [];
  $http.get("./data/links.json").success(function (response) {
    $scope.sections = response;
    // Find the popular links
    for (var i = 0; i < $scope.sections.length; i++) {
      var section = $scope.sections[i]; 
      for (var j = 0; j < section.links.length; j++ ) {
        if (section.links[j].hasOwnProperty("popular")) {
          $scope.popular.push(section.links[j]);
        }
      }
    }
    if ($scope.popular.length === 0) $scope.popular = false;
  }).error(function (error) {
    console.error("Error getting links.json");
  });

  // Show/hide icons
  $scope.showIcons = true;
  if (window.localStorage) {
    var showIcons = window.localStorage.getItem("showIcons");
    if (showIcons === "false") {
      $scope.showIcons = false;
    }
    else if (showIcons === "true") {
      $scope.showIcons = true;
    }
    else {
      $scope.showIcons = true;
      $scope.saveIconSetting();
    }
  }

  //Get sso info
  $scope.name = "";
  $scope.profile = "";
  var imgStr = "https://profiles.csh.rit.edu/image/"
  $http.get("https://members.csh.rit.edu/sso/redirect?info=json").success(function (response) {
    $scope.profile = imgStr.concat(response.id_token.preferred_username);
    $scope.name = response.id_token.preferred_username;//response.userinfo.given_name + " " + response.userinfo.family_name;
  }).error(function (error) { 
    console.error("Error getting sso");
    $scope.profile = imgStr.concat("test");
    $scope.name = "Test";
  });
}]);
