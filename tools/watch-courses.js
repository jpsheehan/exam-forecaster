// watches the courses directory and updates the courses.js file

const fs = require('fs');
const path = require('path');

const dirname = './src/courses';
const outFilename = './dist/courses/courses.json';

if (process.argv[2] === '--watch') {
    fs.watch(dirname, (eventType, filename) => {

        if (filename) {

            rewriteCoursesFile();

        }

    });
}

function rewriteCoursesFile() {

    // get a list of all courses in the courses directory
    fs.readdir(dirname, (err, filenames) => {

        if (err) {
            console.error('Could not read directory contents:', err);
            return;
        }

        const courses = {};

        const outDirname = path.dirname(outFilename);

        if (!fs.existsSync(outDirname)) {
            console.log(`Creating directory ${outDirname}...`)
            fs.mkdirSync(outDirname);
        }

        for (let filename of filenames) {

            try {

                const [course, _] = filename.split('.');

                const srcFilename = path.join(dirname, filename);
                const destFilename = path.join(outDirname, filename);

                const data = fs.readFileSync(srcFilename);

                const json = JSON.parse(data);

                courses[course] = {
                    title: json.title,
                    year: json.year,
                    semester: json.semester,
                    code: json.code,
                }

                // copy the file over to the dist/courses directory
                fs.copyFileSync(srcFilename, destFilename);
            }
            catch (err) {

                console.error(`Could not add ${filename} to ${outFilename}, reason: ${err}. Skipping...`);

            }
        }

        fs.writeFile(outFilename, JSON.stringify(courses), (err) => {

            if (err) {

                console.error(`Could not write to '${outFilename}':`, err);

            } else {

                console.log(dirname, '->', outFilename);
            }

        });
    });

}

rewriteCoursesFile();