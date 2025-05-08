// 상수 선언
const GRAPH_BG_HEIGHT = 20;
const GRAPH_ANIMATION_DURATION = 600;
const COLOR_HIGH_VALUE = '#1873cc';
const COLOR_MEDIUM_VALUE = 'dodgerblue';
const COLOR_LOW_VALUE = '#1e90ff80';
const ACTIVE_TRIGGER = 'active-button';

// 효율적인 렌더링을 위한 상태 분기
const RenderStatus = Object.freeze({
    ALL: Symbol('ALL'),
    ADD: Symbol('ADD'),
    DELETE: Symbol('DELETE'),
    EDIT: Symbol('EDIT'),
  });

// DOM Elements
const graphSection = document.querySelector(".graph-section");
const editSection = document.querySelector(".edit-value-section");
const addSection = document.querySelector(".add-value-section");
const editAdvanceSection = document.querySelector(".edit-advanced-value-section");
const cardTable = document.querySelector(".value-card-table");
const graphTable = document.querySelector(".graph-table");
const editTextarea = document.querySelector(".advanced-value-textarea");
const addValueButton = document.querySelector(".add-value-button");
const applyEditButton = document.querySelector(".apply-advanced-value-button");
const idInput = document.querySelector("#id-input");
const valueInput = document.querySelector("#value-input");

// Data를 관리할 객체
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

// RenderStatus에 따른 렌더링
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
            selectedGraph.remove();
            selectedCard.remove();
            break;
    }
    updateEditTextarea();
    updateSectionVisibility();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 스크롤 맨 위로 이동
};

// [그래프] UI 렌더링
const renderGraph = (data) => {
    // 만들어 둔 HTML 템플릿을 복사해 그래프 생성
    const template = document.querySelector('.graph-template').content.cloneNode(true);
    const wrapper = template.querySelector('.graph-wrapper');
    const valueText = wrapper.querySelector('.graph-value');
    const barElement = wrapper.querySelector('.graph');

    // 편집 및 삭제 시 참조하기 위한 data-id 적용
    wrapper.dataset.id = data.key;
    wrapper.querySelector('.graph-id').textContent = data.id;
    
    animateGraph(data.value, barElement, valueText);
    graphTable.appendChild(wrapper);
};

// [그래프] 애니메이션
const animateGraph = (targetValue, barElement, valueText) => {
    // 원래 값 저장
    const originValue = parseFloat(valueText.textContent) || 0;
    const color = getColor(targetValue);

    // 애니메이션 시작 시간
    const startTime = performance.now();
    const valueDelta = targetValue - originValue;
    
    const animate = (time) => {
        const progress = Math.min((time - startTime) / GRAPH_ANIMATION_DURATION, 1);
        const currentValue = originValue + valueDelta * progress;

        valueText.textContent = Math.floor(currentValue);
        barElement.style.setProperty('--graph-height', `${(currentValue / 100) * GRAPH_BG_HEIGHT}rem`);
        barElement.style.setProperty('--graph-color', color);
        valueText.style.setProperty('--graph-value-color', color);

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    };

    requestAnimationFrame(animate);
};

// [값 편집] 시 그래프 업데이트
const updateGraph = (data, graph) => {
    const graphBar = graph.querySelector('.graph');
    const graphValue = graph.querySelector('.graph-value');
    animateGraph(data.value, graphBar, graphValue);
}

// [값 편집] 카드 UI 렌더링
const renderCard = (data) => {
    // 템플릿을 복사해 카드 생성
    const template = document.querySelector('.card-template').content.cloneNode(true);
    const card = template.querySelector('.card-wrapper');
    const cardId = card.querySelector('.card-id');
    const cardValue = card.querySelector('.card-value');
    const editButton = card.querySelector('.card-edit-button');
    const deleteButton = card.querySelector('.card-delete-button');

    // 편집 및 삭제 시 참조하기 위한 data-id 적용
    card.dataset.id = data.key;
    cardId.textContent = data.id;
    cardValue.textContent = data.value;

    // 카드 색상 설정
    const color = getColor(data.value);
    cardValue.style.color = color;
    card.style.borderColor = color;

    // 카드의 수정, 삭제 버튼에 이벤트리스너 추가
    editButton.addEventListener("click", () => handleEditCard(card, data, cardValue));

    deleteButton.addEventListener("click", () => {
        // fadeOut 애니메이션 종료 후 카드를 삭제
        card.classList.add("fade-out");
        card.addEventListener("animationend", () => {
            delete wholeData[data.key];
            renderUI(RenderStatus.DELETE, data);
        });
    });
    
    cardTable.appendChild(card);
};

// [값 편집] 시 카드 업데이트
const updateCard = (data, card) => {
    const cardValue = card.querySelector('.card-value');
    cardValue.textContent = data.value;

    const color = getColor(data.value);
    cardValue.style.color = color;
    card.style.borderColor = color;
}

