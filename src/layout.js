const pattern = /category-(\d+)-entry-(\d+)/;

function computeManifest(manifest) {

    // add segments for the exam summary
    const segmentLength = Math.ceil((100 - manifest.exam_pass) / 5) + 1;
    const start = 100 - (segmentLength - 1) * 5;
    const segments = [];

    for (let i = segmentLength - 1; i >= 0; i--) {
        segments.push(start + 5 * i);
    }

    manifest.segments = segments;

    // add ids for the categories
    for (let i = 0; i < manifest.categories.length; i++) {
        manifest.categories[i].id = i;
        manifest.categories[i].totalWeight = 0;

        // add ids for the entries
        for (let j = 0; j < manifest.categories[i].entries.length; j++) {
            manifest.categories[i].entries[j].id = j;
        }
    }
}

function letterGrade(mark) {
    mark = parseFloat(mark.toFixed(1));

    if (mark < manifest.course_pass) return 'F';
    if (mark < 40) return 'E';
    if (mark < 50) return 'D';
    if (mark < 55) return 'C-';
    if (mark < 60) return 'C';
    if (mark < 65) return 'C+';
    if (mark < 70) return 'B-';
    if (mark < 75) return 'B';
    if (mark < 80) return 'B+';
    if (mark < 85) return 'A-';
    if (mark < 90) return 'A';
    return 'A+';
}

function gpaValue(letter) {
    switch (letter) {
        case 'E':  return '-1';
        case 'D':  return '+0';
        case 'C-': return '+1';
        case 'C':  return '+2';
        case 'C+': return '+3';
        case 'B-': return '+4';
        case 'B':  return '+5';
        case 'B+': return '+6';
        case 'A-': return '+7';
        case 'A':  return '+8';
        case 'A+': return '+9';

        case 'R': return '+1';
        case 'X': return '-3';

        default: return 'n/a';
    }
}

function letterColour(letter) {
    switch (letter) {
        case 'F':
        case 'X':
        case 'E':
            return 'bg-danger';
        case 'R':
        case 'D':
            return 'bg-warning';
        case 'C-':
        case 'C':
        case 'C+':
            return 'bg-info';
        case 'B-':
        case 'B':
        case 'B+':
            return 'bg-primary';
        case 'A-':
        case 'A':
        case 'A+':
            return 'bg-success';
        default: 'bg-white';

    }
}

function bindEvents(manifest) {

    // events for when a user modifies an input
    $('body').on('change', 'input.mark-input', function() {

        // get the category id and the entry id
        const groups = pattern.exec(this.id);
        const categoryId = parseInt(groups[1]);
        const entryId = parseInt(groups[2]);
        let value = parseFloat(this.value);

        if (value > manifest.categories[categoryId].entries[entryId].marks) {

            this.value = manifest.categories[categoryId].entries[entryId].marks;

        }

        if (value < 0) {

            this.value = 0;
            
        }

        manifest.categories[categoryId].entries[entryId].value = this.value;
        localStorage.setItem('exam-' + manifest.code + '-c-' + categoryId + '-e-' + entryId, this.value);
        
        // recalculate the mark percentage
        const markPercentage = this.value / manifest.categories[categoryId].entries[entryId].marks * 100;
        $('#category-' + categoryId.toString() + '-entry-' + entryId.toString() + '-percent').text(
            markPercentage.toFixed(2).toString() + '%'
        );

        // recalculate the category weight
        let categoryWeight = 0;

        for (let entry of manifest.categories[categoryId].entries) {
            categoryWeight += (entry.value / entry.marks) * entry.weight;
        }

        $('#category-' + categoryId.toString() + '-weight').text(
            categoryWeight.toFixed(2).toString() + '%'
        );

        manifest.categories[categoryId].totalWeight = categoryWeight;

        // recalculate the internal weight
        let internalWeight = 0;

        for (let category of manifest.categories) {
            internalWeight += category.totalWeight;
        }

        $('#internal-weight').text(internalWeight.toFixed(2) + '%');

        // recalculate the exam forecast table
        for (let segment of manifest.segments) {

            const total = segment * manifest.exam_weight / 100 + internalWeight;
            const letter = letterGrade(total);
            const gpa = gpaValue(letter);

            $('#total-mark-' + segment.toString()).text(
                total.toFixed(2).toString() + '%'
            );

            $('#letter-grade-' + segment.toString()).text(letter);

            $('#gpa-value-' + segment.toString()).text(gpa);

            // alter the colour of the row based on the letter grade
            $('#row-' + segment).removeClass().addClass(letterColour(letter));

        }
        
        $('#min-letter-grade').text(
            $('#letter-grade-' + (manifest.segments[manifest.segments.length - 1]).toString()).text()
        );

        $('#max-letter-grade').text(
            $('#letter-grade-100').text()
        );


    });

}

function populateFieldsFromStorage() {

    if (typeof(Storage) !== 'undefined') {

        for (let c = 0; c < manifest.categories.length; c++) {

            for (let e = 0; e < manifest.categories[c].entries.length; e++) {

                // set the default values to all fields to 0
                if (!localStorage.getItem('exam-' + manifest.code + '-c-' + c + '-e-' + e))
                    localStorage.setItem('exam-' + manifest.code + '-c-' + c + '-e-' + e, 0);

            }

        }

    }

    // get the default values from localStorage and populate fields
    for (let c = 0; c < manifest.categories.length; c++) {

        for (let e = 0; e < manifest.categories[c].entries.length; e++) {

            $('#category-' + c + '-entry-' + e + '-mark').val(
                localStorage.getItem('exam-' + manifest.code + '-c-' + c + '-e-' + e)
            );

        }
    }

}

function triggerAllEvents() {
    $('input.mark-input').trigger('change');
}

function renderLayout() {
    computeManifest(manifest);

    var source   = $("#template").html();
    var template = Handlebars.compile(source);
    var context = manifest;
    var html = template(context);

    $('#main').append(html);

    bindEvents(manifest);

    populateFieldsFromStorage();

    triggerAllEvents();
};