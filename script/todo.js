/* 今日待办 · wyxltyz
 * 数组管理任务，每次操作后保存到 localStorage。
 * 用 textContent 显示任务文字，输入的 HTML 也只作为文字显示。
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'campus-kit:todos';
  var MAX_LENGTH = 200;
  var form = document.getElementById('todo-form');
  var input = document.getElementById('todo-input');
  var list = document.getElementById('todo-list');
  var empty = document.getElementById('todo-empty');
  var feedback = document.getElementById('todo-feedback');
  var storageStatus = document.getElementById('todo-storage-status');
  var total = document.getElementById('todo-total');
  var remaining = document.getElementById('todo-remaining');
  if (!form || !input || !list) { return; }

  var tasks = loadTasks();
  tasks.forEach(appendTask);
  updateSummary();

  // 表单提交同时支持点击按钮与回车；中文输入法选字时不提交。
  var composing = false;
  input.addEventListener('compositionstart', function () { composing = true; });
  input.addEventListener('compositionend', function () { composing = false; });
  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && (composing || event.isComposing || event.keyCode === 229)) {
      event.preventDefault();
    }
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (composing) { return; }
    var text = input.value.trim();
    if (!text || text.length > MAX_LENGTH) {
      feedback.textContent = text ? '待办内容请控制在 200 字以内。' : '请先输入待办内容，不能只填空格。';
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }

    var task = { text: text, done: false };
    tasks.push(task);
    appendTask(task);
    saveTasks();
    updateSummary();
    input.value = '';
    input.removeAttribute('aria-invalid');
    feedback.textContent = '已添加待办。';
    input.focus();
  });

  input.addEventListener('input', function () {
    input.removeAttribute('aria-invalid');
    feedback.textContent = '';
  });

  function appendTask(task) {
    var item = document.createElement('li');
    var label = document.createElement('label');
    var checkbox = document.createElement('input');
    var text = document.createElement('span');
    var remove = document.createElement('button');

    item.className = 'todo-item' + (task.done ? ' is-complete' : '');
    label.className = 'todo-label';
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = task.done;
    text.className = 'todo-text';
    text.textContent = task.text;
    remove.type = 'button';
    remove.className = 'btn btn-ghost todo-delete';
    remove.textContent = '删除';
    remove.setAttribute('aria-label', '删除待办：' + task.text);

    checkbox.addEventListener('change', function () {
      task.done = checkbox.checked;
      item.classList.toggle('is-complete', task.done);
      saveTasks();
      updateSummary();
      feedback.textContent = task.done ? '已标记完成。' : '已恢复为未完成。';
    });

    remove.addEventListener('click', function () {
      var next = item.nextElementSibling || item.previousElementSibling;
      tasks.splice(tasks.indexOf(task), 1);
      list.removeChild(item);
      saveTasks();
      updateSummary();
      feedback.textContent = '已删除待办。';
      // 删除当前按钮后，把键盘焦点交给相邻任务或输入框。
      if (next) { next.querySelector('.todo-delete').focus(); }
      else { input.focus(); }
    });

    label.appendChild(checkbox);
    label.appendChild(text);
    item.appendChild(label);
    item.appendChild(remove);
    list.appendChild(item);
  }

  function updateSummary() {
    total.textContent = tasks.length;
    remaining.textContent = tasks.filter(function (task) { return !task.done; }).length;
    empty.hidden = tasks.length > 0;
  }

  function loadTasks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) { return []; }
      var saved = JSON.parse(raw);
      if (!Array.isArray(saved)) { throw new Error('Invalid todo data'); }
      var valid = saved.filter(function (task) {
        return task && typeof task.text === 'string' && task.text.trim().length > 0 &&
          task.text.length <= MAX_LENGTH && typeof task.done === 'boolean';
      });
      if (valid.length !== saved.length) {
        storageStatus.textContent = '部分旧记录格式异常，已跳过；其余待办已恢复。';
      }
      return valid.map(function (task) { return { text: task.text.trim(), done: task.done }; });
    } catch (error) {
      storageStatus.textContent = '暂时无法读取已保存的待办，请检查浏览器存储设置；仍可添加新待办。';
      return [];
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      storageStatus.textContent = '';
    } catch (error) {
      storageStatus.textContent = '保存失败：当前修改仅在本页有效，刷新可能丢失。请检查浏览器存储设置或可用空间。';
    }
  }
})();
