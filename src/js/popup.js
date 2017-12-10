// EDIT HERE
//   tab order
//     tab titles (2017/12/07, Japanese):
//       'すべて', '画像', '動画', '地図', 'ニュース',
//       'ショッピング', '書籍', 'フライト', 'ファイナンス'
const DEFAULT_TAB_ORDER = [
  'すべて', '画像', '動画', '地図', 'ニュース',
  '書籍', 'ショッピング', 'フライト', 'ファイナンス'
];
//   tab show size
//     how many tabs be shown (others be hidden)
const DEFAULT_TAB_SIZE = 5;

const DEFAULT_DIALOG = 'Press button above if OK.';
const timers = [];

let tabOrder    = [...DEFAULT_TAB_ORDER];
let tabShowSize = DEFAULT_TAB_SIZE;
const mainTag   = document.querySelector('main');
const orderDiv  = document.getElementById('order'),
      sizeDiv   = document.getElementById('size');
const dialogDiv = document.getElementById('dialog');
let selectTag;

const initOrderSelect = titles => {
  const oldSelectTag = orderDiv.querySelector('select');
  if (oldSelectTag) {
    oldSelectTag.parentNode.removeChild(oldSelectTag);
  }
  selectTag = document.createElement('select');
  titles.forEach(title => {
    optionTag = document.createElement('option');
    optionTag.insertAdjacentHTML('beforeend', title);
    selectTag.appendChild(optionTag);
  });
  selectTag.setAttribute('size', `${tabOrder.length}`);
  orderDiv.insertBefore(selectTag, orderDiv.childNodes[0]);
  debugger;
}

const initSizeInput = (size) => {
  sizeDiv.querySelector('input').value = size;
}

chrome.storage.sync.get(['order', 'size'], items => {
  if (JSON.parse(items.order).length > 0) {
    tabOrder = JSON.parse(items.order);
  }
  else {
    chrome.storage.sync.set(
      {
        order: JSON.stringify(tabOrder),
      }, null
    );
  }
  if (items.size.length > 0) {
    tabShowSize = parseInt(items.size);
  }
  else {
    chrome.storage.sync.set(
      {
        size : `${tabShowSize}`,
      }, null
    );
  }
  initOrderSelect(tabOrder);
  initSizeInput(tabShowSize);
});

const moveOption = (index) => {
  const options = selectTag.querySelectorAll('option');
  options[index].parentNode.removeChild(options[index]);
  options[index - 1].parentNode.insertBefore(options[index], options[index - 1]);
};

document.getElementById('up').addEventListener('click', e => {
  const index = selectTag.selectedIndex;
  if (index > 0) {
    moveOption(index);
  }
});

document.getElementById('down').addEventListener('click', e => {
  const index = selectTag.selectedIndex;
  if (index < tabOrder.length - 1) {
    moveOption(index + 1);
  }
});

document.getElementById('orderReset').addEventListener('click', e => {
  initOrderSelect(DEFAULT_TAB_ORDER);
});

document.getElementById('sizeReset').addEventListener('click', e => {
  initSizeInput(DEFAULT_TAB_SIZE);
});

const showSavedDialog = (message, showSecond) => {
  if (timers.length > 0) {
    clearTimeout(timers.pop());
    dialogDiv.innerHTML = DEFAULT_DIALOG;
  }
  dialogDiv.innerHTML = message;
  timers.push(
    setTimeout(() => {
      dialogDiv.innerHTML = DEFAULT_DIALOG;
      timers.pop();
    }, showSecond * 1000)
  );
};

document.getElementById('save').addEventListener('click', e => {
  const order = Array.from(orderDiv.querySelectorAll('select option')).map(option => option.innerHTML);
  const size = parseInt(sizeDiv.querySelector('input').value, 10);
  chrome.storage.sync.set(
    {
      order: JSON.stringify(order),
      size : `${size}`,
    },
    () => showSavedDialog('Options saved!', 2)
  );
});
