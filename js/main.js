var wavesurferOptions = {
    container: '#waveform',
    waveColor: '#02f', //#172B32',
    progressColor: '#00A1E5',
    height: 128,
    scrollParent: true,
    normalize: true
};

var wavesurfer; // wavesurfer instance

var currentView = 'teacher';
var teacherRegions;
var studentRegions;

$(document).ready(function () {
    wavesurfer = Object.create(WaveSurfer);
    // wavesurfer progress bar
    (function () {
        var progressDiv = document.querySelector('#progress-bar');
        var progressBar = progressDiv.querySelector('.progress-bar');

        var showProgress = function (percent) {
            progressDiv.style.display = 'block';
            progressBar.style.width = percent + '%';
        };
        var hideProgress = function () {
            progressDiv.style.display = 'none';
        };
        wavesurfer.on('loading', showProgress);
        wavesurfer.on('ready', hideProgress);
        wavesurfer.on('destroy', hideProgress);
        wavesurfer.on('error', hideProgress);
    }());

    wavesurfer.init(wavesurferOptions);
    wavesurfer.load('audio/At school I hated science.wav');

    wavesurfer.enableDragSelection({
        color: 'rgba(255, 0, 0, 0.1)'
    });

    wavesurfer.on('ready', function () {
        var timeline = Object.create(WaveSurfer.Timeline);
        timeline.init({
            wavesurfer: wavesurfer,
            container: '#wave-timeline'
        });
    });

    wavesurfer.on('region-created', function (region) {

        switch (currentView) {
            case 'student':
                //currentSRegion = region;
                break;
            case 'teacher':
                //teacherRegions = wavesurfer.regions;
                //currentTRegion = region;
                break;
        }
    });

    wavesurfer.on('region-updated', function (region) {
        switch (currentView) {
            case 'student':
                studentRegions = {};
                for(var index in wavesurfer.regions.list){
                    studentRegions[index] = wavesurfer.regions.list[index];
                }
                break;
            case 'teacher':
                teacherRegions = {};
                for(var index in wavesurfer.regions.list){
                    teacherRegions[index] = wavesurfer.regions.list[index];
                }
                break;
        }
    });

    $('#submit-button').toggle();


});

// on radio button click
function changeView(elem) {
    if (elem.value !== currentView) {
        currentView = elem.value;
        $('#submit-button').toggle();
        // remove all regions from wavesurfer instance
        removeRegions(false);
        switch (elem.value) {
            case 'student':
                console.log('do something for student view');
                $('#question').attr('disabled', true);
                for (var index in studentRegions) {
                    wavesurfer.addRegion(studentRegions[index]);
                }
                break;
            case 'teacher':
                console.log('do something for teacher view');
                $('#question').attr('disabled', false);
                // show teacher regions
                for (var index in teacherRegions) {
                    wavesurfer.addRegion(teacherRegions[index]);
                }
                break;
        }
    }
}

function playPause() {
    wavesurfer.playPause();
}

function submitAnswer() {
    var nbOk = 0;
    var nbKo = 0;
    var teacherTotal = teacherRegions ? Object.keys(teacherRegions).length:0;
    var studentTotal = studentRegions ? Object.keys(studentRegions).length:0;
    
    // attention pour vérifier il faut pour chaque region créée par l'étudiant vérifier si il y a une correspondance
    // dans ce qui a été fait par l'enseignant (pas forcément au même index !!)
    for (var index in studentRegions) {
        var region = wavesurfer.regions.list[index];
        var result = checkRegionValidity(region);
        if(result){
            nbOk++;
        }
        else{
           nbKo++; 
        }
    }
    var message = '';
    if(studentTotal > teacherTotal){
        message += 'Vous avez identifié trop de régions.';
    }
    else if(studentTotal < teacherTotal){
        message += 'Il manque des régions.';
    }
    else if (studentTotal === teacherTotal){
       message += 'Vous avez le bon nombre de région.'; 
    }
    
    message += '<br/>';
    
    message += 'Il y a ' + nbOk + ' bonne(s) réponse(s)<br/>';
    message += 'Il y a ' + nbKo + ' mauvaise(s) réponse(s)<br/>';
    
    toastr.info(message);

   // var success = currentTRegion.start <= currentSRegion.start && currentTRegion.end >= currentSRegion.end;
    //var message = success ? 'Congratulations ! You win!' : 'Ooops... sorry not the good answer!';
    //toastr.info(message);
}
/**
 * check if student region exist in teacher list
 * @param {type} region on student region
 * @returns {Boolean}
 */
function checkRegionValidity(region){
    var ok = false;
    var tolerence = 0.5;
    for (var index in teacherRegions){
        if( (region.start >= teacherRegions[index].start - tolerence) && (region.start <= teacherRegions[index].start + tolerence) 
                &&  (region.end >= teacherRegions[index].end - tolerence) && (region.end <= teacherRegions[index].end + tolerence) )
        {
            ok = true;
        }
    }
    return ok;
}

function removeRegions(all) {
    for (var index in wavesurfer.regions.list) {
        wavesurfer.regions.list[index].remove();
    }
    // if cammand from delete region button
    if(all){
        studentRegions = {};
        teacherRegions = {};
    }
}
