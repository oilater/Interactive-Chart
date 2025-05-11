// 랜더링과 이벤트 처리를 담당하는 메인 스크립트

// 상수
const MAX_ID_LENGTH = 6;
const MAX_VALUE_LENGTH = 7;
const GRAPH_MAX_HEIGHT = 20;
const GRAPH_ANIMATION_DURATION = 600;

// 색상
const COLOR_HIGH = '#1873cc';
const COLOR_MEDIUM = 'dodgerblue';
const COLOR_LOW = '#1e90ff80';

// 동적으로 추가되는 클래스
const ACTIVE = 'active'; // display: 'block' 추가 또는 제거
const BUTTON_ACTIVE = 'active-button'; // 유효성 검사 통과 후 버튼이 활성화될 때
const POSITION_EMPTY = 'no-value-positon'; // 값이 없는 경우 섹션의 margin 값 지정
const SLIDE_SHOW = 'slide-right'; // 값 편집 후 apply, cancel 버튼 보여줄 때
const SLIDE_HIDE = 'slide-left'; // 값 편집 후 apply, cancel 버튼 숨길 때
const FADE_OUT = 'fade-out'; // 카드 페이드 아웃 효과

// DOM 엘리먼트
const graphTemplate = document.querySelector('.graph-template');
const cardTemplate = document.querySelector('.card-template');
const graphSection = document.querySelector(".graph-section");
const editSection = document.querySelector(".edit-value-section");
const addSection = document.querySelector(".add-value-section");
const editAdvanceSection = document.querySelector(".edit-advanced-value-section");
const cardTable = document.querySelector(".value-card-table");
const graphTable = document.querySelector(".graph-table");
const jsonTextarea = document.querySelector(".advanced-value-textarea");
const addValueButton = document.querySelector(".add-value-button");
const editButtonTable = document.querySelector('.edit-apply-section');
const applyEditButton = document.querySelector('.apply-all-edit-button');
const cancelEditButton = document.querySelector('.cancel-all-edit-button');
const applyAdvancedValueButton = document.querySelector(".apply-advanced-value-button");
const inputFeedBackText = document.querySelector(".feedback-text");
const jsonFeedbackText = document.querySelector(".json-feedback-text");
const idInput = document.querySelector("#id-input");
const valueInput = document.querySelector("#value-input");

// DataManager 인스턴스 생성
const dataManager = DataManager.getInstance();

// 데이터 변경 시 호출되는 callback 함수
const render = (status, data = null) => {
    switch (status) {
        case ChangeType.ADD:
            renderGraph(data);
            renderCard(data);
            break;

        case ChangeType.UPDATE:
            const graphToUpdate = graphTable.querySelector(`.graph-wrapper[data-id="${data?.id}"]`);
            const cardToUpdate = cardTable.querySelector(`.card-wrapper[data-id="${data?.id}"]`);
            updateGraph(data, graphToUpdate);
            updateCard(data, cardToUpdate);
            break;
    
        case ChangeType.DELETE:
            const graph = graphTable.querySelector(`.graph-wrapper[data-id="${data?.id}"]`);
            const card = cardTable.querySelector(`.card-wrapper[data-id="${data?.id}"]`);
            if (!graph || !card) return;
            graph.remove();
            removeCardEventListeners(card);
            card.remove();
            break;

        case ChangeType.CLEAR:
            graphTable.replaceChildren();
            cardTable.replaceChildren();
    }

    updateJSONTextarea();
    updateSectionVisibility();
    showAddButtonOnGraph();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // 스크롤 맨 위로 이동
};

const renderGraph = (data) => {
    // 위에서 캐싱한 템플릿을 복사해 그래프 생성
    const template = graphTemplate.content.cloneNode(true);
    const graph = template.querySelector('.graph-wrapper');

    initGraph(data, graph);
    graphTable.appendChild(graph);
};

