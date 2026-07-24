document.addEventListener('DOMContentLoaded', () => {
    displayCurrentDate();
    loadLog();

    document.getElementById('calc-button').addEventListener('click', calculateAndSave);
    calculateAndSave();
});

function displayCurrentDate() {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const day = days[now.getDay()];
    
    document.getElementById('current-date').textContent = `${year}年${month}月${date}日 (${day})`;
}

function getVal(id) {
    const val = document.getElementById(id).value;
    return val ? parseInt(val, 10) : 0;
}

function calculateAndSave() {
    // --- 1. 月の支払額の取得 ---
    const pOlive = getVal('pay-olive');     
    const pPaypay = getVal('pay-paypay');   
    const pMercard = getVal('pay-mercard'); 
    const pKabuand = getVal('pay-kabuand'); 
    const pEneos = getVal('pay-eneos');     
    const pPaidy = getVal('pay-paidy');                    
    const pIpad = getVal('pay-ipad');
    const pAmazon = getVal('pay-amazon');
    const pOther = getVal('pay-other');     

    const totalPayment = pOlive + pPaypay + pMercard + pKabuand + pEneos + pPaidy + pIpad + pAmazon + pOther;
    document.getElementById('total-payment').textContent = totalPayment.toLocaleString();

    // --- 2. 所持金合計額の取得 ---
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
    
    if (diff < 0) {
        overallEl.textContent = `全体で ${Math.abs(diff).toLocaleString()}円 足りてません`;
        overallEl.className = 'overall-result shortage';
    } else {
        overallEl.textContent = `全体で ${diff.toLocaleString()}円 の余裕があります`;
        overallEl.className = 'overall-result surplus';
    }

    // Amazonカードとその他は残高シミュレーション上、初期の所持金から先に差し引いておく
    let currentBalance = totalMoney - pOther - pAmazon; 
    
    const schedules = [
        { label: "26日時点 (Olive引落とし後)", amount: pOlive },
        { label: "27日時点 (PayPay・Paidy・iPad引落とし後)", amount: pPaypay + pPaidy + pIpad },
        { label: "今月末時点 (メルカード引落とし後)", amount: pMercard },
        { label: "翌月2日時点 (エネオス引落とし後)", amount: pEneos },
        { label: "翌月10日時点 (カブアンド引落とし後)", amount: pKabuand }
    ];

    const listEl = document.getElementById('schedule-list');
    listEl.innerHTML = ''; 

    schedules.forEach(schedule => {
        currentBalance -= schedule.amount;
        
        const li = document.createElement('li');
        const nameSpan = document.createElement('span');
        nameSpan.textContent = schedule.label;
        
        const amountSpan = document.createElement('span');
        amountSpan.className = 'amount';
        
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

function saveLog() {
    const data = {
        pOlive: document.getElementById('pay-olive').value,
        pPaypay: document.getElementById('pay-paypay').value,
        pMercard: document.getElementById('pay-mercard').value,
        pKabuand: document.getElementById('pay-kabuand').value,
        pEneos: document.getElementById('pay-eneos').value,
        pPaidy: document.getElementById('pay-paidy').value,
        pIpad: document.getElementById('pay-ipad').value,
        pAmazon: document.getElementById('pay-amazon').value,
        pOther: document.getElementById('pay-other').value,
        mUfj: document.getElementById('money-ufj').value,
        mSmbc: document.getElementById('money-smbc').value,
        mChiba: document.getElementById('money-chiba').value,
        mCash: document.getElementById('money-cash').value,
        mOther: document.getElementById('money-other').value
    };
    localStorage.setItem('paymentAppData', JSON.stringify(data));
}

function loadLog() {
    const savedData = localStorage.getItem('paymentAppData');
    if (savedData) {
        const data = JSON.parse(savedData);
        if(data.pOlive) document.getElementById('pay-olive').value = data.pOlive;
        if(data.pPaypay) document.getElementById('pay-paypay').value = data.pPaypay;
        if(data.pMercard) document.getElementById('pay-mercard').value = data.pMercard;
        if(data.pKabuand) document.getElementById('pay-kabuand').value = data.pKabuand;
        if(data.pEneos) document.getElementById('pay-eneos').value = data.pEneos;
        if(data.pPaidy) document.getElementById('pay-paidy').value = data.pPaidy;
        if(data.pIpad) document.getElementById('pay-ipad').value = data.pIpad;
        if(data.pAmazon) document.getElementById('pay-amazon').value = data.pAmazon;
        if(data.pOther) document.getElementById('pay-other').value = data.pOther;
        if(data.mUfj) document.getElementById('money-ufj').value = data.mUfj;
        if(data.mSmbc) document.getElementById('money-smbc').value = data.mSmbc;
        if(data.mChiba) document.getElementById('money-chiba').value = data.mChiba;
        if(data.mCash) document.getElementById('money-cash').value = data.mCash;
        if(data.mOther) document.getElementById('money-other').value = data.mOther;
    }
}
