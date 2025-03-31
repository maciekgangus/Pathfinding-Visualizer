function decodeToken(token) {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
}

function scheduleTokenRefresh(accessToken) {
    const decoded = decodeToken(accessToken);
    const expiryTime = decoded.exp * 1000; // Konwersja na milisekundy
    const refreshTime = expiryTime - Date.now() - 30000; // 30 sekund przed wygaśnięciem

    if (refreshTime <= 0) {
        console.warn('Token już wygasł. Odświeżanie teraz.');
        refreshAccessToken();
        return;
    }

    console.log(`Zaplanowano odświeżenie za ${Math.round(refreshTime / 1000)} sekund.`);
    setTimeout(refreshAccessToken, refreshTime);
}

function refreshAccessToken() {
    $.ajax({
        url: '/auth/refresh',
        method: 'POST',
        xhrFields: { withCredentials: true },
        success: function (data, textStatus, jqXHR) {
            if (jqXHR.status === 204) {
                console.log('Nie ma zalogowanego użytkownika. Token nie został odświeżony.');
            } else if (data.accessToken) {
                console.log('Token odświeżony przy ładowaniu strony.');
                scheduleTokenRefresh(data.accessToken);
            }
        },
        error: function () {
            console.warn('Nie udało się odświeżyć tokena. Wylogowanie.');
            logout(); // Wyloguj użytkownika
        },
    });
}

function logout() {
    $.ajax({
        url: '/auth/logout',
        method: 'DELETE',
        xhrFields: { withCredentials: true },
        success: function () {
            window.location.href = '/auth/login'; // Przekierowanie na stronę logowania
        },
        error: function () {
            console.error('Błąd podczas wylogowania.');
        },
    });
}

$(document).ready(function () {
    $.ajax({
        url: '/auth/refresh',
        method: 'POST',
        xhrFields: { withCredentials: true },
        success: function (data, textStatus, jqXHR) {
            if (jqXHR.status === 204) {
                console.log('Nie ma zalogowanego użytkownika. Token nie został odświeżony.');
            } else if (data.accessToken) {
                console.log('Token odświeżony przy ładowaniu strony.');
                scheduleTokenRefresh(data.accessToken);
            }
        },
        error: function (jqXHR) {
            if (jqXHR.status === 401 || jqXHR.status === 403) {
                console.log('Nie ma zalogowanego użytkownika. Token nie został odświeżony.');
            } else {
                console.error('Wystąpił błąd podczas odświeżania tokena:', jqXHR.statusText);
            }
        },
    });
});


