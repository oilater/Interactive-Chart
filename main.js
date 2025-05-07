// 상수 선언 및 HTML 요소 설정
const graphBackgroundHeight = 20;
const graphAnimationDuration = 1000;

const graphSection = document.querySelector(".graph-section");
const editSection = document.querySelector(".edit-value-section");
const editAdvanceSection = document.querySelector(".edit-advanced-value-section");

const addSectionText = document.querySelector(".add-value-description");
const valueTable = document.querySelector(".value-table");
const graphTable = document.querySelector(".graph-table");
const editTextarea = document.querySelector(".advanced-value-textarea");

const addValueButton = document.querySelector(".add-value-button");
const applyEditButton = document.querySelector(".apply-advanced-value-button");

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
        const deleteButton = card.querySelector('.card-delete-button');
        const editButton = card.querySelector('.card-delete-button');

        // 그래프 생성
        const graphTemplate = document.querySelector('.graph-template').content.cloneNode(true);
        const graph = graphTemplate.querySelector('.graph-wrapper');
        const graphValue = graph.querySelector('.graph-value');
        const graphBar = graph.querySelector('.graph');
        const graphId = graph.querySelector('.graph-id');
        graphId.textContent = this.id;

        // 삭제 시 이벤트 설정
        deleteButton.addEventListener("click", () => {
            card.classList.add("fade-out");
            graph.classList.add("fade-out");
            card.addEventListener('animationend', () => this.delete(card, graph));
        });

        // 생성한 카드, 그래프를 UI에 추가
        valueTable.appendChild(card);
        graphTable.appendChild(graph);
        animateGraph(graphBar, this.value, graphValue);
    }

    delete(card, graph) {
        if (!wholeData[this.key]) return;
        delete wholeData[this.key];
        card.remove();
        graph.remove();
        updateEditTextarea();
        updateSection();
    }
}

// 이벤트 리스너 등록
const init = () => {
    updateSection();
    addValueButton.addEventListener('click', clickAddValueHandler);
    applyEditButton.addEventListener('click', clickApplyEditHandler);
};

// 값 추가 클릭 시 실행
const clickAddValueHandler = () => {
    const idInput = document.querySelector('#id-input').value;
    const valueInput = document.querySelector('#value-input').value;

    // id, value의 유효성 검사 후 반환
    const [id, value] = getValidateInput(idInput, valueInput);
    if (!id || !value) return;

    const newData = new Data(id, value);
    updateUI(newData);

    document.querySelector('#id-input').value = "";
    document.querySelector('#value-input').value = "";
};

// 값 고급 편집 클릭 시 실행
const clickApplyEditHandler = () => {
    // JSON 파싱
    let parsedData;
    try {
        parsedData = JSON.parse(editTextarea.value);
    } catch {
        alert("JSON 형식이 올바른지 확인하세요!");
        return;
    }

    if (!Array.isArray(parsedData)) {
        alert("JSON 배열 형식이 아닙니다!");
        return;
    }

    // 데이터 및 UI 초기화
    wholeData = {};
    valueTable.replaceChildren();
    graphTable.replaceChildren();

    // 파싱 된 데이터로 대체
    parsedData.forEach(({ id, value }) => {
        if (!id.trim()) {
            alert("빈 아이디 값이 있는지 확인하세요!");
            return;
        }
        const newData = new Data(id.trim(), value);
        updateUI(newData);
    });
};

const getValidateInput = (id, value) => {
    if (!id.trim()) {
        alert("아이디를 입력해주세요!");
        return [null, null];
    } else if (!value.trim()) {
        alert("값을 입력해주세요!");
        return [null, null];
    } else if (isNaN(value)) {
        alert("숫자 값만 입력해주세요!");
        return [null, null];
    }
    return [id, value];
};

const updateUI = (data) => {
    data.createUI();
    wholeData[data.key] = data;
    updateEditTextarea();
};

const updateEditTextarea = () => {
    const dataList = Object.values(wholeData).map(user => ({
        id: user.id,
        value: Number(user.value),
    }));
    editTextarea.value = dataList.length === 0 ? '' : JSON.stringify(dataList, null, 2);
    updateSection();
};

// 그래프 애니메이션 실행 함수
const animateGraph = (graph, targetValue, currentValue) => {
    let height = 0;
    const startTime = performance.now();
    const interactiveColor = targetValue >= 100 ? '#1873cc' : targetValue >= 50 ? 'dodgerblue' : '#1e90ff80';

    const animate = (time) => {
        const progress = (time - startTime) / graphAnimationDuration;
        height = Math.min(progress * targetValue, targetValue);

        currentValue.textContent = Math.floor(height);
        currentValue.style.setProperty('--graph-value-color', interactiveColor);

        graph.style.setProperty('--graph-height', `${height / 100 * graphBackgroundHeight}rem`);
        graph.style.setProperty('--graph-color', interactiveColor);

        if (progress < 1) 
            requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
};

const updateSection = () => {
    if (Object.keys(wholeData).length == 0) {
        addSectionText.textContent = "아직 데이터가 없네요. 새로운 데이터를 추가해보세요!"
        graphSection.style.display = 'none';
        editSection.style.display = 'none';
        editAdvanceSection.style.display = 'none';

    } else {
        addSectionText.textContent = "새로운 값을 추가하면 그래프가 달라져요!"
        graphSection.style.display = '';
        editSection.style.display = '';
        editAdvanceSection.style.display = '';
    }
}

init();