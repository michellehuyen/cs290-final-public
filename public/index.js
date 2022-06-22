$(".modal").on('hidden.bs.modal', function() {
    $(".form-control").val('')
})

$(".report-button").on('click', function() {
    if ($("#report-text").val() == '') {
        renderAlert('.emptyAlert');
    }
    else {
        sendBugReport($("#report-text").val());
    }
});

$(".post-button").on('click', function() {
    var topic = getTopic();
    
    if ($("#post-text").val() == '') {
        renderAlert('.emptyAlert');
    } else if (topic) {
        sendPostToServer(topic, $("#post-text").val());
    }
});

function searchButton() {
    var searchString = $(".searchText").val();
    if (searchString) window.location = "/search/" + searchString;
}

function getReplyBox(idx) {
    for (var i = 0; i < $('.board').children().length; i++) {
        if ($($('.board').children()[i]).hasClass('post')) {
            idx--;
        }

        if (idx == -1) break;
    }

    if (idx == -1) return $($('.board').children()[i]).find(".replyBox");
    else return null;
}

function getButtonIndex(postElement) {
    var count = 0;
    for (var i = 0; i < postElement.index(); i++) {
        if ($($('.board').children()[i]).hasClass('post')) count++;
    }

    return count;
}

$(".reply").on('click', function() {   
    var idx = getButtonIndex($(this).parents('.post'));

    getReplyBox(idx).removeClass("d-none");
});

function closeReplyBox() {
    $(".replyBox").addClass('d-none');
    $(".reply-text").val('')
}

$(".close-button").on('click', function() {
    $(this).parent().find('.form-control').val('');
    $(this).parents('.replyBox').addClass('d-none');
})

$(".reply-button").on('click', function() {
    var topic = getTopic();
    var idx = getButtonIndex($(this).parents('.post'));
    var val = getReplyBox(idx).find('.form-control').val()

    if (val == '') {
        renderAlert('.emptyAlert');
    } else if (topic) {
        sendCommentToServer(topic, idx, val);
    }
});

function getTopic() {
    var path = window.location.pathname;
    var pathParts = path.split('/');
    
    if (pathParts[1] === "topics") {
      return pathParts[2];
    } else {
      return null;
    }
}

function renderAlert(alertName) {
    $(alertName).addClass('show')
    setTimeout(function() {
        $(alertName).removeClass('show')
    }, 3000)
}

function createPost(text) {
    var context = {
        text: text
    }
    var posts = Handlebars.templates.post(context)
    console.log("Posts: ", posts)
    document.getElementById('posts').insertAdjacentHTML('beforeend', posts)
}

function makeReq(url, postJSON, eventFunc) {
    var req = new XMLHttpRequest();
    
    req.open('POST', url);
    req.addEventListener('load', eventFunc);
    req.setRequestHeader('Content-Type', 'application/json');
    req.send(JSON.stringify(postJSON));
}

function sendBugReport(reportText) {
    var url = '/report'
    var postJSON = { text: reportText };

    makeReq(url, postJSON, function (event) {
        if (event.target.status === 200) {
            renderAlert('.bugAlert');
        } else {
            renderAlert('.failAlert'); 
        }
    });
}

function sendPostToServer(topic, text) {
    var url = '/post'
    var postJSON = {
        topic: topic,
        text: text
    };

    makeReq(url, postJSON, function (event) {
        if (event.target.status === 200) {
            // teee heee
            location.reload();
        } else {
            renderAlert('.failAlert');
        }
    });
}

function sendCommentToServer(topic, id, text) {
    var url = '/comment'
    var postJSON = {
        topic: topic,
        id: id,
        text: text
    };

    makeReq(url, postJSON, function (event) {
        if (event.target.status === 200) {
            // teee hee
            closeReplyBox();
            location.reload();
        } else {
            renderAlert('.failAlert');
        }
    });
}
