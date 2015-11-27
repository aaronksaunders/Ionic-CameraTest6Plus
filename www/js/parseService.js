/**
 * Created by aaronksaunders on 11/27/15.
 */
angular.module('ParsePhotoService', [])

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