// [값 편집] 수정 버튼 클릭 이벤트 리스너
const handleEditCard = (card, data, currentValue) => {
    // 편집 모드 진입
    const enterEditMode = () => {
        card.classList.add('editing');
        currentValue.setAttribute('contenteditable', 'true'); // p 태그 안 텍스트를 수정할 수 있도록 해줌
        currentValue.focus();
    }

    // 편집 모드 종료
    const exitEditMode = () => {
        card.classList.remove('editing');
        currentValue.setAttribute('contenteditable', 'false');

        cancelButton.removeEventListener('click', onCancelEdit);
        confirmButton.removeEventListener('click', onConfirmEdit);
    };

    // 편집 모드에서 확인 버튼을 누를 때
    const onConfirmEdit = () => {
        const newValue = Number(currentValue.textContent);

        if (!isNaN(newValue)) {
            data.value = newValue;
            renderUI(RenderStatus.EDIT, data);
        } else {
            alert("숫자 값만 입력해주세요!");
            return;
        }
        exitEditMode();
    };

    // 편집 모드에서 취소 버튼을 누를 떄
    const onCancelEdit = () => {
        currentValue.textContent = data.value;
        
        exitEditMode();
        cancelButton.removeEventListener('click', onCancelEdit);
        confirmButton.removeEventListener('click', onConfirmEdit);
    };

    // 편집 적용 여부를 결정하는 '취소', '확인' 버튼
    const cancelButton = card.querySelector('.edit-cancel-button');
    const confirmButton = card.querySelector('.edit-confirm-button');
    confirmButton.addEventListener('click', onConfirmEdit);
    cancelButton.addEventListener('click', onCancelEdit);

    enterEditMode();
};

// value에 따른 그래프, 카드 색상 결정
const getColor = (value) => {
    return value >= 100 ? COLOR_HIGH_VALUE : value >= 50 ? COLOR_MEDIUM_VALUE : COLOR_LOW_VALUE;
};

// [값 고급 편집] Textarea에 JSON 포맷 반영
const updateEditTextarea = () => {
    const dataList = Object.values(wholeData).map((data) => data.toJSON());
    editTextarea.value = JSON.stringify(dataList, null, 2);
};

// Data 개수에 따른 각 Section 표시 여부 결정
const updateSectionVisibility = () => {
    const hasData = Object.keys(wholeData).length > 0;
    let description;
    let sectionVisibility;

    if (hasData) {
        addSection.classList.remove('no-value');
        description = "새로운 값을 추가하면 그래프가 달라져요!"
        sectionVisibility = '';
    } else {
        addSection.classList.add('no-value');
        description = "아직 데이터가 없네요. 새로운 데이터를 추가해보세요!";
        sectionVisibility = 'none';
    }
    
    document.querySelector(".add-value-description").textContent = description;
    graphSection.style.display = sectionVisibility;
    editSection.style.display = sectionVisibility;
    editAdvanceSection.style.display = sectionVisibility;
};

const setEventListeners = () => {
    // 값 입력(id, value) 여부에 따른 Add 버튼 색상 변경
    const updateButtonColor = () => {
        const id = idInput.value;
        const value = valueInput.value;

        if (id.trim() && value.trim() && !isNaN(value.trim())) {
            addValueButton.classList.add(ACTIVE_TRIGGER);
        } else {
            addValueButton.classList.remove(ACTIVE_TRIGGER);
        }
    }
    idInput.addEventListener('input', updateButtonColor);
    valueInput.addEventListener('input', updateButtonColor);

    // [값 추가] Add 버튼 클릭 시
    addValueButton.addEventListener('click', () => {
        const id = idInput.value;
        const value = valueInput.value;

        if (!id.trim()) {
            alert("아이디를 입력해주세요!");
            return;
        } 
        if (!value.trim() || isNaN(value)) {
            alert("숫자 값만 입력해주세요!");
            return;
        }

        const newData = new Data(id, value);
        wholeData[newData.key] = newData;
        renderUI(RenderStatus.ADD, newData);
        idInput.value = '';
        valueInput.value = '';
    });

    // [값 고급 편집] Apply 버튼 클릭 시
    applyEditButton.addEventListener('click', () => {
        try {
            const parsed = JSON.parse(editTextarea.value);
            
            if (!Array.isArray(parsed)) {
                throw new Error();
            }

            wholeData = {};

            parsed.forEach(({ id, value }) => {
                if (!id.trim()) {
                    throw new Error("비어있는 아이디가 있습니다");
                }
                const data = new Data(id.trim(), value);
                wholeData[data.key] = data;
            });
            renderUI(RenderStatus.ALL);
        } catch (error) {
            alert("JSON 형식이 올바른지 확인하세요!");
        }
    });
}

// 초기 렌더링 실행
setEventListeners();
renderUI(RenderStatus.ALL);