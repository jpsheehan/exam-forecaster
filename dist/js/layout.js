'use strict';

var pattern = /category-(\d+)-entry-(\d+)/;

function computeManifest(manifest) {

    // add segments for the exam summary
    var segmentLength = Math.ceil((100 - manifest.exam_pass) / 5) + 1;
    var start = 100 - (segmentLength - 1) * 5;
    var segments = [];

    for (var i = segmentLength - 1; i >= 0; i--) {
        segments.push(start + 5 * i);
    }

    manifest.segments = segments;

    // add ids for the categories
    for (var _i = 0; _i < manifest.categories.length; _i++) {
        manifest.categories[_i].id = _i;
        manifest.categories[_i].totalWeight = 0;

        // add ids for the entries
        for (var j = 0; j < manifest.categories[_i].entries.length; j++) {
            manifest.categories[_i].entries[j].id = j;
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
        case 'E':
            return '-1';
        case 'D':
            return '+0';
        case 'C-':
            return '+1';
        case 'C':
            return '+2';
        case 'C+':
            return '+3';
        case 'B-':
            return '+4';
        case 'B':
            return '+5';
        case 'B+':
            return '+6';
        case 'A-':
            return '+7';
        case 'A':
            return '+8';
        case 'A+':
            return '+9';

        case 'R':
            return '+1';
        case 'X':
            return '-3';

        default:
            return 'n/a';
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
        default:
            'bg-white';

    }
}

function bindEvents(manifest) {

    // events for when a user modifies an input
    $('body').on('change', 'input.mark-input', function () {

        // get the category id and the entry id
        var groups = pattern.exec(this.id);
        var categoryId = parseInt(groups[1]);
        var entryId = parseInt(groups[2]);
        var value = parseFloat(this.value);

        if (value > manifest.categories[categoryId].entries[entryId].marks) {

            this.value = manifest.categories[categoryId].entries[entryId].marks;
        }

        if (value < 0) {

            this.value = 0;
        }

        manifest.categories[categoryId].entries[entryId].value = this.value;
        localStorage.setItem('exam-' + manifest.code + '-c-' + categoryId + '-e-' + entryId, this.value);

        // recalculate the mark percentage
        var markPercentage = this.value / manifest.categories[categoryId].entries[entryId].marks * 100;
        $('#category-' + categoryId.toString() + '-entry-' + entryId.toString() + '-percent').text(markPercentage.toFixed(2).toString() + '%');

        // recalculate the category weight
        var categoryWeight = 0;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = manifest.categories[categoryId].entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var entry = _step.value;

                categoryWeight += entry.value / entry.marks * entry.weight;
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        $('#category-' + categoryId.toString() + '-weight').text(categoryWeight.toFixed(2).toString() + '%');

        manifest.categories[categoryId].totalWeight = categoryWeight;

        // recalculate the internal weight
        var internalWeight = 0;

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
            for (var _iterator2 = manifest.categories[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var category = _step2.value;

                internalWeight += category.totalWeight;
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                    _iterator2.return();
                }
            } finally {
                if (_didIteratorError2) {
                    throw _iteratorError2;
                }
            }
        }

        $('#internal-weight').text(internalWeight.toFixed(2) + '%');

        // recalculate the exam forecast table
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
            for (var _iterator3 = manifest.segments[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var segment = _step3.value;


                var total = segment * manifest.exam_weight / 100 + internalWeight;
                var letter = letterGrade(total);
                var gpa = gpaValue(letter);

                $('#total-mark-' + segment.toString()).text(total.toFixed(2).toString() + '%');

                $('#letter-grade-' + segment.toString()).text(letter);

                $('#gpa-value-' + segment.toString()).text(gpa);

                // alter the colour of the row based on the letter grade
                $('#row-' + segment).removeClass().addClass(letterColour(letter));
            }
        } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                    _iterator3.return();
                }
            } finally {
                if (_didIteratorError3) {
                    throw _iteratorError3;
                }
            }
        }

        $('#min-letter-grade').text($('#letter-grade-' + manifest.segments[manifest.segments.length - 1].toString()).text());

        $('#max-letter-grade').text($('#letter-grade-100').text());
    });
}

function populateFieldsFromStorage() {

    if (typeof Storage !== 'undefined') {

        for (var c = 0; c < manifest.categories.length; c++) {

            for (var e = 0; e < manifest.categories[c].entries.length; e++) {

                // set the default values to all fields to 0
                if (!localStorage.getItem('exam-' + manifest.code + '-c-' + c + '-e-' + e)) localStorage.setItem('exam-' + manifest.code + '-c-' + c + '-e-' + e, 0);
            }
        }
    }

    // get the default values from localStorage and populate fields
    for (var _c = 0; _c < manifest.categories.length; _c++) {

        for (var _e = 0; _e < manifest.categories[_c].entries.length; _e++) {

            $('#category-' + _c + '-entry-' + _e + '-mark').val(localStorage.getItem('exam-' + manifest.code + '-c-' + _c + '-e-' + _e));
        }
    }
}

function triggerAllEvents() {
    $('input.mark-input').trigger('change');
}

$(document).ready(function () {
    computeManifest(manifest);

    var source = $("#template").html();
    var template = Handlebars.compile(source);
    var context = manifest;
    var html = template(context);

    $('#main').append(html);

    bindEvents(manifest);

    populateFieldsFromStorage();

    triggerAllEvents();
});