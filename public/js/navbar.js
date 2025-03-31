$('#logoutButton').on('click', function () {
    $.ajax({
        url: '/auth/logout',
        method: 'DELETE',
        xhrFields: {
            withCredentials: true,
        },
        success: function () {
            window.location.href = '/';
        },
        error: function () {
            alert('Wylogowanie nie powiodło się.');
        },
    });
});

