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
    const result = [];
    const today = new Date().getDay()
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
    angular.forEach(obj, function(val, key) {
      let relative = days.indexOf(val.day) - today % 7
      if (relative < 0) {
        relative = relative + 5 + today
      }
      val.relaDay = relative // day relative to today for sorting
      items.push(val);

    });

    items.sort(function(a,b){
      console.log(a.name + " " + a.day + " " + a.relaDay.toString())
      if (a.relaDay === b.relaDay) {
        if (a.time < b.time) {
          return -1
        } else {
          return 1
        }
      }

      if (a.relaDay < b.relaDay) {
        return -1
      } else {
        return 1
      }

      return 0
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
