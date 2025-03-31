$(document).ready(function () {
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        const formData = {
            username: $('#username').val(),
            password: $('#password').val(),
        };

        $.ajax({
            url: '/auth/login',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function () {

                window.location.href = '/';
            },
            error: function (xhr) {
                const errorMessage = xhr.responseJSON?.message || 'Wystąpił błąd. Spróbuj ponownie.';
                $('#errorMessage').text(errorMessage).removeClass('invisible');
            }
        });
    });
});
