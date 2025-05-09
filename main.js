// 상수 선언
const MAX_VALUE_LENGTH = 7;
const GRAPH_BG_HEIGHT = 20;
const GRAPH_ANIMATION_DURATION = 600;
const COLOR_HIGH_VALUE = '#1873cc';
const COLOR_MEDIUM_VALUE = 'dodgerblue';
const COLOR_LOW_VALUE = '#1e90ff80';
const ACTIVE_COLOR = 'active-button';

// 효율적인 렌더링을 위한 상태 분기
const RenderStatus = Object.freeze({
    ALL: Symbol('ALL'),
    ADD: Symbol('ADD'),
    DELETE: Symbol('DELETE'),
    EDIT: Symbol('EDIT'),
  });

// DOM 엘리먼트
const graphSection = document.querySelector(".graph-section");
const editSection = document.querySelector(".edit-value-section");
const addSection = document.querySelector(".add-value-section");
const editAdvanceSection = document.querySelector(".edit-advanced-value-section");
const cardTable = document.querySelector(".value-card-table");
const graphTable = document.querySelector(".graph-table");
const jsonTextarea = document.querySelector(".advanced-value-textarea");
const addValueButton = document.querySelector(".add-value-button");
const applyAdvancedValueButton = document.querySelector(".apply-advanced-value-button");
const inputFeedBackText = document.querySelector(".feedback-text");
const jsonFeedbackText = document.querySelector(".json-feedback-text");
const idInput = document.querySelector("#id-input");
const valueInput = document.querySelector("#value-input");

// Data 인스턴스를 관리할 객체
let wholeData = {};

class Data {
    constructor(id, value) {
        this.id = id;
        this.value = Number(value);
        this.key = crypto.randomUUID();
    }

    toJSON() {
        return { id: this.id, value: this.value };
    }
}

// RenderStatus를 인자로 받아 렌더링 범위를 결정
const renderUI = (status = RenderStatus.ALL, data = null) => {
    // 값 삭제와 편집의 경우, 생성 시에 설정한 data-id를 통해 요소를 가져옴
    const selectedGraph = graphTable.querySelector(`.graph-wrapper[data-id="${data?.key}"]`);
    const selectedCard = cardTable.querySelector(`.card-wrapper[data-id="${data?.key}"]`);
    
    switch (status) {
        case RenderStatus.ALL:
            // 그래프 및 카드 테이블 초기화
            graphTable.replaceChildren();
            cardTable.replaceChildren();
            
            Object.values(wholeData).forEach((data) => {
                renderGraph(data);
                renderCard(data);
            });
            break;

        case RenderStatus.ADD:
            renderGraph(data);
            renderCard(data);
            break;

        case RenderStatus.EDIT:
            if (!selectedGraph || !selectedCard) return;
            updateGraph(data, selectedGraph);
            updateCard(data, selectedCard);
            break;
        
        case RenderStatus.DELETE:
            if (!selectedGraph || !selectedCard) return;
            selectedGraph.remove()
            selectedCard.remove();
            break;
    }
    updateJSONTextarea();
    updateSectionVisibility();
    displayGraphAddButton();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 스크롤 맨 위로 이동
};

const renderGraph = (data) => {
    // 만들어 둔 HTML 템플릿을 복사해 그래프 생성
    const template = document.querySelector('.graph-template').content.cloneNode(true);
    const graph = template.querySelector('.graph-wrapper');

    initGraph(data, graph);
    graphTable.appendChild(graph);
};

const initGraph = (data, graph) => {
    const graphId = graph.querySelector('.graph-id');
    const graphValue = graph.querySelector('.graph-value');
    const barElement = graph.querySelector('.graph');
    graph.dataset.id = data.key; // 편집 및 삭제 시 참조하기 위한 data-id 적용
    graphId.textContent = data.id;
    animateGraph(data.value, barElement, graphValue);
}

