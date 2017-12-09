const DEFAULT_TAB_TITLES = [
  'すべて', '画像', '動画', '地図', 'ニュース',
  '書籍', 'ショッピング', 'フライト', 'ファイナンス'
];
const DEFAULT_TAB_SIZE = 5;
const DEFAULT_DIALOG = 'Press button above if OK.';
const timers = [];

let tabTitles = DEFAULT_TAB_TITLES;
let tabShowSize = DEFAULT_TAB_SIZE;
const mainTag = document.querySelector('main');
const orderDiv = document.getElementById('order'),
      sizeDiv  = document.getElementById('size');
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
  selectTag.setAttribute('size', `${tabTitles.length}`);
  orderDiv.insertBefore(selectTag, orderDiv.childNodes[0]);
}

const initSizeInput = (size) => {
  sizeDiv.querySelector('input').value = size;
}

chrome.storage.sync.get(['order', 'size'], items => {
  if (items.order.length > 0) {
    tabTitles = JSON.parse(items.order);
  }
  if (items.size.length > 0) {
    tabShowSize = parseInt(items.size);
  }
  initOrderSelect(tabTitles);
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
  if (index < tabTitles.length - 1) {
    moveOption(index + 1);
  }
});

document.getElementById('orderReset').addEventListener('click', e => {
  initOrderSelect(DEFAULT_TAB_TITLES);
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
    () => {
      showSavedDialog('Options saved!', 2);
    }
  );
});
