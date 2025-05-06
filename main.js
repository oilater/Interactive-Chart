// HTML 요소
const valueTable = document.querySelector(".value-table");
const graphTable = document.querySelector(".graph-table");
const editTextarea = document.querySelector(".advanced-value-textarea");

const addValueButton = document.querySelector(".add-value-button");
const applyEditButton = document.querySelector(".apply-advanced-value-button");

// 이벤트 리스너 추가
addValueButton.addEventListener('click', clickAddValueHandler);
applyEditButton.addEventListener('click', clickApplyEditHandler);

// 전체 데이터를 관리할 객체
let wholeData = {};

// 유저 데이터 클래스
class UserData {
    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.key = crypto.randomUUID(); // 값 삭제 시, 전체 데이터에서 해당 데이터의 키를 식별하기 위한 필드
    }

    // 카드 UI 컴포넌트 생성 메소드
    createCard()
    {
        // 카드 element 초기화
        const userCard = document.createElement("div");
        userCard.className = "user-data";

        // 삭제 버튼 초기화
        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "삭제";
        deleteButton.addEventListener("click", () => this.delete(userCard));

        userCard.innerHTML = `
            <p class="user-id">${this.id}</p>
            <p class="user-value">${this.value}</p>
        `;
        userCard.appendChild(deleteButton);

        valueTable.appendChild(userCard);
    }

    createGraph() {
        const graphWrapper = document.createElement("div");
        const graphValue = document.createElement("div");
        const graph = document.createElement("div");
        const graphBackground = document.createElement("div");
        const graphId = document.createElement("div");

        graphWrapper.className = "graph-wrapper";
        graphId.className = "graph-id";
        graph.className = "graph";
        graphBackground.className = "graph-background";
        graphValue.className = "graph-value";

        graphId.innerHTML = `<p class="graph-id">${this.id}</p>`;
        graphValue.innerHTML = `<p class="graph-value">${this.value}</p>`;

        graphBackground.appendChild(graph);
        graphWrapper.appendChild(graphId);
        graphWrapper.appendChild(graphBackground);
        graphWrapper.appendChild(graphValue);
        graphTable.appendChild(graphWrapper);

        animateGraph(graph, this.value);
    }

    // 값 삭제 시 테이블 및 wholeData에서 삭제하는 메소드
    delete(card) {
        card.remove();
        if (wholeData == null || !wholeData[this.key]) {
            return;
        }
        delete wholeData[this.key];
        updateTextArea();
    }
}

function animateGraph(graph, targetValue)
{
    let height = 0;
    
    function animate() {
        if (height < targetValue) {
        height += 4;
        graph.style.setProperty('--graph-height', `${height}px`);
        requestAnimationFrame(animate);
        }
    }
    animate();
}

// '값 추가' 이벤트 핸들러
function clickAddValueHandler () {
    const idInput = document.querySelector('#id-input');
    const valueInput = document.querySelector('#value-input');

    // id, value의 유효성 검사 후 반환
    const [id, value] = getValidateInput(idInput, valueInput);
    
    const newData = new UserData(id, value);
    
    appendValue(newData);
    updateTextArea();

    idInput.value = "";
    valueInput.value = "";
};

function getValidateInput(idInput, valueInput) {    
    if (!idInput || !valueInput) {
        return;
    }

    const id = idInput.value;
    const value = valueInput.value;

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

function appendValue(newData)
{
    wholeData[newData.key] = newData;
    newData.createCard();
    newData.createGraph();
}

// '값 고급 편집' 이벤트 핸들러
function clickApplyEditHandler()
{
    const textareaInput = document.querySelector('.advanced-value-textarea');

    // JSON 유효성 검사
    let parsedData;
    try {
        parsedData = JSON.parse(textareaInput.value);
    } catch (error) {
        alert("JSON 형식이 올바른 지 확인하세요!");
        return;
    }
    
    // 배열 유효성 검사
    if (!Array.isArray(parsedData)) {
        alert("JSON 배열 형식이 아닙니다!");
        return;
    }

    // 데이터 및 UI 초기화
    wholeData = {};
    valueTable.innerHTML = '';

    // 새로운 데이터 적용
    parsedData.forEach(({ id, value }) => {
        if (id.trim() == null) 
        {
            alert("비어있는 ID 값이 있는지 확인하세요!")
            return;
        }
        const newData = new UserData(id.trim(), value);
        appendValue(newData);
    });
    updateTextArea();
}

// 값 고급 편집 Textarea 업데이트
function updateTextArea()
{
    const dataList = Object.values(wholeData).map(user => ({
        id: user.id,
        value: Number(user.value),
    }));

    if (dataList.length == 0) {
        editTextarea.value = '';
        return;
    } 
    const jsonString = JSON.stringify(dataList, null, 2);
    editTextarea.value = `${jsonString}`
}