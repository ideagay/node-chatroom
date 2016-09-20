
function divEscapedContentElement(message) {
    return $('<div>'+message+'</div>');
}


function divSyetemContentElement(message) {
    return $('<div><i>'+message+'</i></div>');
}

function processUserInput(chatApp,socket) {
    var message=$("#send-message").val();
    var systemMessage;

    if(message.charAt(0)=='/'){

    }else{
        chatApp.sendMessage($(".room-name .name").text(),message);
        $("#message").append(divEscapedContentElement(message));
        $("#message").scrollTop($("#message").prop('scrollHeight'));
    }
    $('#send-message').val('');
}

var socket=io.connect();


   var chatApp=new Chat(socket);

    socket.on('nameResult',function (result) {
        var message;
        if (result.success){
            message='you are known as '+ result.name+'.'
        }else {
            message=result.message
        }
        $("#message").html(divSyetemContentElement(message))
    });

    socket.on('joinResult',function (result) {
       $(".room-name .name").text(result.room);
        $('#message').append(divSyetemContentElement('room changed.'))
    });

    socket.on('message',function (result) {
        var message=$("<div>"+result.user+"<span class='color1'>"+result.text+"</span></div>");
        $('#message').append(message);
    });

    socket.on('rooms',function (result) {
        $('.room-list').empty();
        console.log(result+":"+typeof result);
        for(var room in result){
            room=result.substring(1,room.length);
            if(room!=''){
                $(".room-list").append(divSyetemContentElement(room));
            }
        }

        $(".room-list div").on('click',function (e) {
            chatApp.processCommand('/join'+$(this).text());
            $("#send-message").focus();
        });

    });

setInterval(function () {
    socket.emit('rooms')
},1000);

$("#send-message").focus();

$("#send-btn").on('click',function () {
    processUserInput(chatApp,socket);
})