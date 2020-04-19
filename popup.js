function clickHandler() {
    chrome.storage.local.get(['JunkIt'], function(data) {

        let userList = data.JunkIt;
        document.getElementById('junk').innerHTML = JSON.stringify(userList);
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('button').addEventListener('click', clickHandler);
});

let changeColor = document.getElementById('changeColor');

chrome.storage.sync.get('color', function(data) {
    changeColor.style.backgroundColor = data.color;
    changeColor.setAttribute('value', data.color);
});