const animateGraph = (targetValue, barElement, valueText) => {
    const color = getColor(targetValue);
    const startTime = performance.now();
    const originValue = parseInt(valueText.textContent) || 0;
    const delta = targetValue - originValue;
    
    const animate = (time) => {
        const progress = Math.min((time - startTime) / GRAPH_ANIMATION_DURATION, 1);
        const currentValue = originValue + delta * progress;
        
        valueText.textContent = Math.floor(currentValue);
        valueText.style.setProperty('--graph-value-color', color);
        barElement.style.setProperty('--graph-height', `${(currentValue / 100) * GRAPH_BG_HEIGHT}rem`);
        barElement.style.setProperty('--graph-color', color);

        if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
};

// 편집한 값에 해당하는 그래프 업데이트
const updateGraph = (data, graph) => {
    const graphBar = graph.querySelector('.graph');
    const graphValue = graph.querySelector('.graph-value');
    animateGraph(data.value, graphBar, graphValue);
};

const renderCard = (data) => {
    const template = document.querySelector('.card-template').content.cloneNode(true);
    const card = template.querySelector('.card-wrapper');

    initCard(data, card);
    cardTable.appendChild(card);
};

// 생성한 카드 초기화
const initCard = (data, card) => {
    const cardId = card.querySelector('.card-id');
    const cardValue = card.querySelector('.card-value');
    const editButton = card.querySelector('.card-edit-button');
    const deleteButton = card.querySelector('.card-delete-button');

    card.dataset.id = data.key; // 값 편집 및 삭제 시 카드를 참조하기 위한 data-id 적용
    cardId.textContent = data.id;
    cardValue.value = data.value;
    const color = getColor(data.value); // value에 따라 색상을 지정
    cardValue.style.color = color;
    card.style.borderColor = color;

    deleteButton.addEventListener("click", (e) => onDeleteData(e, data, card));
    editButton.addEventListener("click", (e) => onEditData(e, data, card));
}

const onDeleteData = (e, data, card) => {
    e.preventDefault();
    clearFields();
    card.classList.add("fade-out");
    // fadeOut 애니메이션 종료 후 카드를 삭제
    card.addEventListener("animationend", () => {
        delete wholeData[data.key];
        renderUI(RenderStatus.DELETE, data);
    });
}

// 카드의 수정 버튼 클릭 시
const onEditData = (e, data, card) => {
    e.preventDefault();
    const cardValue = card.querySelector('.card-value');
    
    // 편집 모드 진입
    const enterEditMode = () => {
        card.classList.add('editing');
        cardValue.removeAttribute('readonly');
        cardValue.focus();

        // 버튼 클릭 시 이벤트 처리
        cancelButton.addEventListener('click', onCancelEdit);
        confirmButton.addEventListener('click', onConfirmEdit);
    };

    // 편집 모드 종료
    const exitEditMode = () => {
        card.classList.remove('editing');
        cardValue.setAttribute('readonly', true);
        // 이벤트 리스너 해제
        cancelButton.removeEventListener('click', onCancelEdit);
        confirmButton.removeEventListener('click', onConfirmEdit);
    };

    // 편집 모드에서 확인 버튼을 누를 때
    const onConfirmEdit = (e) => {
        e.preventDefault();
        const newValue = Number(cardValue.value);

        if (!isNaN(newValue)) {
            data.value = newValue;
            renderUI(RenderStatus.EDIT, data);
            exitEditMode();
        } else {
            alert("숫자 값만 입력해주세요!");
        }
    };

    // 편집 모드에서 취소 버튼을 누를 때
    const onCancelEdit = (e) => {
        e.preventDefault();
        cardValue.value = data.value; // 원래 값으로 되돌림
        exitEditMode();
    };

    // 편집 적용 여부를 결정하는 '취소', '확인' 버튼
    const cancelButton = card.querySelector('.edit-cancel-button');
    const confirmButton = card.querySelector('.edit-confirm-button');

    enterEditMode(); // 편집 모드 진입
};

const getColor = (value) => {
    return value >= 100 ? COLOR_HIGH_VALUE : value >= 50 ? COLOR_MEDIUM_VALUE : COLOR_LOW_VALUE;
};

// 편집한 값에 해당하는 카드 업데이트
const updateCard = (data, card) => {
    const cardValue = card.querySelector('.card-value');
    cardValue.textContent = data.value;
    const color = getColor(data.value);
    cardValue.style.color = color;
    card.style.borderColor = color;
};

// Textarea에 JSON 반영
const updateJSONTextarea = () => {
    const dataList = Object.values(wholeData).map((data) => data.toJSON());
    jsonTextarea.value = dataList.length !=0 ? JSON.stringify(dataList, null, 2) : '';
};

// 데이터 수에 따라 각 Section 표시 여부 결정
const updateSectionVisibility = () => {
    const hasData = Object.keys(wholeData).length > 0;
    let addDescription;
    let advancedEditTitle;
    let sectionVisibility;

    if (hasData) {
        addSection.classList.remove('no-value');
        addDescription = "새로운 값을 추가하면 그래프가 달라져요!";
        advancedEditTitle = "JSON으로 값 편집하기";
        sectionVisibility = '';
    } else {
        addSection.classList.add('no-value');
        addDescription = "아직 데이터가 없네요. 새로운 값을 추가해보세요!";
        advancedEditTitle = "JSON으로 값 추가하기";
        sectionVisibility = 'none';
        idInput.focus();
    }
    
    document.querySelector(".add-value-description").textContent = addDescription;
    document.querySelector(".edit-advanced-title").textContent = advancedEditTitle;
    graphSection.style.display = sectionVisibility;
    editSection.style.display = sectionVisibility;
};

// 가장 끝에 있는 그래프의 오른쪽에 + 버튼을 추가
const displayGraphAddButton = () => {
    const graphs = document.querySelectorAll('.graph-wrapper');
    if (graphs.length === 0) return;
    const lastButton = graphs[graphs.length - 1].querySelector('.graph-add-button');
    if (!lastButton) return;
    
    lastButton.addEventListener('click', () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        idInput.focus({preventScroll: true});
    });
}

