/**
 * Created by joframart on 4/3/15.
 */

angular.module('user-preferences-controllers', [])

.controller('UserPreferencesCtrl', function($scope, AppNavigationTitles, Facebook, UserPreferences, $ionicModal)
{
    $scope.navigationTitles = AppNavigationTitles.get();
    $scope.preferences = UserPreferences.get();


    $scope.user = Facebook.getUser();

    $scope.openModal = function(template) {

        $ionicModal.fromTemplateUrl(template, {
            scope: $scope,
            animation: 'slide-in-right'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();

        });
    };


    $scope.showLanguages = function()
    {
        $scope.openModal('language-modal.html')

    };



    $scope.closeModal = function() {
        $scope.modal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
        // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
        // Execute action
    });

    $scope.$on('preferences:updated', function(event, data){
        $scope.navigationTitles = AppNavigationTitles.get();
    });

    $scope.changeLanguage = function(language)
    {
        UserPreferences.setLanguage(language);
        //$scope.navigationTitles = AppNavigationTitles.get();
        $scope.modal.hide();

    }

    $scope.loadAboutPage = function()
    {
        $scope.text = UserPreferences.getAbout();
        console.log($scope.text);
        $scope.openModal('text-view.html');
    }

    $scope.loadTermsPage = function(){

        $scope.text = UserPreferences.getTerms();
        $scope.openModal('text-view.html');
    }

    $scope.closePage = function()
    {
        $scope.closeModal();
    }

    $scope.login = function()
    {
        console.log("LOGIN")
        Facebook.login();

        $scope.user = Facebook.getUser();
    };

    $scope.logout = function()
    {
        console.log('log out');
        Facebook.logout();
    };

    //$scope.isLoggedIn = function()
    //{
    //    console.log(Facebook.isLoggedIn());
    //    return Facebook.isLoggedIn();
    //};
    //$scope.loggedIn = false;

    $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams)
    {
        /* Check if Logged in */
        //$scope.user = Facebook.getUser();

console.log(toState);

        if(toState.name== 'tab.tab-user') {
            $scope.user = Facebook.getUser();


            console.log("Loading USER");
            Facebook.isLoggedIn();
            //
            if ($scope.user.loginStatus) {
                Facebook.getUserInfo();
            }

            console.log($scope.user.loginStatus);

        }
        //$scope.loggedIn = true;
        //Facebook.getUserInfo();

    })

})

    .controller('FeedbackFormCtrl', function($scope, AppNavigationTitles,$ionicPopup, $ionicLoading)
    {
        console.log("Feedback");
        $scope.navigationTitles = AppNavigationTitles.get();

        $scope.feedback = {};
        $scope.feedback.messageTitle = '';
        $scope.feedback.problem = 'general';
        $scope.feedback.messageContent = '';

        $scope.sendFeedback = function()
        {
            console.log($scope.feedback.messageTitle);

            if( $scope.feedback.messageTitle == '' || $scope.feedback.messageContent == '')
            {
                var alertPopup = $ionicPopup.alert({
                    title: $scope.navigationTitles.user.feedbackForm.popUpTitleMissingLabel
                    //template: $scope.navigationTitles.user.feedbackForm.popUpMessageSuccessLabel
                });
                alertPopup.then(function(res) {
                    console.log('Done');
                });
            }

            else {

                var alertPopup = $ionicPopup.alert({
                    title: $scope.navigationTitles.user.feedbackForm.popUpTitleSuccessLabel,
                    template: $scope.navigationTitles.user.feedbackForm.popUpMessageSuccessLabel
                });
                alertPopup.then(function (res) {
                    console.log('Done');
                });
            }
        }



    });