const graphBackgroundHeight = 20;
const graphAnimationDuration = 600;

const valueTable = document.querySelector(".value-table");
const graphTable = document.querySelector(".graph-table");
const advancedEditTextarea = document.querySelector(".advanced-value-textarea");

const addValueButton = document.querySelector(".add-value-button");
const applyEditButton = document.querySelector(".apply-advanced-value-button");

addValueButton.addEventListener('click', clickAddValueHandler);
applyEditButton.addEventListener('click', clickApplyEditHandler);

// 전체 Value를 관리할 객체
let wholeData = {};

class Data {
    constructor(id, value) {
        this.id = id;
        this.value = value;
        this.key = crypto.randomUUID();
    }

    createUI() {
        // 만들어 둔 HTML 템플릿을 복사해 카드 생성
        const clonedCard = document.querySelector('.card-template').content.cloneNode(true);
        const card = clonedCard.querySelector('.card-wrapper');
        card.querySelector('.card-id').textContent = this.id;
        card.querySelector('.card-value').textContent = this.value;
        const deleteButton = card.querySelector('.delete-button');
        
        // 그래프 생성
        const graphTemplate = document.querySelector('.graph-template').content.cloneNode(true);
        const graphWrapper = graphTemplate.querySelector('.graph-wrapper');
        const graphValue = graphWrapper.querySelector('.graph-value');
        const graphBar = graphWrapper.querySelector('.graph');
        const graphId = graphWrapper.querySelector('.graph-id');
        graphId.textContent = this.id;
        
        // 삭제 시 이벤트 설정
        deleteButton.addEventListener("click", () => this.delete(card, graphWrapper));
        
        // 생성한 카드, 그래프를 UI에 추가
        valueTable.appendChild(card);
        graphTable.appendChild(graphWrapper);
        animateGraph(graphBar, this.value, graphValue);
    }

    delete(card, graph) {
        if (!wholeData[this.key]) {    
            return;
        }
        delete wholeData[this.key];
        card.remove();
        graph.remove();
        updateEditTextarea();
    }
}

// 그래프 애니메이션 실행 함수
function animateGraph(graph, targetValue, currentValue) {
    let height = 0;
    const startTime = performance.now();
    const interactiveColor = targetValue >= 100 ? '#1873cc' : targetValue >= 50 ? 'dodgerblue' : '#1e90ff80';

    function animate(time) {
        const progress = (time - startTime) / graphAnimationDuration;
        height = Math.min(progress * targetValue, targetValue);

        // 숫자 애니메이션 및 색상 설정
        currentValue.textContent = height <= targetValue ? Math.floor(height) : targetValue;
        currentValue.style.setProperty('--graph-value-color', interactiveColor);
        
        // 그래프 높이 애니메이션 및 색상 설정
        graph.style.setProperty('--graph-height', `${height / 100 * graphBackgroundHeight}rem`);
        graph.style.setProperty('--graph-color', interactiveColor);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

// 값 추가 클릭 시 실행되는 함수
function clickAddValueHandler () {
    const idInput = document.querySelector('#id-input').value;
    const valueInput = document.querySelector('#value-input').value;

    // id, value의 유효성 검사 후 반환
    const [id, value] = getValidateInput(idInput, valueInput);
    
    if (!id || !value) {
        return;
    }
    const newData = new Data(id, value);
    applyNewData(newData);

    idInput.value = "";
    valueInput.value = "";
};

function getValidateInput(id, value) {
    if (!id.trim()) {
        alert("ID를 입력해주세요!");
        return [null, null];
    }
    else if (!value.trim()) {
        alert("VALUE를 입력해주세요!");
        return [null, null];
    }

    return [id, value];
}

function applyNewData(data) {
    data.createUI();
    wholeData[data.key] = data;
    updateEditTextarea();
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
        const newData = new Data(id.trim(), value);
        applyNewData(newData);
    });
}

function updateEditTextarea() {
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