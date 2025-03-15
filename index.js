// DOM要素の参照を保持
const elements = {
    date: document.getElementById('date'),
    newTask: document.getElementById('newTask'),
    taskList: document.getElementById('taskList'),
    copyBtn: document.getElementById('copyBtn'),
    status: document.getElementById('status'),
    addIcon: document.querySelector('.add-icon')
};

// 初期化処理
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

// アプリケーションの初期化
function initializeApp() {
    elements.date.innerText = new Date().toLocaleDateString('ja-JP');
    updateStatus();
}

// イベントリスナーの設定
function setupEventListeners() {
    elements.addIcon.addEventListener('click', () => elements.newTask.focus());
    elements.newTask.addEventListener('keypress', handleNewTaskKeyPress);
    elements.taskList.addEventListener('click', handleTaskClick);
    elements.copyBtn.addEventListener('click', copyTasksForReport);
}

// 新規タスク入力のキーイベント処理
function handleNewTaskKeyPress(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        addTask();
    }
}

// タスククリックイベントの処理
function handleTaskClick(e) {
    const target = e.target.tagName === 'LI' ?
        e.target.querySelector('.task-text') :
        e.target;

    if (target?.classList.contains('task-text')) {
        handleTaskDoubleClick(target);
    }
}

// タスクのダブルクリック処理
function handleTaskDoubleClick(target) {
    if (target.dataset.lastClick && Date.now() - target.dataset.lastClick < 300) {
        makeEditable(target);
        delete target.dataset.lastClick;
    } else {
        target.dataset.lastClick = Date.now();
    }
}

// タスク要素の編集可能化
function makeEditable(element) {
    const currentText = element.textContent;
    const input = createEditInput(currentText);
    const parent = element.parentNode;

    parent.replaceChild(input, element);
    input.focus();

    const finishEdit = createFinishEditHandler(input, element, parent, currentText);

    input.addEventListener('keypress', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            finishEdit();
        }
    });
    input.addEventListener('blur', finishEdit);
}

// 編集入力フィールドの作成
function createEditInput(value) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.className = 'edit-input';
    return input;
}

// 編集完了ハンドラの作成
function createFinishEditHandler(input, element, parent, currentText) {
    return () => {
        const newText = input.value.trim();
        const newSpan = document.createElement('span');
        newSpan.className = element.className;
        newSpan.textContent = newText || currentText;

        const checkbox = parent.querySelector('input[type="checkbox"]');
        if (checkbox?.checked) {
            newSpan.classList.add('completed');
        }

        parent.replaceChild(newSpan, input);
        updateStatus();
    };
}

// ステータス表示の更新
function updateStatus() {
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    elements.status.innerText = `${time} に編集しました`;
}

// 新規タスクの追加
function addTask() {
    const taskText = elements.newTask.value.trim();
    if (!taskText) return;

    const taskElement = createTaskElement(taskText);
    elements.taskList.appendChild(taskElement);
    elements.newTask.value = '';
    updateStatus();
}

// タスク要素の作成
function createTaskElement(text) {
    const li = document.createElement('li');
    const checkbox = createCheckbox();
    const span = createTaskSpan(text);

    checkbox.addEventListener('change', () => {
        span.classList.toggle('completed', checkbox.checked);
    });

    li.append(checkbox, span);
    return li;
}

// チェックボックスの作成
function createCheckbox() {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    return checkbox;
}

// タスクテキスト要素の作成
function createTaskSpan(text) {
    const span = document.createElement('span');
    span.textContent = text;
    span.className = 'task-text';
    span.setAttribute('data-editable', 'true');
    return span;
}

// 日報用のタスクコピー
function copyTasksForReport() {
    const tasks = elements.taskList.querySelectorAll('li');
    const reportText = generateReportText(tasks);

    navigator.clipboard.writeText(reportText)
        .then(() => showCopySuccess())
        .catch(err => handleCopyError(err));
}

// 日報テキストの生成
function generateReportText(tasks) {
    let reportText = `【${new Date().toLocaleDateString('ja-JP')}の作業内容】\n\n`;

    reportText += "【未完了】\n";
    reportText += generateTaskList(tasks, false);

    reportText += "\n【完了】\n";
    reportText += generateTaskList(tasks, true);

    return reportText;
}

// タスクリストテキストの生成
function generateTaskList(tasks, completed) {
    return Array.from(tasks)
        .filter(task => task.querySelector('input[type="checkbox"]').checked === completed)
        .map(task => `・${task.querySelector('.task-text').textContent}`)
        .join('\n');
}

// コピー成功時の処理
function showCopySuccess() {
    const originalText = elements.copyBtn.textContent;
    elements.copyBtn.textContent = 'コピーしました！';
    setTimeout(() => {
        elements.copyBtn.textContent = originalText;
    }, 2000);
}

// コピーエラー時の処理
function handleCopyError(err) {
    console.error('コピーに失敗しました:', err);
    alert('コピーに失敗しました。');
}
