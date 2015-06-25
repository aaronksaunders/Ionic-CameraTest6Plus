// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic'])

    .run(function ($ionicPlatform) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    })

    .config(function ($compileProvider) {
        //    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|content|file|assets-library):/);
    })

    .controller('MainCtrl', function ($scope, Camera) {

        $scope.savePhoto = function () {
            Camera.resizeImage($scope.lastPhoto).then(function (_result) {
                $scope.thumb = "data:image/jpeg;base64," + _result.imageData;

                return Camera.toBase64Image($scope.lastPhoto);
            }).then(function (_convertedBase64) {
                console.log("convert base image ");
            }, function (_error) {
                console.log(_error);
            });
        };

        $scope.___savePhoto = function () {
            Camera.toBase64Image($scope.lastPhoto).then(function (_result) {
                console.log("convert base image ");
            }, function (_error) {
                console.log(_error);
            });
        };

        $scope.getPhoto = function () {
            var options = {
                'buttonLabels': ['Take Picture'],
                'addCancelButtonWithLabel': 'Cancel'
            };
            window.plugins.actionsheet.show(options, callback);
        };

        function callback(buttonIndex) {
            console.log(buttonIndex);
            if (buttonIndex === 1) {

                var picOptions = {
                    destinationType: navigator.camera.DestinationType.FILE_URI,
                    quality: 75,
                    targetWidth: 500,
                    targetHeight: 500,
                    allowEdit: true,
                    saveToPhotoAlbum: false
                };


                Camera.getPicture(picOptions).then(function (imageURI) {
                    console.log(imageURI);
                    $scope.lastPhoto = imageURI;
                    $scope.newPhoto = true;

                }, function (err) {
                    console.log(err);
                    $scope.newPhoto = false;
                    alert(err);
                });
            }

        };

    })

    .factory('Camera', ['$q', function ($q) {

        return {
            /**
             *
             * @param options
             * @returns {*}
             */
            getPicture: function (options) {
                var q = $q.defer();

                navigator.camera.getPicture(function (result) {
                    // Do any magic you need
                    q.resolve(result);
                }, function (err) {
                    q.reject(err);
                }, options);

                return q.promise;
            },
            /**
             *
             * @param img_path
             * @returns {*}
             */
            resizeImage: function (img_path) {
                var q = $q.defer();
                window.imageResizer.resizeImage(function (success_resp) {
                    console.log('success, img re-size: ' + JSON.stringify(success_resp));
                    q.resolve(success_resp);
                }, function (fail_resp) {
                    console.log('fail, img re-size: ' + JSON.stringify(fail_resp));
                    q.reject(fail_resp);
                }, img_path, 200, 0, {
                    imageDataType: ImageResizer.IMAGE_DATA_TYPE_URL,
                    resizeType: ImageResizer.RESIZE_TYPE_MIN_PIXEL,
                    pixelDensity: true,
                    storeImage: false,
                    photoAlbum: false,
                    format: 'jpg'
                });

                return q.promise;
            },

            toBase64Image: function (img_path) {
                var q = $q.defer();
                window.imageResizer.resizeImage(function (success_resp) {
                    console.log('success, img toBase64Image: ' + JSON.stringify(success_resp));
                    q.resolve(success_resp);
                }, function (fail_resp) {
                    console.log('fail, img toBase64Image: ' + JSON.stringify(fail_resp));
                    q.reject(fail_resp);
                }, img_path, 1, 1, {
                    imageDataType: ImageResizer.IMAGE_DATA_TYPE_URL,
                    resizeType: ImageResizer.RESIZE_TYPE_FACTOR,
                    format: 'jpg'
                });

                return q.promise;
            }
        }
    }]);