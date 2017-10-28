var app = angular.module("members", ['webicon']);

app.directive("navbar", function() {
  return {
    restrict: "E",
    templateUrl: "templates/navbar.html"
  }
});

app.directive("meetings", function() {
  return {
    restrict: "E",
    templateUrl: "templates/meetings.html",
    scope: {
      meetings: "=data"
    }
  };
});

app.directive("quote", function() {
    return {
        restrict: "E",
        templateUrl: "templates/quote.html",
        scope: {
            quote: "=data"
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

  // Get the quotes
    $scope.quote = [];
    $http.get("./data/config.json").success(function (response) {
        $http.get("http://localhost:3000/" + response['quotefaultAPI'] + "/random").success(function (response) {
            $scope.quote = response;
        }).error(function (error) {
            console.error("Error getting quote from API");
        });
    }).error(function (error) {
        console.error("Error getting config.json");
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

}]);