// 초기화
const clearFields = () => {
    idInput.value = '';
    valueInput.value = '';
    inputFeedBackText.textContent = '';
    jsonFeedbackText.textContent = '';
    addValueButton.classList.remove(ACTIVE_COLOR);
    applyAdvancedValueButton.classList.remove(ACTIVE_COLOR);
}

const setEventListeners = () => {
    // Input의 입력 이벤트를 받아 체크 후 feedback 텍스트, 버튼 색 결정
    const onCheckInput = (e) => {
        e.preventDefault();
        const id = idInput.value.trim();
        const value = valueInput.value.trim();
        let feedback = '';
        addValueButton.classList.remove(ACTIVE_COLOR);
        
        const isValueValidNumber = !isNaN(value);
        if (!id && !value) {
            feedback = '* 아이디와 값을 입력해주세요.';
        } else if (!id) {
            feedback = '* 아이디를 입력해주세요.';
        } else if (!value) {
            feedback = '* 값을 입력해주세요.';
        } else if (!isValueValidNumber) {
            feedback = '* 값은 숫자만 입력할 수 있어요.';
        } else {
            feedback = '';
            addValueButton.classList.add(ACTIVE_COLOR);
        }
        inputFeedBackText.textContent = feedback;
    };

    // 고급 값 편집 Textarea의 입력 이벤트를 받아 체크 후 버튼 색 결정
    const onCheckTextarea = (e) => {
        e.preventDefault();
        const text = jsonTextarea.value;

        if (text.trim()) {
            applyAdvancedValueButton.classList.add(ACTIVE_COLOR);
        } else {
            applyAdvancedValueButton.classList.remove(ACTIVE_COLOR);
        }
    };

    const onAddValue = (e) => {
        e.preventDefault();
        const id = idInput.value;
        const value = valueInput.value;
        if (!isInputValidate(id, value)) return;
        
        const newData = new Data(id, value);
        wholeData[newData.key] = newData;
        
        renderUI(RenderStatus.ADD, newData);
        clearFields();
    };

    const onApplyAdvancedValue = (e) => {
        e.preventDefault();
        try {
            // JSON 파싱
            const parsed = JSON.parse(jsonTextarea.value);
            
            // 유효성 검사
            if (!Array.isArray(parsed) || parsed.length == 0) {
                jsonFeedbackText.textContent = "* 올바른 형식의 JSON을 입력해주세요.";
                return;
            }
            // 전체 데이터 비우기
            wholeData = {};

            // 데이터 생성
            for (const { id, value } of parsed) {
                if (!id.trim()) {
                    jsonFeedbackText.textContent = "* 아이디에 빈 값이 있습니다."
                    return;
                }
                const data = new Data(id.trim(), value);
                wholeData[data.key] = data;
            };

            renderUI(RenderStatus.ALL);
            clearFields();
        } catch (error) {
            jsonFeedbackText.textContent = "* 올바른 형식의 JSON을 입력해주세요."
        }
    }

    const isInputValidate = (id, value) => {
        if (!id || !id.trim()) {
            return false;
        } else if (!value.trim() || isNaN(value)) {
            return false;
        }
        return true;
    };

    idInput.addEventListener('input', onCheckInput);
    valueInput.addEventListener('input', onCheckInput);
    jsonTextarea.addEventListener('input', onCheckTextarea);
    addValueButton.addEventListener('click', onAddValue);
    applyAdvancedValueButton.addEventListener('click', onApplyAdvancedValue);
};

setEventListeners();
// 초기 렌더링
renderUI(RenderStatus.ALL);