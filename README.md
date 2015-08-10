[![Book session on Codementor](https://cdn.codementor.io/badges/book_session_github.svg)](https://www.codementor.io/aaronksaunders)

# Ionic-CameraTest iPhone6 Plus

See blog post on project for additional information
http://www.clearlyinnovative.com/ionic-framework-camera-image-uploads-and-base64-strings/

-
Was having issues with the cordova camera plugin and iphone 6 plus where the memory was causing issue when using data_url with base64 strings for manipulating images.

We are using base64 images because of the integration with the Parse Javascript API.

I have used the [PhoneGap-Image-Resizer Plugin](https://github.com/timkalinowski/PhoneGap-Image-Resizer) to convert the photo from the data file to a base64 string for a thumbnail image and then used the same plugin to convert the data file to a base64 String to save in parse

You will also need to install the [ActionSheet Plugin](https://github.com/EddyVerbruggen/cordova-plugin-actionsheet) to get the sample code in this project working correctly

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
