// EDIT HERE
//   tab order
//     tab titles (2017/12/07, Japanese):
//       'すべて', '画像', '動画', '地図', 'ニュース',
//       'ショッピング', '書籍', 'フライト', 'ファイナンス'
let tabOrder = [
  'すべて', '画像', '動画', '地図', 'ニュース',
  '書籍', 'ショッピング', 'フライト', 'ファイナンス'
];
// EDIT HERE
//   tab show size
//     how many tabs be shown (others be hidden)
let tabShowSize = 5;

chrome.storage.sync.get(['order', 'size'], items => {
    console.log(items.order, items.size);
});

// parentNode of shown tabs
const tabParent = document.getElementById('hdtb-msb-vis');
const tabs = Array.from(tabParent.childNodes);

// tab shown now
let activeTab = {
  element: null,
  index  : -1,
};
// shown contents == [{title: title1, href: href1}, ...]
const tabContents =
  tabs.map(tabdiv => {
    const taba = tabdiv.querySelector('a');
    if(taba) {
      return {
        title: taba.innerHTML,
        href : taba.href,
      };
    }
    else {
      activeTab = {
        element: tabdiv,
        index: tabOrder.indexOf(tabdiv.innerHTML),
      };
      return false;
    }
  }).filter(tab => tab);

// parentNode of hidden tab(a-tag)s
const moreParent = document.getElementById('hdtb-msb').childNodes[0].querySelector('g-header-menu div');
let moreas = Array.from(moreParent.getElementsByTagName('a'));
// hidden contents == [{title: title1, href: href1}, ...]
const moreContents =
  moreas.map(morea => (
    {
      title: morea.innerHTML,
      href : morea.href,
    }
  ));

let allContents = [...tabContents, ...moreContents];
let newTabContents  = [],
    newMoreContents = [];

// find content with title in tabOrder
tabOrder.forEach((title, index) => {
  const content = allContents.find(content => content.title === title);
  if (content) {
    if (index < tabShowSize) {
      newTabContents.push(content);
    }
    else {
      newMoreContents.push(content);
    }
    // remove found content
    allContents.splice(allContents.indexOf(content), 1);
  }
});

// rest content also to be hidden
newMoreContents = [...newMoreContents, ...allContents];

// rearrange tabs
// remove activeTab temporary
tabParent.removeChild(activeTab.element);

// a-tags of shown tabs
let tabas = Array.from(tabParent.querySelectorAll('a'));
// diff between shown tabs and want-to-show-tabs
const diff = newTabContents.length - tabas.length - (activeTab.index === -1 ? 1 : 0);

if (diff > 0) {
  // move from more to tab
  for (let i = 0; i < diff; i++) {
    tabParent.appendChild(tabas[0].parentNode.cloneNode(true));
    moreParent.removeChild(moreas[i]);
  }
}
else if (diff < 0) {
  // move from tab to more
  for (let i = 0; i < - diff; i++) {
    tabParent.removeChild(tabas[i].parentNode);
    moreParent.appendChild(moreas[0].cloneNode());
  }
}
// re-get
tabas = Array.from(tabParent.querySelectorAll('a'));
moreas = Array.from(moreParent.querySelectorAll('a'));

// add activeTab in new order
if (activeTab.index === -1) {
  // if activeTab is not in tabOrder, move one content from tab to more
  newMoreContents.unshift(newTabContents.pop());
  tabParent.appendChild(activeTab.element);
}
else if (tabas.length === 0 || activeTab.index >= tabas.length) {
  tabParent.appendChild(activeTab.element);
}
else {
  tabParent.insertBefore(activeTab.element, tabas[activeTab.index].parentNode);
}

// add contents
newTabContents.forEach((newContent, index) => {
  tabas[index].innerHTML = newContent.title;
  tabas[index].href      = newContent.href;
});

newMoreContents.forEach((newContent, index) => {
  moreas[index].innerHTML = newContent.title;
  moreas[index].href      = newContent.href;
});
