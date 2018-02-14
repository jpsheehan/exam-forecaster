const matches = (/^\?course=([A-Za-z]{4}[0-9]{3}-[0-9]{2}[Ss][A-Za-z0-9]{2,3})/).exec(location.search);
let manifest = null;
let courses = null;

function failureToLoad(context) {

    // add courses to the context
    context.courses = courses;
    
    var source = $("#template").html();
    var template = Handlebars.compile(source);
    var html = template(context);

    $('#main').append(html);
}

$(document).ready(function() {

    $.ajax({
        url: './courses/courses.json',
        dataType: 'json',
        success: (data) => {

            // the courses were loaded successfully
            courses = data;

            if (matches && matches[1]) {

                const course = matches[1];
                const courseUrl = `./courses/${course}.json`.toLowerCase();
        
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

        },
        error: (err) => {

            console.log('Could not load the courses.json file.');
            failureToLoad({ criticalError: true });

        }
    });

});