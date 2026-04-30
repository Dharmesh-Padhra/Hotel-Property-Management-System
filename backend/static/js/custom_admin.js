document.addEventListener("DOMContentLoaded", function () {
    const userPanel = document.querySelector('.user-panel');
    if (userPanel) {
        // Modify the user panel to display info below the profile image
        userPanel.style.flexDirection = 'column';
        userPanel.style.alignItems = 'center';
        userPanel.style.textAlign = 'center';

        const imageDiv = userPanel.querySelector('.image');
        const infoDiv = userPanel.querySelector('.info');

        if (imageDiv && infoDiv) {
            imageDiv.style.paddingLeft = '0';
            imageDiv.style.marginBottom = '10px';

            infoDiv.style.paddingLeft = '0';
            infoDiv.style.width = '100%';

            // Extract the user link which contains the email
            const userLink = infoDiv.querySelector('a');
            if (userLink) {
                userLink.style.whiteSpace = 'normal';
                userLink.style.wordBreak = 'break-all'; // Break long emails
            }

            // Create a logout button and add it below the email
            const logoutFormHtml = `
                <div style="margin-top: 15px;">
                    <form id="logout-form" method="post" action="/logout/">
                        <button type="submit" class="btn btn-sm btn-danger" style="border-radius: 20px; padding: 5px 15px;">
                            <i class="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </form>
                </div>
            `;

            // We need the CSRF token for the POST submission if Django expects it for logout
            // Jazzmin/Django admin uses a POST form for secure logouts
            const csrfTokenInput = document.querySelector('input[name="csrfmiddlewaretoken"]');
            let csrfHtml = '';
            if (csrfTokenInput) {
                csrfHtml = `<input type="hidden" name="csrfmiddlewaretoken" value="${csrfTokenInput.value}">`;
            } else {
                // If we can't find it directly, check cookies
                const cookies = document.cookie.split(';');
                let csrfCookie = '';
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.startsWith('csrftoken=')) {
                        csrfCookie = cookie.substring('csrftoken='.length, cookie.length);
                        break;
                    }
                }
                if (csrfCookie) {
                    csrfHtml = `<input type="hidden" name="csrfmiddlewaretoken" value="${csrfCookie}">`;
                }
            }

            // Insert the logout form with the csrf token
            infoDiv.insertAdjacentHTML('beforeend', logoutFormHtml);

            const form = infoDiv.querySelector('#logout-form');
            if (form && csrfHtml) {
                form.insertAdjacentHTML('afterbegin', csrfHtml);
            }
        }
    }
});
