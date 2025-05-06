// HTML 요소 가져오기
const valueTable = document.querySelector(".value-table");
const advanceValueTextarea = document.querySelector(".advanced-value-textarea");

const addValueButton = document.querySelector(".add-value-button");
const applyEditButton = document.querySelector(".apply-advanced-value-button");

// 이벤트 리스너 추가
addValueButton.addEventListener('click', handleAddValueClick);
applyEditButton.addEventListener('click', handleApplyEditClick);

// 전체 데이터를 관리할 객체
const wholeData = {};

// 유저 데이터 class
class UserData {
    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.key = crypto.randomUUID();
    }

    // 각 userCard를 생성하는 메소드
    render() {
        const userCard = createUserCard(this);
        return userCard;
    }

    // 값 추가 시 테이블에 추가하는 메소드
    appendTo(table) {
        table.appendChild(this.render());
    }

    // 값 삭제 시 테이블 및 wholeData에서 삭제하는 메소드
    delete(userCard) {
        // 카드 삭제
        userCard.remove();

        // 데이터 삭제
        if (wholeData == null || !wholeData[this.key]) {
            return;
        }
        delete wholeData[this.key];
        console.log(wholeData); // 삭제
    }
}

// 화면에 모든 유저의 id, value를 보여주기 위해 호출하는 함수
function createUserCard(userData)
{
    // 카드 element 생성
    const userCard = document.createElement("div");
    userCard.className = "user-data";

    // 삭제 버튼 및 이벤트 리스너 설정
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "삭제";
    deleteButton.className = "delete-button";
    deleteButton.addEventListener("click", () => userData.delete(userCard));

    // 카드엔 유저의 id와 value, 삭제 버튼을 보여줌
    userCard.innerHTML = `
        <p class="user-id">${userData.id}</p>
        <p class="user-value">${userData.value}</p>
    `;
    userCard.appendChild(deleteButton);

    // 완성된 카드를 반환
    return userCard;
}

// Add 버튼 클릭 시 실행되는 이벤트리스너
function handleAddValueClick () {
    // 유저가 입력한 id, value의 element
    const idInput = document.querySelector('#id-input');
    const valueInput = document.querySelector('#value-input');

    // null 및 유효성 검사 후 반환
    const [id, value] = getValidateInput(idInput, valueInput);
    
    const newData = new UserData(id, value);
    // UI와 Data 객체에 값 추가
    setData(newData);

    idInput.value = "";
    valueInput.value = "";
};

function getValidateInput(idInput, valueInput)
{    
    // HTML element에 대한 null 체크
    if (!idInput || !valueInput)
    {
        alert("F5를 눌러 페이지를 새로고침 하세요!")
        return;
    }

    const id = idInput.value;
    const value = valueInput.value;

    // 유저가 입력한 id, value에 대한 유효성 검사
    if (!id.trim()) {
        alert("ID를 입력해주세요!");
        return;
    }
    else if (!value.trim()) {
        alert("VALUE를 입력해주세요!");
        return;
    }

    return [id, value];
}

function setData(newData)
{
    // wholeData 객체에 추가
    wholeData[newData.key] = newData;
    // 테이블에 그려줌
    newData.appendTo(valueTable);
}

// 고급 수정 Apply 버튼 클릭 시 실행되는 이벤트리스너
function handleApplyEditClick()
{

}