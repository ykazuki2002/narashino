document.addEventListener('DOMContentLoaded', () => {
    // DOM要素を取得
    const saveButton = document.getElementById('save-button');
    const scheduleList = document.getElementById('schedule-list');

    // 保存ボタンがクリックされたときの処理
    saveButton.addEventListener('click', () => {
        const garbageType = document.getElementById('garbage-type').value;
        const weekOfMonth = document.getElementById('week-of-month').value;
        const dayOfWeek = document.getElementById('day-of-week').value;
        
        const weekText = document.getElementById('week-of-month').options[document.getElementById('week-of-month').selectedIndex].text;
        const dayText = document.getElementById('day-of-week').options[document.getElementById('day-of-week').selectedIndex].text;

        const schedule = {
            id: Date.now(), // 削除用のユニークID
            type: garbageType,
            week: weekOfMonth, // 'every', '1', '2', ...
            day: dayOfWeek,    // '0', '1', '2', ...
            displayText: `${weekText}${dayText} - ${garbageType}`
        };

        let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
        schedules.push(schedule);
        localStorage.setItem('schedules', JSON.stringify(schedules));
        displaySchedules();
    });

    // スケジュールを画面に表示する関数
    function displaySchedules() {
        scheduleList.innerHTML = '';
        const schedules = JSON.parse(localStorage.getItem('schedules')) || [];
        
        schedules.forEach(schedule => {
            const listItem = document.createElement('li');
            listItem.textContent = schedule.displayText;
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '削除';
            deleteButton.addEventListener('click', () => {
                deleteSchedule(schedule.id);
            });
            
            listItem.appendChild(deleteButton);
            scheduleList.appendChild(listItem);
        });
    }

    // スケジュールを削除する関数
    function deleteSchedule(id) {
        let schedules = JSON.parse(localStorage.getItem('schedules')) || [];
        schedules = schedules.filter(schedule => schedule.id !== id);
        localStorage.setItem('schedules', JSON.stringify(schedules));
        displaySchedules();
    }

    // 特定の日付がその月の「第何週目」かを計算する関数
    function getWeekOfMonth(date) {
        const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
        return Math.ceil((date.getDate() + firstDayOfMonth) / 7);
    }

    // 通知をチェックして実行する関数
    function checkAndNotify() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const tomorrowDay = tomorrow.getDay().toString();
        const tomorrowWeek = getWeekOfMonth(tomorrow).toString();

        const schedules = JSON.parse(localStorage.getItem('schedules')) || [];

        schedules.forEach(schedule => {
            const isDayMatch = schedule.day === tomorrowDay;
            const isWeekMatch = schedule.week === 'every' || schedule.week === tomorrowWeek;

            if (isDayMatch && isWeekMatch) {
                new Notification('🗑️ ゴミ出しのお知らせ', {
                    body: `明日は「${schedule.displayText}」の日です！`,
                    // icon: 'icon.png' // アイコン画像があれば
                });
            }
        });
    }

    // --- 初期化処理 ---
    
    // ページ読み込み時に保存されているスケジュールを表示
    displaySchedules();
    
    // 通知の許可を求める
    Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
            console.log('通知は許可されています。');
            checkAndNotify(); // 許可されたらすぐに一度チェック
        }
    });
});