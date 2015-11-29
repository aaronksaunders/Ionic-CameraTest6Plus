[![Book session on Codementor](https://cdn.codementor.io/badges/book_session_github.svg)](https://www.codementor.io/aaronksaunders)

# Ionic-CameraTest iPhone6 Plus

See blog post on project for additional information
http://www.clearlyinnovative.com/ionic-framework-camera-image-uploads-and-base64-strings/

-
###Getting Started

Install everything by using the command `ionic state restore` you should see something like the content below

```Console
IMac27Quad:Ionic-CameraTest6Plus aaronksaunders$ ionic state restore
Attempting to restore your Ionic application from package.json

Restoring Platforms

cordova platform add ios

Restore platforms is complete

Restoring Plugins

cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-console
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-splashscreen
cordova plugin add com.ionic.keyboard
cordova plugin add cordova-plugin-camera
cordova plugin add https://github.com/EddyVerbruggen/cordova-plugin-actionsheet 
cordova plugin add https://github.com/timkalinowski/PhoneGap-Image-Resizer 
cordova plugin add cordova-plugin-file
Restore plugins is complete

Ionic state restore completed

IMac27Quad:Ionic-CameraTest6Plus aaronksaunders$ 

```

If you see this error
```Console
Plugin doesn't support this project's cordova-android version. cordova-android: 4.1.1, failed version requirement: >=5.0.0-dev
```
Then you will need to update the version of Cordova using the following command
```Console
cordova platform update android@5.0.0
```

###Whitelist Issues With Parse
To address the issues, I have downloaded the version of the parse library and includeded it in the `lib` folder of the application. You will also need to updata the `Content-Security Policy` in the `index.html` file. Please see code below
```HTML
<meta http-equiv="Content-Security-Policy" content="default-src 'self' data: gap: https://ssl.gstatic.com https://api.parse.com; style-src 'self' 'unsafe-inline'; media-src *">
```
-
###Saving Images to File and Base64 Conversion

Was having issues with the cordova camera plugin and iphone 6 plus where the memory was causing issue when using data_url with base64 strings for manipulating images.

We are using base64 images because of the integration with the Parse Javascript API.

I have used the [PhoneGap-Image-Resizer Plugin](https://github.com/timkalinowski/PhoneGap-Image-Resizer) to convert the photo from the data file to a base64 string for a thumbnail image and then used the same plugin to convert the data file to a base64 String to save in parse

You will also need to install the [ActionSheet Plugin](https://github.com/EddyVerbruggen/cordova-plugin-actionsheet) to get the sample code in this project working correctly.


```Javascript
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

/**
 * converts data file to string by resizing the image using 100% resize factor
 * 
 * @param img_path
 * @returns {*}
 */
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
```

See [PhoneGap-Image-Resizer Plugin](https://github.com/timkalinowski/PhoneGap-Image-Resizer) for additional information on the parameters

###Supporting File Uploads To Parse w/ Javascript API
What we are doing here is creating a parse object called ImageInfo to store the file reference and any additional information on the file we want to save.

First step is to create the parse file object using the base64 version of the file, then add the file object to the ImageInfo object and save that... All done!!

See the code in `js/parseService.js`

```Javascript
/**
 * file js/parseService.js
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
```
###Supporting File Uploads To Parse w/ REST API
We are doing the exact same as above but using the REST API.

To used the REST API, we need to add the `restAPIKey` to the `ParseConfiguration` in `app.js`
```Javascript
/**
 * see documentation: https://www.parse.com/apps/quickstart#parse_data/web/existing
 *
 * SET THESE VALUES IF YOU WANT TO USE PARSE, COMMENT THEM OUT TO USE THE DEFAULT
 * SERVICE
 *
 * parse constants
 */
.value('ParseConfiguration', {
    applicationId: "QDd5uSoUe27KlqSwZso5mcgchaHkaDTAovxJeKFe",
    javascriptKey: "jTqY3JLwfew3DqaaqrrpwdI1mTTXspYyj8U7dzQY",
    restAPIKey: "v8qUu6FoT3lU2kFZx0Zvl3Ss5g1DjX6zngCpnMPY"
})
```
Next in the `parseService.js` we will use the REST API as documented to first upload a file and then associate it to an image.

First there is basic housekeeping to set up the headers and the base url for the REST API interactions.
```Javascript
var PARSE__HEADER_CREDENTIALS = {
    "x-parse-application-id": ParseConfiguration.applicationId,
    "x-parse-rest-api-key": ParseConfiguration.restAPIKey
};

var baseURL = "https://api.parse.com/1/";
var authenticationHeaders = PARSE__HEADER_CREDENTIALS;
```
Then you will need to actually save the image, see the function below.
```Javascript
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
```
### More Information on Using Parse REST API
[Click Here for Series on Ionic Framework Using Parse.com](https://github.com/aaronksaunders/hu1/wiki/3.3-Using-Parse.com-in-an-$http-Service)


## Ionic Video Series - Subscribe on YouTube Channel
[![http://www.clearlyinnovative.com/wp-content/uploads/2015/07/blog-cover-post-2.jpg](http://www.clearlyinnovative.com/wp-content/uploads/2015/07/blog-cover-post-2.jpg)](https://www.youtube.com/channel/UCMCcqbJpyL3LAv3PJeYz2bg?sub_confirmation=1)


##TODO

* Submit Pull Request for Plugin to be able to convert image using code below `imageToBase64` along with other options
* Submit PR for plugin to create thumbnail from image and maintain aspect ratio... it might be there, but cannot make sense of documentation

This is the mod for the plugin to just do a base64 conversion in IOS/Objective-C; need to include code for Android/Java
```Objective-C
- (void) imageToBase64:(CDVInvokedUrlCommand*)command {
    NSDictionary *options = [command.arguments objectAtIndex:0];

    NSInteger quality = [[options objectForKey:@"quality"] integerValue];
    NSString *format =  [options objectForKey:@"format"];

    UIImage * img = [self getImageUsingOptions:options];

    NSData* imageDataObject = nil;
    if ([format isEqualToString:@"jpg"]) {
        imageDataObject = UIImageJPEGRepresentation(img, (quality/100.f));
    } else {
        imageDataObject = UIImagePNGRepresentation(img);
    }

    NSString *encodedString = [imageDataObject base64EncodingWithLineLength:0];
    NSDictionary* result = [NSDictionary dictionaryWithObjects:[NSArray arrayWithObjects:encodedString, nil] forKeys:[NSArray arrayWithObjects: @"imageData",nil]];

    if (encodedString != nil) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:result];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
    }

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];

}
```
