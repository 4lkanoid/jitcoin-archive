var $authFields = $('.auth-field');
var $authInputs = $('.auth-input');

var $authButton = $('#authSubmit');

var $usernameInput = $('#username');
var $passwordInput = $('#password');
var $recaptcha = $("#recaptcha");
var $otherError = $('#authError');

$('#passwordConfirm,#password').on('keyup', function (event) {
    if (event.keyCode === 13) {
        attemptSubmit();
    }
})

function attemptSubmit() {
    setRecaptcha();
    showLoader('Authenticating');
    var $auth = $('.auth');
    var type = $auth.attr('type');
    if (checkInput($passwordInput) && checkInput($usernameInput)) {
        $authButton.prop('disabled', true);
        $otherError.removeAttr('error', '');
        var recaptcha = $($recaptcha).val();
        var username = $($usernameInput).val();
        var password = $($passwordInput).val();
        if (type === 'login') {
            handle($.post('/api/auth/login', {recaptcha, username, password}), function () {
                window.location.href = '/panel';
            });
        } else {
            var $cPasswordInput = $('#passwordConfirm');
            if (checkInput($cPasswordInput)) {
                var passwordConfirm = $cPasswordInput.val();
                if (password === passwordConfirm) {
                    handle($.post('/api/auth/register', {recaptcha, username, password}), function () {
                        window.location.href = '/panel';
                    });
                } else {
                    showError({type: 'field', field: 'password-confirm'}, 'Password does not match!')
                }
            }
        }
    }
}

function isFilled() {
    var isEmpty = false;
    $authFields.each(function () {
        var $input = $(this).find('.auth-input');
        if ($input.val().length > 0) {
            isEmpty = !checkInput($input);
        } else {
            isEmpty = true;
        }
    });
    return !isEmpty;
}

$authInputs.on('input', function () {
    $authButton.prop('disabled', !isFilled());
    if (checkInput(this)) {
        inputClean(this);
    }
});

$('#username').on('change', function () {
    var type = $('.auth').attr('type');
    var $field = $(this).parents('.input-field');
    if (checkInput(this) && type !== 'login') {
        var username = $(this).val();
        console.log(username)
        handle($.get('/api/auth/username.php',{username}), function (response) {
            var isTaken = response.taken;
            if (isTaken) {
                $field.removeAttr('taken');
                showError('username', 'Username already taken')
            } else {
                $field.attr('taken', '');
            }
        });
    } else {
        $field.removeAttr('taken');
    }
});

$authButton.click(function () {
    attemptSubmit();
});
