document.addEventListener('DOMContentLoaded', function() {
    // 日付を設定
    document.getElementById('date').innerText = new Date().toLocaleDateString('ja-JP');

    // 追加アイコンのイベントリスナー
    document.querySelector('.add-icon').addEventListener('click', function() {
        document.getElementById('newTask').focus();
    });

    // Enterキーでタスク追加
    document.getElementById('newTask').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTask();
        }
    });

    // タスクのクリックイベントを設定
    document.getElementById('taskList').addEventListener('click', function(e) {
        // クリックされた要素がtask-textクラスを持つか確認
        if (e.target && e.target.classList.contains('task-text')) {
            // ダブルクリック検出（300ms以内の2回目のクリック）
            if (e.target.dataset.lastClick && Date.now() - e.target.dataset.lastClick < 300) {
                // ダブルクリックと判断して編集モードに
                makeEditable(e.target);
                // データをリセット
                delete e.target.dataset.lastClick;
            } else {
                // 最初のクリック時に時間を記録
                e.target.dataset.lastClick = Date.now();
            }
        }
    });

    // コピーボタンのイベントリスナー
    document.getElementById('copyBtn').addEventListener('click', copyTasksForReport);

    // 初期ステータス更新
    updateStatus();

    // 初期サンプルタスクを追加
    addSampleTasks();
});

// 要素を編集可能にする
function makeEditable(element) {
    // 現在のテキストを取得
    const currentText = element.textContent;

    // 入力フィールドを作成
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'edit-input';

    // 元の要素を入力フィールドに置き換え
    const parent = element.parentNode;
    parent.replaceChild(input, element);

    // フォーカスを設定
    input.focus();

    // 入力完了時の処理
    function finishEdit() {
        const newText = input.value.trim();
        if (newText !== '') {
            // 新しいspan要素を作成
            const newSpan = document.createElement('span');
            newSpan.textContent = newText;
            newSpan.className = element.className;

            // チェックボックスの状態を確認して完了クラスを追加
            const checkbox = parent.querySelector('input[type="checkbox"]');
            if (checkbox && checkbox.checked) {
                newSpan.classList.add('completed');
            }

            // 入力フィールドをspan要素に置き換え
            parent.replaceChild(newSpan, input);

            // ステータスを更新
            updateStatus();
        } else {
            // 空の場合は元のテキストに戻す
            const newSpan = document.createElement('span');
            newSpan.textContent = currentText;
            newSpan.className = element.className;
            parent.replaceChild(newSpan, input);
        }
    }

    // Enterキーで編集完了
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            finishEdit();
        }
    });

    // フォーカスが外れたときも編集完了
    input.addEventListener('blur', finishEdit);
}

// ステータス表示の更新
function updateStatus() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    document.getElementById('status').innerText =
        `${hours}:${minutes} に編集しました`;
}

// タスクの追加
function addTask() {
    const taskText = document.getElementById('newTask').value.trim();
    if (taskText === '') return;

    const li = document.createElement('li');

    // チェックボックスの作成
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';

    // タスクテキストの作成
    const span = document.createElement('span');
    span.textContent = taskText;
    span.className = 'task-text';

    // チェックボックスのイベントリスナー
    checkbox.addEventListener('change', function() {
        span.classList.toggle('completed', this.checked);
    });

    // 要素を追加
    li.appendChild(checkbox);
    li.appendChild(span);
    document.getElementById('taskList').appendChild(li);

    // 入力フィールドをクリア
    document.getElementById('newTask').value = '';

    // ステータスを更新
    updateStatus();
}

// サンプルタスクを追加
function addSampleTasks() {
    const tasks = [];

    // 既存のタスクをクリア
    document.getElementById('taskList').innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';

        const span = document.createElement('span');
        span.textContent = task;
        span.className = 'task-text';

        // MEO案件：開発定例以外はチェック済みとして表示
        if (task !== 'MEO案件：開発定例') {
            checkbox.checked = true;
            span.classList.add('completed');
        }

        // チェックボックスのイベントリスナー
        checkbox.addEventListener('change', function() {
            span.classList.toggle('completed', this.checked);
        });

        li.appendChild(checkbox);
        li.appendChild(span);
        document.getElementById('taskList').appendChild(li);
    });
}

// 日報用にタスクをコピー
function copyTasksForReport() {
    const taskList = document.getElementById('taskList');
    const tasks = taskList.querySelectorAll('li');

    let reportText = `【${new Date().toLocaleDateString('ja-JP')}の作業内容】\n`;

    // 未完了タスク
    reportText += "\n【未完了】\n";
    tasks.forEach(task => {
        const checkbox = task.querySelector('input[type="checkbox"]');
        const taskText = task.querySelector('.task-text');

        if (!checkbox.checked && taskText) {
            reportText += `・${taskText.textContent}\n`;
        }
    });

    // 完了タスク
    reportText += "\n【完了】\n";
    tasks.forEach(task => {
        const checkbox = task.querySelector('input[type="checkbox"]');
        const taskText = task.querySelector('.task-text');

        if (checkbox.checked && taskText) {
            reportText += `・${taskText.textContent}\n`;
        }
    });

    // クリップボードにコピー
    navigator.clipboard.writeText(reportText)
        .then(() => {
            // コピー成功
            const copyBtn = document.getElementById('copyBtn');
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'コピーしました！';

            // 2秒後に元のテキストに戻す
            setTimeout(() => {
                copyBtn.textContent = originalText;
            }, 2000);
        })
        .catch(err => {
            console.error('コピーに失敗しました:', err);
            alert('コピーに失敗しました。');
        });
}
