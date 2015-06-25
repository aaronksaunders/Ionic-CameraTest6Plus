# Ionic-CameraTest iPhone6 Plus

Was having issues with the cordova camera plugin and iphone 6 plus where the memory was causing issue when using data_url with base64 strings for manipulating images.

We are using base64 images because of the integration with the Parse Javascript API.

I have used the [PhoneGap-Image-Resizer Plugin](https://github.com/timkalinowski/PhoneGap-Image-Resizer) to convert the photo from the data file to a base64 string for a thumbnail image and then used the same plugin to convert the data file to a base64 String to save in parse

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