const initGraph = (data, graph) => {
    const idElement = graph.querySelector('.graph-id');
    const valueElement = graph.querySelector('.graph-value');
    const barElement = graph.querySelector('.graph');
    
    graph.dataset.id = data.id; // 편집 및 삭제 시 참조하기 위한 data-id 적용
    setElementText(idElement, data.id);
    animateGraph(data.value, barElement, valueElement);
}

// 그래프 애니메이션 실행
const animateGraph = (targetValue, barElement, valueText) => {
    const color = getColor(targetValue);
    const startTime = performance.now();
    const originValue = parseInt(valueText.textContent) || 0;
    const delta = targetValue - originValue;
    
    const animate = (time) => {
        const progress = Math.min((time - startTime) / GRAPH_ANIMATION_DURATION, 1);
        const currentValue = originValue + delta * progress;
        setElementText(valueText, Math.floor(currentValue));
        valueText.style.setProperty('--graph-value-color', color);
        barElement.style.setProperty('--graph-height', `${(currentValue / 100) * GRAPH_MAX_HEIGHT}rem`);
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
    const template = cardTemplate.content.cloneNode(true);
    const card = template.querySelector('.card-wrapper');

    initCard(data, card);
    cardTable.appendChild(card);
};

// 생성한 카드 초기화
const initCard = (data, card) => {
    const idElement = card.querySelector('.card-id');
    const valueElement = card.querySelector('.card-value');
    const deleteButton = card.querySelector('.card-delete-button');
    const color = getColor(data.value); // value에 따라 색상을 지정
    
    card.dataset.id = data.id; // 값 편집 및 삭제 시 카드를 참조하기 위한 data-id 적용
    setElementText(idElement, data.id);
    setElementValue(valueElement, data.value);
    valueElement.style.color = color;
    card.style.borderColor = color;
    valueElement.addEventListener('click', onEditting);
    deleteButton.addEventListener('click', (e) => onDelete(e, data, card));
};

// 편집한 값에 해당하는 카드 업데이트
const updateCard = (data, card) => {
    const cardValue = card.querySelector('.card-value');
    const color = getColor(data.value);

    setElementText(cardValue, data.value);
    cardValue.style.color = color;
    card.style.borderColor = color;
};

const onEditting = (e) => {
    e.preventDefault();
    setApplyButtonVisible(true);
};

const onDelete = (e, data, card) => {
    e.preventDefault();
    clearFields();
    setApplyButtonVisible(false);
    card.classList.add(FADE_OUT);
    // fadeOut 애니메이션 종료 후 카드를 삭제
    card.addEventListener("animationend", () => {
        dataManager.deleteData(data.id);
        render(ChangeType.DELETE, data);
    }, { once: true });
};

// Textarea에 JSON 반영
const updateJSONTextarea = () => {
    let jsonText = '';
    // JSON 객체로 변환 후 dataList에 세팅
    const dataList = dataManager.getDataList().map((data) => data.toJSON());
    
    if (dataList.length !== 0) {
        jsonText = JSON.stringify(dataList, null, 2);
    }
    setElementValue(jsonTextarea, jsonText);
};

// 데이터 수에 따라 각 Section 표시 여부 결정
const updateSectionVisibility = () => {
    let addDescription;
    let advancedEditTitle;
    let visibility;
    
    const hasData = dataManager.getDataList().length > 0;

    if (hasData) {
        addSection.classList.remove(POSITION_EMPTY);
        addDescription = "새로운 값을 추가하면 그래프가 달라져요!";
        advancedEditTitle = "JSON으로 값 편집하기";
        visibility = 'block';
    } else {
        addSection.classList.add(POSITION_EMPTY);
        addDescription = "아직 데이터가 없네요. 새로운 값을 추가해보세요!";
        advancedEditTitle = "JSON으로 값 추가하기";
        visibility = 'none';
        idInput.focus();
    }
    
    const addSectionDescription = document.querySelector(".add-value-description");
    const jsonSectionTitle = document.querySelector(".edit-advanced-title");
    setElementText(addSectionDescription, addDescription);
    setElementText(jsonSectionTitle, advancedEditTitle);

    // 데이터가 없다면, 값 추가에 관련된 섹션만 보여줌
    graphSection.style.display = visibility;
    editSection.style.display = visibility;
};

const getColor = (value) => {
    return value >= 100 ? COLOR_HIGH : value >= 50 ? COLOR_MEDIUM : COLOR_LOW;
};

// 가장 끝에 있는 그래프의 오른쪽에 + 버튼을 추가
const showAddButtonOnGraph = () => {
    const graphs = [...document.querySelectorAll('.graph-wrapper')];
    if (graphs.length === 0) return;
    
    // 마지막 그래프의 last button 선택
    const lastButton = graphs.at(graphs.length - 1).querySelector('.graph-add-button');
    
    lastButton.addEventListener('click', () => {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
        idInput.focus({preventScroll: true});
    });
};

// 초기화
const clearFields = () => {
    setElementValue(idInput, '');
    setElementValue(valueInput, '');
    setElementText(inputFeedBackText, '');
    setElementText(jsonFeedbackText, '');
    addValueButton.classList.remove(BUTTON_ACTIVE);
    applyAdvancedValueButton.classList.remove(BUTTON_ACTIVE);
};

const isInputValidate = (id, value) => {
    if (!id.trim()) {
        return false;
    } else if (!value.trim() || isNaN(value)) {
        return false;
    }
    return true;
};

const isExistId = (id) => {
    let dataList = dataManager.getDataList();
    return dataList.some(data => data.id === id.toString());
}

const resetValues = () => {
    const cards = [...cardTable.querySelectorAll('.card-wrapper')];
    
    if (cards.length === 0) return;

    for (const card of cards) {
        const valueElement = card.querySelector('.card-value');
        const data = dataManager.getDataById(card.dataset.id);
        setElementValue(valueElement, data.value);
    }
};

const setApplyButtonVisible = (isShow) => {
    if (isShow) {
        editButtonTable.classList.add(ACTIVE, SLIDE_SHOW);
    } else {
        editButtonTable.classList.remove(SLIDE_SHOW);
        editButtonTable.classList.add(SLIDE_HIDE);
        editButtonTable.addEventListener('animationend', (e) => {
            e.preventDefault();
            editButtonTable.classList.remove(ACTIVE);
        }, { once: true });
    }
};

const setElementText = (element, text) => {
    if (!element) return;

    element.textContent = text;
}

const setElementValue = (element, value) => {
    if (!element) return;

    element.value = value;
}

const removeCardEventListeners = (card) => {
    const valueElement = card.querySelector('.card-value');
    const deleteButton = card.querySelector('.card-delete-button');
    valueElement.removeEventListener('click', onEditting);
    deleteButton.removeEventListener('click', (e) => onDelete(e, data, card));
}

const initEventListeners = () => {
    // Input의 입력 이벤트를 받아 체크 후 feedback 텍스트, 버튼 색 결정
    const onCheckInput = (e) => {
        e.preventDefault();
        const id = idInput.value.trim();
        const value = valueInput.value.trim();
        let feedback = '';
        addValueButton.classList.remove(BUTTON_ACTIVE);
        
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
            addValueButton.classList.add(BUTTON_ACTIVE);
        }
        setElementText(inputFeedBackText, feedback);
    };

    // 고급 값 편집 Textarea의 입력 이벤트를 받아 체크 후 버튼 색 결정
    const onCheckTextarea = (e) => {
        e.preventDefault();
        const text = jsonTextarea.value;

        if (text.trim()) {
            applyAdvancedValueButton.classList.add(BUTTON_ACTIVE);
        } else {
            applyAdvancedValueButton.classList.remove(BUTTON_ACTIVE);
        }
    };

    const onApplyEdit = (e) => {
        e.preventDefault();
        const edittedDataDict = {};
    
        // 카드들을 가져옴
        const cards = [...cardTable.querySelectorAll('.card-wrapper')];
        if (cards.length === 0) return;
        
        // 카드들을 돌면서 데이터를 추출하여 저장
        const extractedDataList = cards.reduce((acc, card) => {
            const id = card.querySelector('.card-id').textContent;
            const value = card.querySelector('.card-value').value;
        
            // 숫자가 아닌 값이 있다면 로직 종료
            if (!isInputValidate(id, value)) {
                alert('숫자가 아닌 값이 있어요!');
                return;
            }
    
            // 통과했다면 새로운 Data를 추가
            acc.push(new Data(id, value));
            return acc;
        }, []);
    
        if (extractedDataList.length === 0) {
            alert("수정된 값을 다시 확인해주세요!");
            return;
        }
            
        // 값이 달라진 데이터만 업데이트
        for (const data of extractedDataList) {
            const originData = dataManager.getDataById(data.id);
    
            if (!originData) continue;
            if (originData.value === data.value) continue;
            dataManager.updateDataById(data.id, data.value);
        }
        setApplyButtonVisible(false);
    }   

    const onCancelEdit = (e) => {
        e.preventDefault();
        setApplyButtonVisible(false);
        resetValues();
    };

    const onAddValue = (e) => {
        e.preventDefault();
        const id = idInput.value;
        const value = valueInput.value;
        if (!isInputValidate(id, value)) return;
        if (isExistId(id)) {
            setElementText(inputFeedBackText, '* 이미 등록된 아이디에요.')
            return;
        }

        const newData = new Data(id, value);
        dataManager.addData(newData);
        clearFields();
    };

    const onApplyAdvancedValue = (e) => {
        e.preventDefault();
        try {
            // JSON 파싱
            const parsed = JSON.parse(jsonTextarea.value);
    
            // 유효성 검사
            if (!Array.isArray(parsed) || parsed.length === 0) {
                setElementText(jsonFeedbackText, '* 올바른 형식의 JSON을 입력해주세요.');
                return;
            }
    
            // 전체 데이터 비우기
            dataManager.clear();
    
            // 데이터 생성
            for (const { id, value } of parsed) {
                const trimmedId = id?.trim();
                if (!trimmedId) {
                    setElementText(jsonFeedbackText, '* 아이디에 빈 값이 있습니다.');
                    break;
                }
                if (trimmedId.length > MAX_ID_LENGTH) {
                    setElementText(jsonFeedbackText, '* 아이디는 6자 이하로 입력해주세요.');
                    break;
                }
                if (!Number.isFinite(value) || value.toString().length > MAX_VALUE_LENGTH) {
                    setElementText(jsonFeedbackText, '* 값은 7자리 이하의 숫자로 입력해주세요.');
                    break;
                }
                if (isExistId(trimmedId)) {
                    setElementText(jsonFeedbackText, '* 중복된 아이디가 있어요.');
                    break;
                }

                const data = new Data(trimmedId, value);
                dataManager.addData(data);
            }

            clearFields();
            setApplyButtonVisible(false);
        } catch (error) {
            setElementText(jsonFeedbackText, '* 올바른 형식의 JSON을 입력해주세요.');
        }
    };
    
    // 값 입력 검사
    idInput.addEventListener('input', onCheckInput);
    valueInput.addEventListener('input', onCheckInput);
    jsonTextarea.addEventListener('input', onCheckTextarea);
    
    // 값 추가
    addValueButton.addEventListener('click', onAddValue);
    
    // 값 편집 및 값 고급 편집
    applyEditButton.addEventListener('click', onApplyEdit);
    cancelEditButton.addEventListener('click', onCancelEdit);
    applyAdvancedValueButton.addEventListener('click', onApplyAdvancedValue);
};

dataManager.subscribe(render);
initEventListeners();