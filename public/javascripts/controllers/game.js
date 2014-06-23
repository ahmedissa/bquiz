'use strict';
angular.module('bqApp')
  .controller('GameCtrl', function ($scope,Socket,$timeout,$location) {
    var game;
    $scope.isDisable = false;
    $scope.loading = true;
    Socket.emit('game:new','');


    var nextquestion = function  (data) {

        if (data == "finish") {
              $scope.correctid = game.questions[9].solution;

              game = undefined;

              $timeout(function () {
                $scope.isDisable = false;
                $scope.correctid = undefined;
                $location.path('/account');

              }, 1700); 
              return;
        }


        game = data;
        $scope.correctid = game.questions[game.postion-1].solution;

        var changedata = function() {
            $scope.myStyle = {"width": game.postion+1+"0%"};
            $scope.progress = game.postion+1+"/10";
            $scope.answers  = game.questions[game.postion].answers;
            $scope.img = game.questions[game.postion].image;
            $scope.correctid = undefined;
            $scope.isDisable = false;
        }    

        $timeout(changedata, 2000); 



    };




  	Socket.on('game:new', function (data) {
      $scope.loading = false;
      game = data;
      $scope.myStyle = {"width": data.postion+1+"0%"};
      $scope.progress = data.postion+1+"/10";
      $scope.answers  = data.questions[data.postion].answers;
      $scope.img = data.questions[data.postion].image;

  	});


    $scope.quit = function (){

      Socket.emit('game:end','');
      $location.path('/account');
    };

    $scope.sendanswer  = function (answer){
      if (!$scope.isDisable) {
        Socket.emit('game:answer',answer,nextquestion);
        $scope.isDisable = true;
      };
      
    };


  });