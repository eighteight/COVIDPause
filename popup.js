function clickHandler() {
    chrome.storage.local.get(['JunkIt'], function(data) {

        let userList = data.JunkIt;
        alert('here');
        document.getElementById('junk').innerHTML = JSON.stringify(userList);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('button').addEventListener('click', clickHandler);
});

