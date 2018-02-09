const matches = (/^\?course=([a-z]{4}[0-9]{3})/).exec(location.search);
let manifest = null;

function failureToLoad(context) {
    
    var source = $("#template").html();
    var template = Handlebars.compile(source);
    var html = template(context);

    $('#main').append(html);
}

$(document).ready(function() {

    if (matches && matches[1]) {

        const course = matches[1];
        const courseUrl = `./courses/${course}.json`;

        // attempt to load the course manifest
        $.ajax({
            url: courseUrl,
            dataType: 'json',
            success: (data) => {

                // set the manifest and render the layout
                manifest = data;
                renderLayout();

            },
            error: (err) => {

                console.log('An error occurred while trying to load the manifest from', courseUrl, err);
                failureToLoad({ nocourse: true });

            }
        });

    } else {

        console.log('No valid course found in the url. Displaying default page.');
        failureToLoad({ nocourse: true });
        
    }

});