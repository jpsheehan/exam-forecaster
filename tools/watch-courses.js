// watches the courses directory and updates the courses.js file

const fs = require('fs');
const path = require('path');

const dirname = './dist/courses';
const outFilename = './dist/js/courses.js';

fs.watch(dirname, (eventType, filename) => {

    if (filename) {

        console.log('Change detected. Rewriting "./src/courses.js"...');

        rewriteCoursesFile();

    }

});

function rewriteCoursesFile() {

    // get a list of all courses in the courses directory
    fs.readdir(dirname, (err, filenames) => {

        if (err) {
            console.error('Could not read directory contents:', err);
            return;
        }

        const courses = {};

        for (let filename of filenames) {

            const [course, _] = filename.split('.');

            const data = fs.readFileSync(path.join(dirname, filename));

            const json = JSON.parse(data);

            courses[course] = {
                title: json.title,
                year: json.year,
                semester: json.semester,
                code: json.code,
            }
        }

        fs.writeFile(outFilename, `const courses = ${JSON.stringify(courses)};`, (err) => {

            if (err) {

                console.error('Could not write to output file:', err);

            } else {

                console.log('Updated', outFilename);
            }

        });
    });

}

rewriteCoursesFile();