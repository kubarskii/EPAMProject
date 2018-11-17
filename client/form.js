/*jQuery

$("#signup").click(function() {
    $(".message").css("transform", "translateX(100%)");
    if ($(".message").hasClass("login")) {
        $(".message").removeClass("login");
    }
    $(".message").addClass("signup");
});

$("#login").click(function() {
    $(".message").css("transform", "translateX(0)");
    if ($(".message").hasClass("login")) {
        $(".message").removeClass("signup");
    }
    $(".message").addClass("login");
});
*/
//jQury rewrite
let form = document.querySelector('div[data-type="content"]').addEventListener('click', function (e){
    message = document.querySelector('.message');
    if (e.target.id == 'login'){
        console.log('login');
        message.style.transform = 'translateX(0)';
        if (Object.values(message.classList).indexOf('login')){
            message.classList.remove('login');
        }
        message.classList.add('login');
    }else if (e.target.id == 'signup'){
        console.log('signup');
        message.style.transform = 'translateX(100%)';
        if (Object.values(message.classList).indexOf('login')){
            message.classList.remove('login');
        }
        message.classList.add('signup')
    }
});
