
/* Module for QR Code Tab controllers */
angular.module('qr-code-controllers', [])

    /* QrCode View Controller */
    .controller('QRCodeViewCtrl', function($scope,$state,$window, Facebook, MuseumObjects, MatchHunt, $location, $ionicPopup, AppNavigationTitles)
    {
        /* Match hunt isn't available for everyone */
        $scope.matchHuntAvailable = false;

        /* Get the labels */
        $scope.navigationTitles = AppNavigationTitles.get();

        /* Play match hunt button */
        $scope.playMatchHunt = function()
        {
            /* If is logged in Open Match Hunt */
            Facebook.isLoggedIn()
                .then(function(user)
                {


                    if(user.connected)
                    {

                        console.log("Getting UserID");
                        var userID = Facebook.getUserID();
                        console.log(userID);

                        console.log("Retrieving Authorization");
                        var authToken = Facebook.getAPIToken();

                        //$window.localStorage.setItem('userID', user.userID);
                        MatchHunt.generateGame(authToken)
                            .then(function(response)
                            {
                                //console.log("Generated the Game");
                                console.log(response);
                                //if(response)
                                //    $state.go('tab.tab-match-hunt');
                            },

                            function(err)
                            {
                                console.log("MATCH HUNT ERR");
                                console.log(err);
                            }
                        );
                    }
                    else{

                        //TODO: Show a popup asking the user to login

                        Facebook.showLoginPopup();
                    }
                });

        };

        /* Open the scanner when the user wants to scan a qr code */
        $scope.openScanner = function()
        {
            var scanner = cordova.require("cordova/plugin/BarcodeScanner");

            scanner.scan( function (scan) {
                console.log(scan);

                var qrCodeText = scan.text;

                if(!isNaN(qrCodeText) && !(scan.cancelled))
                {

                    /* Load Object */

                    MuseumObjects.getById(qrCodeText)
                        .then(function(object)
                        {
                            MuseumObjects.setActiveObject(object);
                            //Change state
                            $state.go('tab.scanner-object');

                        },
                        function(response)
                        {
                            console.log(response);
                        }
                    );
                }

                else if(!(scan.cancelled)) {

                    $ionicPopup.alert({
                        title: $scope.navigationTitles.scanner.invalidQRCodeLabel
                    });

                }

            }, function (error) {

            } );

        };


    })

    /* Open the math hunt game */
    .controller('MatchHuntCtrl', function($scope,$state, Facebook,$ionicPopup, MatchHunt)
    {


        /* Calls the Match Hunt service for a match hunt game */
        $scope.matchHunt = MatchHunt.activeGame;

        console.log($scope.matchHunt);

        $scope.skip = function()
        {
            /* Get a new match hunt */
            MatchHunt.skip().then(function(res){

                if(res)
                    $scope.loadNewMatchHuntGame();

            }, function(err){console.log(err)})

        };

        /* Open qr code scanner */
        $scope.takeAGuess = function()
        {
            /* Open Bar Code Scanner */
            var scanner = cordova.require("cordova/plugin/BarcodeScanner");

            scanner.scan( function (scan) {

                console.log(scan);

                if(!isNaN(scan.text) && !(scan.cancelled)) {

                    if(!scan.cancelled) {

                        Facebook.isLoggedIn()
                            .then(function (user) {


                                if (user.connected) {

                                    console.log("Getting UserID");
                                    var userID = Facebook.getUserID();
                                    console.log(userID);

                                    console.log("Retrieving Authorization");
                                    var authToken = Facebook.getAPIToken();


                                    //TODO: IF we use some parsing or not
                                    MatchHunt.guess( authToken,userID,  scan.text)
                                        .then(function (game) {

                                            var status = game.status;
                                            console.log("PARSING GAME");
                                            console.log(game);
                                            if (status == 'won') {
                                                var okButton = {
                                                    text: $scope.navigationTitles.scanner.playAgainLabel,
                                                    type: 'button-positive',
                                                    onTap: $scope.loadNewMatchHuntGame

                                                };

                                                var cancelButton = {
                                                    text: $scope.navigationTitles.scanner.quitLabel,
                                                    onTap: function () {
                                                        $state.go('tab.tab-qrcode-scanner');
                                                    }
                                                };

                                                var wonPopup = $ionicPopup.show(
                                                    {
                                                        title: $scope.navigationTitles.scanner.youWonLabel,
                                                        subTitle: $scope.navigationTitles.scanner.pointsReceivedLabel + $scope.matchHunt.pointsValue,
                                                        buttons: [
                                                            cancelButton, okButton
                                                        ]
                                                    }
                                                );

                                                wonPopup.then(function (res) {
                                                    console.log("Doing something");
                                                });
                                            }

                                            else if (status == 'lost') {
                                                var okButton = {
                                                    text: $scope.navigationTitles.scanner.playAgainLabel,
                                                    type: 'button-positive',
                                                    onTap: $scope.loadNewMatchHuntGame

                                                };

                                                var cancelButton = {
                                                    text: $scope.navigationTitles.scanner.quitLabel,
                                                    onTap: function () {
                                                        $state.go('tab.tab-qrcode-scanner');
                                                    }
                                                };

                                                var losePopup = $ionicPopup.show(
                                                    {
                                                        title: $scope.navigationTitles.scanner.youLoseLabel,
                                                        subTitle: $scope.navigationTitles.scanner.youLoseBodyLabel,
                                                        buttons: [
                                                            cancelButton, okButton
                                                        ]
                                                    }
                                                );

                                                losePopup.then(function (res) {
                                                    console.log("Doing something");
                                                });
                                            }

                                            else if (status == 'incorrect') {
                                                //TODO: Show a popup dialog saying you failed
                                                var alertFail = $ionicPopup.alert(
                                                    {
                                                        title: $scope.navigationTitles.scanner.failGuessLabel,
                                                        template: $scope.navigationTitles.scanner.livesLeftLabel + (3 - game.attempts) + "<br>"

                                                    }
                                                );

                                                alertFail.then(function (res) {
                                                    console.log("Guess Fail Alert Acknowledged");
                                                });
                                            }


                                        }, function(err){console.log(err);});
                                }


                                else {

                                    //TODO: Show a popup asking the user to login

                                    Facebook.showLoginPopup();
                                }
                            });


                    }
                }
                else if(!(scan.cancelled)) {

                    $ionicPopup.alert({
                        title: $scope.navigationTitles.scanner.invalidQRCodeLabel
                    });

                }

            }, function (error) {
                console.log("Scanning failed: ", error);
            } );
        };


        $scope.loadNewMatchHuntGame = function()
        {

            Facebook.isLoggedIn()
                .then(function(user)
                {


                    if(user.connected)
                    {

                        console.log("Getting UserID");
                        var userID = Facebook.getUserID();
                        console.log(userID);

                        console.log("Retrieving Authorization");
                        var authToken = Facebook.getAPIToken();

                        //$window.localStorage.setItem('userID', user.userID);
                        MatchHunt.generateGame( authToken)
                            .then(function(matchHunt)
                            {
                                $scope.matchHunt = matchHunt;

                            },

                            function(err)
                            {
                                console.log("MATCH HUNT ERR");
                                console.log(err);
                            }
                        );
                    }
                    else{

                        //TODO: Show a popup asking the user to login

                        Facebook.showLoginPopup();
                    }
                });
        }

    })

    ///* Match Hunt game */
    .factory('MatchHunt',function(Routes, $http, $q, $window){


        var MatchHunt = {};

        MatchHunt.activeGame = {};

        MatchHunt.getId = function(){
            return $window.localStorage.getItem('MusAMatchHuntId');
        };
        MatchHunt.setId = function(id){
            $window.localStorage.setItem('MusAMatchHuntId', id);
        };

        MatchHunt.reset = function(){
            MatchHunt.activeGame = {};
            $window.localStorage.removeItem('MusAMatchHuntId');
            $window.localStorage.removeItem('matchHuntDisplacements');
        };


        MatchHunt.generateGame = function(authToken)
        {

            console.log("Checking if there is a current match hunt id stored");
            var id = this.getId();

            console.log("Current MatchHunt Id: ");
            console.log(id);

            if(!id)
            {
                console.log("No ID Found, Resetting to 0");
                id = 0;
            }

            var request = {

                url: Routes.MATCH_HUNT + id,
                method: 'GET',
                headers:  {

                    'Authorization': 'Bearer ' + authToken
                }
            };

            console.log("Retrieve Match Hunt Request");
            console.log(request);

            return $http(request).then(
                /* 200 Response */
                function(response)
                {
                    var defer = $q.defer();
                    console.log(response);
                    if(response.status == 200)
                    {
                        /* Store the game */
                        var _matchHunt = response.data;

                        if(_matchHunt.Matches.length > 0)
                        {
                            _matchHunt.attempts = _matchHunt.Matches[0].attempts;

                        }
                        else{
                            _matchHunt.attempts = 0;

                        }

                        /* Generate the random displacements */

                        console.log("Printout the retrieved game");
                        console.log(_matchHunt);
                        MatchHunt.setId(_matchHunt.id);
                        MatchHunt.activeGame = _matchHunt;

                        MatchHunt.generateRandomDisplacements(_matchHunt)
                            .then(
                            function(displacements)
                            {
                                if(displacements)
                                {
                                    console.log("Valid game");
                                    MatchHunt.activeGame.displacements = displacements;
                                    console.log(MatchHunt);
                                }

                                return displacements;

                            },
                            function(err)
                            {
                                console.log("Couldn't calcualte the displacements");
                            }
                        )
                    }

                },
                function(response)
                {

                    console.log("Failed to get Match Hunt Game");
                    console.log("Response Status: " + response.status);
                    console.log("Data: " + response.data);
                    $q.reject(null)
                }


            );
        };

        MatchHunt.generateRandomDisplacements = function(matchHunt)
        {


            var defer = $q.defer();

            var img = new Image();
            img.src = matchHunt.image;
            img.onload = function()
            {
                var _displacements = $window.localStorage.getItem('matchHuntDisplacements');

                var displacements = null;
                if(!_displacements) {

                    console.log("Creating new displacements");

                    var imgWidth = img.width;
                    var imgHeight = img.height;

                    var windowWidth = 250;
                    var windowHeight = 250;

                    console.log(imgWidth);
                    console.log(imgHeight);
                    var X = 0;
                    var Y = 0;
                    if (imgWidth > windowWidth && imgHeight > windowHeight) {
                        /* Generate random displacement */

                        /* X has to be a number such that X + windowWidth < imgWidth */
                        X = -1 * Math.floor((Math.random() * (imgWidth - windowWidth )));

                        /* Y has to be a number such that Y + windowHeight < imgHeight */
                        Y = -1 * Math.floor((Math.random() * (imgHeight - windowHeight)));

                    }

                    console.log(X);
                    console.log(Y);


                    /* Store displacements */
                    $window.localStorage.setItem('matchHuntDisplacements', JSON.stringify(displacements));

                    displacements = {
                        x: X,
                        y: Y
                    };
                }

                else {

                    console.log("using previous displacements");

                    var _parseDisplacements = JSON.parse(_displacements);

                    console.log(_parseDisplacements);

                    displacements = _parseDisplacements;


                }

                console.log(displacements);
                defer.resolve(displacements);
            };


            return defer.promise;

        };

        MatchHunt.guess = function(authToken, userID, qrcodeData)
        {


            //var clueID = MatchHunt.getId();

            var matchHuntId = MatchHunt.getId();

                        var request = {

                            url: Routes.GUESS,
                            method: 'POST',
                            headers:
                            {
                                'Authorization': 'Bearer ' + authToken
                            },
                            data: {
                                UserId: userID,
                                qrcode: qrcodeData,
                                ClueId: matchHuntId
                            }
                        };

                    console.log(request);
            return $http(request)
                .then(
                function(response)
                {
                    console.log("Receiving success from Guess");

                    console.log(response);

                        var gameStatus = response.data;

                        console.log("Game Status");
                        console.log(response.data);

                        MatchHunt.activeGame.attempts = gameStatus.attempts;

                        /* User has won */
                        if(gameStatus.correct)
                        {
                            console.log("Game Won");
                            MatchHunt.reset();
                            gameStatus.status = "won";
                        }

                        else if(!gameStatus.correct && gameStatus.attempts == 3)
                        {
                            console.log("Game Lost");
                            MatchHunt.reset();
                            gameStatus.status = "lost";
                        }

                        else{
                            console.log("Incorrect Guess!");
                            gameStatus.status = "incorrect";
                        }

                        return gameStatus;





                },
                function(response)
                {
                    console.log("FAILED TO PUT IN A GUESS REQUEST");
                    console.log("Stat: " + response.status);
                    console.log("Data: " + response.data);
                }
            )


        };


        MatchHunt.skip = function(authToken)
        {
            var id = MatchHunt.getId();

            var request = {

                url: Routes.MATCH_HUNT + id,
                method: 'PUT',
                headers:  {

                    'Authorization': 'Bearer ' + authToken
                }
            };

            return $http(request)
                .then(
                        function(response)
                        {

                            if(response.status)
                            {
                                if(response.data)
                                {
                                    MatchHunt.reset();
                                    return response;
                                }
                            }
                        },

                        function(response)
                        {
                            return $q.reject('Failed to SKIP game due to status: ' + response.status + '\nError: ' + response.data);
                        }
                    )


        }

        return MatchHunt;


    });