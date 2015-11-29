/**
 * Created by aaronksaunders on 11/27/15.
 */
angular.module('ParsePhotoService', [])
    //
    // Photo Upload Service implemented using the REST API instead of the javascript
    // library. This was added for completeness since some of the other documentation
    // I have provided is based on the REST API
    //
    .service('ParseRESTPhotoService', ['$http', 'ParseConfiguration',


        function ($http, ParseConfiguration) {

            var PARSE__HEADER_CREDENTIALS = {
                "x-parse-application-id": ParseConfiguration.applicationId,
                "x-parse-rest-api-key": ParseConfiguration.restAPIKey
            };

            var baseURL = "https://api.parse.com/1/";
            var authenticationHeaders = PARSE__HEADER_CREDENTIALS;

            return {
                loginDefaultUser: function (_user, _password) {
                    var settings = {
                        headers: authenticationHeaders,
                        // params are for query string parameters
                        params: {
                            "username": _user,
                            "password": _password
                        }
                    };

                    // $http returns a promise, which has a then function,
                    // which also returns a promise
                    return $http.get(baseURL + 'login', settings)
                        .then(function (response) {
                            // In the response resp.data contains the result
                            // check the console to see all of the data returned
                            console.log('login', response);
                            return response.data;
                        });
                },
                savePhotoToParse: function (_params) {

                    // for POST, we only need to set the authentication header
                    var settings = {
                        headers: authenticationHeaders
                    };
                    // for POST, we need to specify data to add, AND convert it to
                    // a string before passing it in as separate parameter data
                    var dataObject = {base64: _params.photo};

                    // $http returns a promise, which has a then function
                    return $http.post(baseURL + 'files/mypic.jpeg', dataObject, settings)
                        .then(function (response) {
                            // In the response resp.data contains the result
                            // check the console to see all of the data returned
                            console.log('savePhotoToParse', response);

                            // now save to ImageObject Class
                            return $http.post(baseURL + 'classes/ImageInfo', {
                                caption: _params.caption,
                                picture: {
                                    "name": response.data.name,
                                    "__type": "File"
                                }
                            }, settings);
                        }).then(function (_imageInfoResp) {
                            console.log(_imageInfoResp);
                            return _imageInfoResp.data;
                        }, function (_error) {
                            console.log("Error: ", _error);
                        });
                }
            }
        }])
    //
    // Photo Upload Service implemented using the Parse Javascript library.
    //
    .service('ParsePhotoService', ['$q', 'ParseConfiguration',
        function ($q, ParseConfiguration) {

            // initialize Parse
            Parse.initialize(ParseConfiguration.applicationId, ParseConfiguration.javascriptKey);

            // login with default account for testing
            return {
                loginDefaultUser: function (_user, _password) {
                    return Parse.User.logIn(_user, _password);
                },
                /**
                 *
                 * @param _params.photo base64 representation of photo
                 * @param _params.caption string to go with photo
                 * @returns {*}
                 */
                savePhotoToParse: function (_params) {
                    var ImageObject = Parse.Object.extend("ImageInfo");

                    // create the parse file object using base64 representation of photo
                    var imageFile = new Parse.File("mypic.jpg", {base64: _params.photo});


                    // save the parse file object
                    return imageFile.save().then(function () {

                        _params.photo = null;

                        // create object to hold caption and file reference
                        var imageObject = new ImageObject();

                        // set object properties
                        imageObject.set("caption", _params.caption);
                        imageObject.set("picture", imageFile);

                        // save object to parse backend
                        return imageObject.save();

                    }, function (error) {
                        alert("Error " + JSON.stringify(error, null, 2));
                        console.log(error);
                    });

                }
            }
        }]);
