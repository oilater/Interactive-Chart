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

class UserData {
    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.key = crypto.randomUUID();
    }

    createCard() {
        const template = document.querySelector('#card-template');
        const clone = template.content.cloneNode(true);
    
        const card = clone.querySelector('.user-data');
        card.querySelector('.user-id').textContent = this.id;
        card.querySelector('.user-value').textContent = this.value;
    
        const deleteButton = card.querySelector('.delete-button');
        deleteButton.addEventListener("click", () => this.delete(card));
    
        valueTable.appendChild(card);
    }

    createGraph() {
        const template = document.querySelector('#graph-template');
        const clone = template.content.cloneNode(true);
    
        const graphWrapper = clone.querySelector('.graph-wrapper');
        const graph = graphWrapper.querySelector('.graph');
        const graphValue = graphWrapper.querySelector('.graph-value');
        const graphId = graphWrapper.querySelector('.graph-id');
    
        graphId.textContent = this.id;
    
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

function animateGraph(graph, targetValue, currentValue) {
    let height = 0;
    const animationDuration = 600;
    const startTime = performance.now();

    function animate(time) {
        const progress = (time - startTime) / animationDuration;
        height = Math.min(progress * targetValue, targetValue);

        // 숫자 애니메이션 및 색상 설정
        currentValue.innerHTML = `<p class="graph-value">${height <= targetValue ? Math.floor(height) : targetValue}</p>`;
        currentValue.style.setProperty('--graph-value-color', `${targetValue >= 100 ? '#1873cc' : targetValue >= 50 ? 'dodgerblue' : '#1e90ff80'}`);
        
        // 그래프 높이 애니메이션 및 색상 설정
        graph.style.setProperty('--graph-height', `${height / 100 * graphBackgroundHeight}rem`);
        graph.style.setProperty('--graph-color', `${targetValue >= 100 ? '#1873cc' : targetValue >= 50 ? 'dodgerblue' : '#1e90ff80'}`);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}
// 값 추가 클릭 이벤트
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

function appendValue(newData) {
    wholeData[newData.key] = newData;
    newData.createCard();
    newData.createGraph();
}

// 값 고급 편집 클릭 이벤트
function clickApplyEditHandler() {
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

function updateAdvancedEditTextarea() {
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