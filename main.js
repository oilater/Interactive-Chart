const valueTable = document.querySelector(".value-table");
const graphTable = document.querySelector(".graph-table");
const advancedEditTextarea = document.querySelector(".advanced-value-textarea");

const addValueButton = document.querySelector(".add-value-button");
const applyEditButton = document.querySelector(".apply-advanced-value-button");

const graphBackgroundHeight = 20;

addValueButton.addEventListener('click', clickAddValueHandler);
applyEditButton.addEventListener('click', clickApplyEditHandler);

// 전체 Value를 관리할 객체
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
        // graphValue.innerHTML = `<p class="graph-value">${this.value}</p>`;

        graphBackground.appendChild(graph);
        graphWrapper.appendChild(graphId);
        graphWrapper.appendChild(graphBackground);
        graphWrapper.appendChild(graphValue);
        graphTable.appendChild(graphWrapper);

        animateGraph(graph, this.value, graphValue);
    }

    // 값 삭제 시 테이블 및 wholeData에서 삭제하는 메소드
    delete(card) {
        card.remove();
        if (wholeData == null || !wholeData[this.key]) {
            return;
        }
        delete wholeData[this.key];
        updateAdvancedEditTextarea();
    }
}

function animateGraph(graph, targetValue, currentValue)
{
    let height = 0;
    
    function animate() {
        if (height < targetValue) {
        height += 4;
        // 숫자 증가
        currentValue.innerHTML = `<p class="graph-value">${height <= targetValue ? height : targetValue}</p>`;
        // 그래프 높이 증가
        graph.style.setProperty('--graph-height', `${height / 100 * graphBackgroundHeight}rem`);
        requestAnimationFrame(animate);
        }
    }
    animate();
}

// '값 추가' 이벤트 핸들러
function clickAddValueHandler () {
    const idInput = document.querySelector('#id-input').value;
    const valueInput = document.querySelector('#value-input').value;

    // id, value의 유효성 검사 후 반환
    const [id, value] = getValidateInput(idInput, valueInput);
    
    const newData = new UserData(id, value);
    
    appendValue(newData);
    updateAdvancedEditTextarea();

    idInput.value = "";
    valueInput.value = "";
};

function getValidateInput(id, value) {
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
    // 유효성 검사
    let parsedData;
    try {
        parsedData = JSON.parse(advancedEditTextarea.value);
    } catch (error) {
        alert("JSON 형식이 올바른 지 확인하세요!");
        return;
    }
    
    if (!Array.isArray(parsedData)) {
        alert("JSON 배열 형식이 아닙니다!");
        return;
    }

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
    updateAdvancedEditTextarea();
}

// Textarea 업데이트
function updateAdvancedEditTextarea()
{
    const dataList = Object.values(wholeData).map(user => ({
        id: user.id,
        value: Number(user.value),
    }));

    if (dataList.length == 0) {
        advancedEditTextarea.value = '';
        return;
    } 
    const jsonString = JSON.stringify(dataList, null, 2);
    advancedEditTextarea.value = `${jsonString}`
}