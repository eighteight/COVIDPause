let condition = node => (node.tagName == 'ARTICLE');
let host = window.location.host;
if (host == 'www.facebook.com') {
    condition = node => (
        node.getAttribute('role') == 'article' ||
        node.getAttribute('data-type') == 'type_facebook_app');
} else if (host == 'news.yahoo.com') {
    condition = node => (
        node.classList.contains('js-stream-content') ||
        node.classList.contains('Cf'));
} else if (host == 'news.google.com') {
    condition = node => (
        node.tagName == 'ARTICLE' ||
        node.getAttribute('aria-label') == 'COVID-19' ||
        (node.getAttribute('jsdata') && node.getAttribute('jsdata').indexOf('JunkIt') != -1))
} else if (host == 'www.huffpost.com') {
    condition = node => (
        node.classList.contains('card'))
} else if (host == 'www.washingtonpost.com') {
    condition = node => (
        node.getAttribute('moat-id'))
} else if (host == 'www.theguardian.com') {
    condition = node => (
        node.classList.contains('fc-item'))
} else if (host == 'www.youtube.com') {
    condition = node => (
        node.tagName == 'YTD-VIDEO-RENDERER' ||
        node.tagName == 'YTD-GRID-VIDEO-RENDERER')
} else if (host == 'www.reddit.com') {
    condition = node => (
        node.classList.contains('Post'))
}

function findParentArticle(node, original=node) {
    if (condition(node)) {
        return node;
    }
    let parent = node.parentElement;
    if (parent == null) {
        return original;
    }
    return findParentArticle(parent, original);
}

var sheet = document.createElement('style');
document.body.appendChild(sheet);

function hideNode(node) {
    let parent = findParentArticle(node.parentElement);
    parent.classList.add('JunkIt');
}

function fixNode(node, denylist) {

    var testString = node.nodeValue.replace(/\s/g, "");
    if (testString && testString !== '') {
        denylist.forEach(word => {
            if (testString.includes(word) || testString.toLowerCase().includes(word.toLowerCase())) {
                hideNode(node);
            }
        });
    }
}

function fixElements(elements, denylist) {
    elements.forEach(node => {
        fixNode(node, denylist);
    })
}

function getTextNodes(parent){
    var all = [];
    for (parent = parent.firstChild; parent; parent = parent.nextSibling) {
        if (['SCRIPT','STYLE'].indexOf(parent.tagName) >= 0) continue;
        if (parent.nodeType === Node.TEXT_NODE) all.push(parent);
        else all = all.concat(getTextNodes(parent));
    }
    return all;
}

let observer;
function setup() {
    chrome.storage.local.get(['JunkIt'], function(data) {

        const denylist = data.JunkIt;

        sheet.innerHTML = ".JunkIt {display: none !important}";



        fixElements(getTextNodes(document.body), denylist);

        observer = new MutationObserver(mutations => {
            // would be great to limit these updates only to the modified elements
            // but i haven't found a way to do that consistently
            fixElements(getTextNodes(document.body), denylist);
        });

        var config = {
            childList: true,
            subtree: true,
            characterData: true
        };

        observer.observe(document.body, config);
    });

}

function teardown() {
    sheet.innerHTML = ".JunkIt {}";
    if (observer) {
        observer.disconnect();
        console.log('disconnect')
    }
}

chrome.storage.local.get(['enabled'], result => {
    if (result.enabled) {
        setup();
    }
})

chrome.storage.onChanged.addListener(storage => {
    let enabled = storage.enabled.newValue;
    if (enabled) {
        setup();
    } else {
        teardown();
    }
})
