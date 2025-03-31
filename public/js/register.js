$(document).ready(function () {
    $('#registerForm').on('submit', function (e) {
        e.preventDefault();

        const formData = {
            username: $('#username').val(),
            password: $('#password').val(),
        };


        $('#errorMessage').addClass('invisible').text('');
        $('#successMessage').addClass('invisible').text('');

        $.ajax({
            url: '/users/register',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function (response) {

                $('#successMessage').text(response.message).removeClass('invisible');
            },
            error: function (xhr) {

                const errorMessage = xhr.responseJSON?.message || 'Wystąpił błąd. Spróbuj ponownie.';
                $('#errorMessage').text(errorMessage).removeClass('invisible');
            }
        });
    });
});
