// DOM要素の参照を管理するクラス
class ElementManager {
    constructor() {
        this.elements = {
            date: document.getElementById('date'),
            newTask: document.getElementById('newTask'),
            taskList: document.getElementById('taskList'),
            copyBtn: document.getElementById('copyBtn'),
            status: document.getElementById('status'),
            addIcon: document.querySelector('.add-icon')
        };
    }

    getElement(key) {
        return this.elements[key];
    }
}

// タスク管理クラス
class TaskManager {
    constructor(elementManager) {
        this.elementManager = elementManager;
    }

    // タスクの作成
    createTask(text) {
        const li = document.createElement('li');
        const checkbox = this.createCheckbox();
        const span = this.createTaskSpan(text);

        checkbox.addEventListener('change', () => {
            span.classList.toggle('completed', checkbox.checked);
        });

        li.append(checkbox, span);
        return li;
    }

    createCheckbox() {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        return checkbox;
    }

    createTaskSpan(text) {
        const span = document.createElement('span');
        span.textContent = text;
        span.className = 'task-text';
        span.setAttribute('data-editable', 'true');
        return span;
    }

    // タスクの編集
    makeEditable(element) {
        const currentText = element.textContent;
        const input = this.createEditInput(currentText);
        const parent = element.parentNode;

        parent.replaceChild(input, element);
        input.focus();

        const finishEdit = this.createFinishEditHandler(input, element, parent, currentText);

        input.addEventListener('keypress', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                finishEdit();
            }
        });
        input.addEventListener('blur', finishEdit);
    }

    createEditInput(value) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = value;
        input.className = 'edit-input';
        return input;
    }

    createFinishEditHandler(input, element, parent, currentText) {
        return () => {
            const newText = input.value.trim();
            const newSpan = document.createElement('span');
            newSpan.className = element.className;
            newSpan.textContent = newText || currentText;

            if (element.hasAttribute('data-editable')) {
                newSpan.setAttribute('data-editable', 'true');
            }

            const checkbox = parent.querySelector('input[type="checkbox"]');

            if (checkbox?.checked) {
                newSpan.classList.add('completed');
            }

            checkbox?.addEventListener('change', function() {
                newSpan.classList.toggle('completed', this.checked);
            });

            parent.replaceChild(newSpan, input);
            this.updateStatus();
        };
    }
}

// レポート生成クラス
class ReportGenerator {
    constructor(elementManager) {
        this.elementManager = elementManager;
    }

    generateReport() {
        const tasks = this.elementManager.getElement('taskList').querySelectorAll('li');
        const reportText = this.generateReportText(tasks);

        navigator.clipboard.writeText(reportText)
            .then(() => this.showCopySuccess())
            .catch(err => this.handleCopyError(err));
    }

    generateReportText(tasks) {
        let reportText = `【${new Date().toLocaleDateString('ja-JP')}の作業内容】\n\n`;

        reportText += "【未完了】\n";
        reportText += this.generateTaskList(tasks, false);

        reportText += "\n\n【完了】\n";
        reportText += this.generateTaskList(tasks, true);

        return reportText;
    }

    generateTaskList(tasks, completed) {
        return Array.from(tasks)
            .filter(task => task.querySelector('input[type="checkbox"]').checked === completed)
            .map(task => `・${task.querySelector('.task-text').textContent}`)
            .join('\n');
    }

    showCopySuccess() {
        const copyBtn = this.elementManager.getElement('copyBtn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'コピーしました！';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }

    handleCopyError(err) {
        console.error('コピーに失敗しました:', err);
        alert('コピーに失敗しました。');
    }
}

// アプリケーションクラス
class TodoApp {
    constructor() {
        this.elementManager = new ElementManager();
        this.taskManager = new TaskManager(this.elementManager);
        this.reportGenerator = new ReportGenerator(this.elementManager);

        document.addEventListener('DOMContentLoaded', () => {
            this.initialize();
            this.setupEventListeners();
        });
    }

    initialize() {
        const dateElement = this.elementManager.getElement('date');
        dateElement.innerText = new Date().toLocaleDateString('ja-JP');
        this.updateStatus();
    }

    setupEventListeners() {
        const elements = this.elementManager.elements;

        elements.addIcon.addEventListener('click', () => elements.newTask.focus());
        elements.newTask.addEventListener('keypress', this.handleNewTaskKeyPress.bind(this));
        elements.taskList.addEventListener('click', this.handleTaskClick.bind(this));
        elements.copyBtn.addEventListener('click', () => this.reportGenerator.generateReport());
    }

    handleNewTaskKeyPress(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.addTask();
        }
    }

    handleTaskClick(e) {
        const target = e.target.tagName === 'LI' ?
            e.target.querySelector('.task-text') :
            e.target;

        if (target?.classList.contains('task-text')) {
            this.handleTaskDoubleClick(target);
        }
    }

    handleTaskDoubleClick(target) {
        if (target.dataset.lastClick && Date.now() - target.dataset.lastClick < 300) {
            this.taskManager.makeEditable(target);
            delete target.dataset.lastClick;
        } else {
            target.dataset.lastClick = Date.now();
        }
    }

    addTask() {
        const newTask = this.elementManager.getElement('newTask');
        const taskText = newTask.value.trim();
        if (!taskText) return;

        const taskElement = this.taskManager.createTask(taskText);
        this.elementManager.getElement('taskList').appendChild(taskElement);
        newTask.value = '';
        this.updateStatus();
    }

    updateStatus() {
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        this.elementManager.getElement('status').innerText = `${time} に編集しました`;
    }
}

// アプリケーションのインスタンス化
const app = new TodoApp();
