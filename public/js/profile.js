$(document).ready(function () {
    $('#changePasswordForm').on('submit', function (e) {
        e.preventDefault();
        $('#successMessage, #errorMessage').text('').addClass('invisible');


        const formData = {
            oldPassword: $('#oldPassword').val(),
            newPassword: $('#newPassword').val(),
        };

        $.ajax({
            url: `/users/profile/changePassword`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            success: function () {
                $('#successMessage').text('Hasło zostało zmienione').removeClass('invisible');
                $('#errorMessage').empty().addClass('invisible');
            },
            error: function (xhr) {
                // Wyświetlenie błędu
                const errorMessage = xhr.responseJSON?.message || 'Wystąpił błąd. Spróbuj ponownie.';
                $('#errorMessage').text(errorMessage).removeClass('invisible');
                $('#successMessage').empty().addClass('invisible');
            }
        });
    });
});