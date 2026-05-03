document.addEventListener('DOMContentLoaded', () => {
    // ページ上部に今日の日付を表示
    displayCurrentDate();

    // 前回保存した入力ログを復元
    loadLog();

    // 「計算・保存する」ボタンが押された時の処理
    document.getElementById('calc-button').addEventListener('click', calculateAndSave);
    
    // 初回表示時にも一度計算を走らせておく
    calculateAndSave();
});

// 日付を取得して表示する関数
function displayCurrentDate() {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const day = days[now.getDay()];
    
    document.getElementById('current-date').textContent = `${year}年${month}月${date}日 (${day})`;
}

// 入力欄から数値を取得する関数（未入力は0として扱う）
function getVal(id) {
    const val = document.getElementById(id).value;
    return val ? parseInt(val, 10) : 0;
}

// メインの計算処理と保存
function calculateAndSave() {
    // --- 1. 月の支払額の取得と合計 ---
    const pOlive = getVal('pay-olive');     // 26日
    const pPaypay = getVal('pay-paypay');   // 27日
    const pMercard = getVal('pay-mercard'); // 今月末
    const pKabuand = getVal('pay-kabuand'); // 翌月10日
    const pEneos = getVal('pay-eneos');     // 翌月2日
    const pPaidy = 4656;                    // 27日 (固定)
    const pIpad = 6566;                     // 27日 (固定)
    const pOther = getVal('pay-other');     // その他

    const totalPayment = pOlive + pPaypay + pMercard + pKabuand + pEneos + pPaidy + pIpad + pOther;
    document.getElementById('total-payment').textContent = totalPayment.toLocaleString();

    // --- 2. 所持金合計額の取得と合計 ---
    const mUfj = getVal('money-ufj');
    const mSmbc = getVal('money-smbc');
    const mChiba = getVal('money-chiba');
    const mCash = getVal('money-cash');
    const mOther = getVal('money-other');

    const totalMoney = mUfj + mSmbc + mChiba + mCash + mOther;
    document.getElementById('total-money').textContent = totalMoney.toLocaleString();

    // --- 3. 現在不足分の計算 ---
    const diff = totalMoney - totalPayment;
    const overallEl = document.getElementById('overall-shortage');
    
    // 全体での不足判定
    if (diff < 0) {
        overallEl.textContent = `全体で ${Math.abs(diff).toLocaleString()}円 足りてません`;
        overallEl.className = 'overall-result shortage';
    } else {
        overallEl.textContent = `全体で ${diff.toLocaleString()}円 の余裕があります`;
        overallEl.className = 'overall-result surplus';
    }

    // 日付順に所持金から引いていくシミュレーション
    // ※「その他」の支払いは日付指定がないため、安全のために最初から引いた状態で計算します
    let currentBalance = totalMoney - pOther; 
    
    // 支払いの順番リスト
    const schedules = [
        { name: "26日 (Olive)", amount: pOlive },
        { name: "27日 (PayPay, Paidy, iPad)", amount: pPaypay + pPaidy + pIpad },
        { name: "今月末 (メルカード)", amount: pMercard },
        { name: "翌月2日 (エネオス)", amount: pEneos },
        { name: "翌月10日 (カブアンド)", amount: pKabuand }
    ];

    const listEl = document.getElementById('schedule-list');
    listEl.innerHTML = ''; // リストを一度リセット

    // 各支払日のタイミングで残高を計算し、画面に追加
    schedules.forEach(schedule => {
        currentBalance -= schedule.amount;
        
        const li = document.createElement('li');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = `${schedule.name} 引落とし後`;
        
        const amountSpan = document.createElement('span');
        amountSpan.className = 'amount';
        
        // その時点でマイナスに転じていれば赤字で「足りてません」と表示
        if (currentBalance < 0) {
            li.className = 'warning';
            amountSpan.textContent = `${Math.abs(currentBalance).toLocaleString()}円 足りてません`;
        } else {
            amountSpan.textContent = `残金: ${currentBalance.toLocaleString()}円`;
        }

        li.appendChild(nameSpan);
        li.appendChild(amountSpan);
        listEl.appendChild(li);
    });

    // --- 4. 入力ログの保存 ---
    saveLog();
}

// localStorageに入力内容を保存
function saveLog() {
    const data = {
        pOlive: document.getElementById('pay-olive').value,
        pPaypay: document.getElementById('pay-paypay').value,
        pMercard: document.getElementById('pay-mercard').value,
        pKabuand: document.getElementById('pay-kabuand').value,
        pEneos: document.getElementById('pay-eneos').value,
        pOther: document.getElementById('pay-other').value,
        mUfj: document.getElementById('money-ufj').value,
        mSmbc: document.getElementById('money-smbc').value,
        mChiba: document.getElementById('money-chiba').value,
        mCash: document.getElementById('money-cash').value,
        mOther: document.getElementById('money-other').value
    };
    localStorage.setItem('paymentAppData', JSON.stringify(data));
}

// localStorageから入力内容を復元
function loadLog() {
    const savedData = localStorage.getItem('paymentAppData');
    if (savedData) {
        const data = JSON.parse(savedData);
        if(data.pOlive) document.getElementById('pay-olive').value = data.pOlive;
        if(data.pPaypay) document.getElementById('pay-paypay').value = data.pPaypay;
        if(data.pMercard) document.getElementById('pay-mercard').value = data.pMercard;
        if(data.pKabuand) document.getElementById('pay-kabuand').value = data.pKabuand;
        if(data.pEneos) document.getElementById('pay-eneos').value = data.pEneos;
        if(data.pOther) document.getElementById('pay-other').value = data.pOther;
        if(data.mUfj) document.getElementById('money-ufj').value = data.mUfj;
        if(data.mSmbc) document.getElementById('money-smbc').value = data.mSmbc;
        if(data.mChiba) document.getElementById('money-chiba').value = data.mChiba;
        if(data.mCash) document.getElementById('money-cash').value = data.mCash;
        if(data.mOther) document.getElementById('money-other').value = data.mOther;
    }
}