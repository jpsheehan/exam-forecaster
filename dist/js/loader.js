'use strict';

var matches = /^\?course=([a-z]{4}[0-9]{3})/.exec(location.search);
var manifest = null;

function failureToLoad(context) {
    var source = $("#template").html();
    var template = Handlebars.compile(source);
    var html = template(context);

    $('#main').append(html);
}

$(document).ready(function () {

    if (matches && matches[1]) {

        var course = matches[1];
        var courseUrl = './js/courses/' + course + '.json';

        // attempt to load the course manifest
        $.ajax({
            url: courseUrl,
            dataType: 'json',
            success: function success(data) {

                // set the manifest and render the layout
                manifest = data;
                renderLayout();
            },
            error: function error() {

                failureToLoad({ nocourse: true });
            }
        });
    } else {

        failureToLoad({ nocourse: true });
    }
});