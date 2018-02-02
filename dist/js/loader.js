'use strict';

var matches = /^\?course=([a-z]{4}[0-9]{3})/.exec(location.search);

function failureToLoad(context) {
    var source = $("#template").html();
    var template = Handlebars.compile(source);
    var html = template(context);

    $('#main').append(html);
}

if (matches && matches[1]) {

    var course = matches[1];

    // attempt to load the course.
    $.getScript('./js/courses/' + course + '.js').done(function () {
        $.getScript('./js/layout.js').fail(function () {
            failureToLoad({ failure: true });
        });
    }).fail(failureToLoad);
} else {

    failureToLoad({ nocourse: true });
}