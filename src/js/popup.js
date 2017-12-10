const { DEFAULT_TAB_ORDER, DEFAULT_TAB_SIZE } = window;
const DEFAULT_DIALOG = 'Press button above if OK.';
const timers = [];

let tabOrder    = DEFAULT_TAB_ORDER;
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
}

const initSizeInput = (size) => {
  sizeDiv.querySelector('input').value = size;
}

const setOptions = (options, callback) => {
  chrome.storage.sync.set(options, callback);
};

chrome.storage.sync.get(['order', 'size'], items => {
  if (typeof items.order !== 'undefined' &&
      items.order !== null &&
      items.order.length > 0) {
    tabOrder = [...items.order];
  }
  else {
    setOptions({order: DEFAULT_TAB_ORDER});
  }
  if (typeof items.size !== 'undefined' &&
      items.size !== null &&
      `${parseInt(items.size)}`.length > 0) {
    tabShowSize = parseInt(items.size);
  }
  else {
    setOptions({size: DEFAULT_TAB_SIZE});
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
  setOptions(
    {
      order   : Array.from(orderDiv.querySelectorAll('select option')).map(option => option.innerHTML),
      size    : parseInt(sizeDiv.querySelector('input').value, 10),
    },
    () => showSavedDialog('Options saved!', 2)
  );
});
