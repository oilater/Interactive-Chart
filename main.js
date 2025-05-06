const valueTable = document.querySelector(".value-table");
const addValueButton = document.querySelector(".add-value-button");

// 각 유저 데이터
class UserData {
    constructor(id, value) {
        this.id = id;
        this.value = value;
    }

    render() {
        const userCard = document.createElement("div");
        userCard.className = "user-data";
        userCard.innerHTML = `
            <p class="user-id">${this.id}</p>
            <p class="user-value">${this.value}</p>
        `;
        return userCard;
    }

    appendTo(table) {
        valueTable.appendChild(this.render());
    }
}

// 전체 유저 데이터
const wholeData = {
    0: new UserData("김성현", 10),
    1: new UserData("하잉", 20),
};

// 전체 데이터 테이블 보여주기
Object.values(wholeData).forEach(user => {
    valueTable.appendChild(user.render());
});

// 값 추가 버튼에 이벤트리스너 설정
addValueButton.addEventListener('click', handleAddValueClick);

// 값 추가 버튼 클릭 시 실행될 함수
function handleAddValueClick () {
    const idInput = document.querySelector('#id-input');
    const valueInput = document.querySelector('#value-input');
    
    // 가져온 HTML 요소 null 체크
    if (!idInput || !valueInput)
    {
        alert("F5를 눌러 페이지를 새로고침 하세요!")
        return;
    }

    const id = idInput.value;
    const value = valueInput.value;

    // 유저 입력값에 대한 유효성 검사
    if (!id.trim()) {
        alert("ID를 입력해주세요!");
        return;
    }
    else if (!value.trim()) {
        alert("VALUE를 입력해주세요!");
        return;
    }

    const newUserData = new UserData(id, value);
    wholeData[crypto.randomUUID()] = newUserData;
    newUserData.appendTo(valueTable);
};