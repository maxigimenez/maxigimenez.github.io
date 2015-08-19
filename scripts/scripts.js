'use strict';

angular
    .module('me', [
        'ui.router'
    ])
    .config(function($urlRouterProvider){
        $urlRouterProvider
            .otherwise('/');
    });

'use strict';

angular
    .module('me')
    .config(function($stateProvider){

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'screens/home/views/home.html',
                controller: 'HomeController',
                resolve: {
                    skills: function($http){
                        return $http({
                            method: 'GET',
                            url: '/static/data/skills.json'
                        }).then(function(response){
                            return response.data;
                        });
                    },
                    experience: function($http){
                        return $http({
                            method: 'GET',
                            url: '/static/data/experience.json'
                        }).then(function(response){
                            return response.data;
                        });
                    },
                    photos: function($http, $window, $q){
                        //@TODO REFACTOR!
                        var url = 'https://api.instagram.com/v1/users/1319950/media/recent';
                        url += '?access_token=1319950.1677ed0.c70a1925f10d4ab082bea2e30d74b821';
                        url += '&count=6&callback=callbackInstagram';
                        $http.jsonp(url);
                        var deferred = $q.defer();
                        $window.callbackInstagram = function(response){
                            deferred.resolve(response.data);
                        };
                        return deferred.promise;
                    },
                    projects: function($http){
                        return $http({
                            method: 'GET',
                            url: '/static/data/projects.json'
                        }).then(function(response){
                            return response.data;
                        });
                    }
                }
            })

    });

'use strict';

angular
    .module('me')
    .controller('HomeController', function($scope, skills, experience, photos, $window, projects){

        $scope.skills = [{
            title: 'this.skills(\'frontend\');',
            data: _.filter(skills, {
                category: 'frontend'
            })
        },{
            title: 'this.skills(\'backend\');',
            data: _.filter(skills, {
                category: 'backend'
            })
        },{
            title: 'this.skills(\'more\');',
            data: _.filter(skills, {
                category: 'others'
            })
        }];

        $scope.experience = experience;

        $scope.photos = photos;

        $scope.goTo = function(url){
            $window.open(url);
        };

        $scope.projects = projects;

    });



angular
    .module('me')
    .directive('skills', function(){

        return {
            restrict: 'EA',
            scope: {
                data: '=',
                id: '@',
                label: '@'
            },
            controller: function($scope){

                $scope.getRandom = function(l, u){
                    return Math.floor((Math.random()*(u-l+1))+l);
                };

                var chart = Raphael($scope.id, 440, 440); //Should be responsive
                var radius = 33;
                var speed = 250;

                chart
                    .circle(220, 220, 45)
                    .attr({
                        stroke: 'none'
                    });

                var title = chart.text(220, 220, $scope.label).attr({
                    font: '16px Open Sans',
                    fill: '#262F39'
                }).toFront();

                chart.customAttributes.arc = function (value, color, rad) {
                    var v = 3.6 * value,
                        alpha = v == 360 ? 359.99 : v,
                        random = $scope.getRandom(91, 240),
                        a = (random-alpha) * Math.PI/180,
                        b = random * Math.PI/180,
                        sx = 220 + rad * Math.cos(b),
                        sy = 220 - rad * Math.sin(b),
                        x = 220 + rad * Math.cos(a),
                        y = 220 - rad * Math.sin(a),
                        path = [['M', sx, sy], ['A', rad, rad, 0, +(alpha > 180), 1, x, y]];
                    return { path: path, stroke: color }
                };


                angular.forEach($scope.data, function(e){
                    radius += 22;
                    var z = chart
                        .path()
                        .attr({
                            arc: [e.percent, e.color, radius],
                            'stroke-width': 20
                        });

                    z.mouseover(function(){
                        this
                            .animate({ 'stroke-width': 30, opacity: .75 }, 1000, 'elastic');

                        if(Raphael.type != 'VML') { //solves IE problem
                            this.toFront();
                        }

                        title.stop().animate({ opacity: 0 }, speed, '>', function(){
                            this.attr({ text: e.name + '\n' + e.percent + '%' }).animate({ opacity: 1 }, speed, '<');
                        });
                    }).mouseout(function(){
                        this.stop().animate({ 'stroke-width': 20, opacity: 1 }, speed*4, 'elastic');
                        title.stop().animate({ opacity: 0 }, speed, '>', function(){
                            title.attr({ text: $scope.label }).animate({ opacity: 1 }, speed, '<');
                        });
                    });
                });
            }
        }

    });

'use strict';

angular
    .module('me')
    .directive('meTooltip', function(){

        return {
            restrict: 'EA',
            link: function($scope, element){
                $(element)
                    .tooltip();
            }
        }

    });
