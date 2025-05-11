# 📊 Interactive Chart

안녕하세요, 아이엠파인 SD팀에 지원하게 된 프론트엔드 개발자 김성현이라고 합니다!<br>
프로젝트를 참고하실 때 도움이 되실 것 같아 코드를 간략하게 소개하고자 합니다.<br>

## 1. 과제 프리뷰
![interactive-chart](https://github.com/user-attachments/assets/5af65b56-eb4c-4ebc-9e7a-f6f3f033bdf5)


## 2. 프로젝트 구조
```
/interactive-chart
├── index.html
├── style.css
├── main.js
└── data-manager.js
```

## 3. 코드 소개


### 📉 data-manager.js
---
Data를 정의하고, 접근 메서드를 제공합니다.

- Data
<br>

```javascript
class Data {
    constructor(id, value) {
        this.id = id;
        this.value = Number(value);
    }
}
```
<br>
- DataManager
  - 여러 Data 객체를 관리하고, 데이터 접근 메서드를 제공
<br>

```javascript
class DataManager {

    addData(data) {} // 데이터 추가

    getDataById(id) {} // id로 데이터 조회 후 반환

    updateDataById(id, newValue) {} // id로 데이터를 조회 후 새로운 값으로 업데이트
    
    deleteData(id) {} // 데이터 삭제

    clear() {} // 전체 데이터 초기화

    getDataList() {} // 전체 데이터를 배열로 반환
```

<br>

### 🏁 main.js
---
이벤트에 따라 데이터를 추가, 수정, 삭제하고 카드와 그래프 UI를 렌더링합니다.
<br>
<br>

- renderByStatus
  - RenderStatus 값에 따라 UI 렌더링을 다르게 처리하는 함수입니다.
  <br>
  
  - `ALL`: 전체를 초기화하여 다시 렌더링<br>
  - `ADD`: 단일 데이터 추가 렌더링<br>
  - `UPDATE`: 기존 데이터를 업데이트하여 반영<br>
  - `DELETE`: 특정 데이터를 제거<br>


  - @param
    
  - `status`: 렌더링하고자 하는 Status (ALL, ADD, DELETE, UPDATE)<br>
  - `data`: 추가 또는 삭제하려는 데이터<br>
  - `dataList`: 수정한 데이터들을 담은 배열<br


```javascript
// RenderStatus에 따라 랜더링
const renderByStatus = (status = RenderStatus.ALL, data = null, dataList = null) => {
    switch (status) {
        case RenderStatus.ALL:
            // 테이블 초기화
            graphTable.replaceChildren();
            cardTable.replaceChildren();
            
            dataManager.getDataList().forEach((data) => {
                renderGraph(data);
                renderCard(data);
            });
            break;

        case RenderStatus.ADD:
            renderGraph(data);
            renderCard(data);
            break;

        case RenderStatus.UPDATE:
            dataList.forEach((data) => {
                const graph = graphTable.querySelector(`.graph-wrapper[data-id="${data?.id}"]`);
                const card = cardTable.querySelector(`.card-wrapper[data-id="${data?.id}"]`);
                updateGraph(data, graph);
                updateCard(data, card);
            });
            break;
    
        case RenderStatus.DELETE:
            const graph = graphTable.querySelector(`.graph-wrapper[data-id="${data?.id}"]`);
            const card = cardTable.querySelector(`.card-wrapper[data-id="${data?.id}"]`);
            if (!graph || !card) return;
            graph.remove();
            removeCardEventListeners(card);
            card.remove();
            break;
    }

    // 공통 실행 로직
    updateJSONTextarea(); // JSON 업데이트
    updateSectionVisibility();
    showAddButtonOnGraph(); // 마지막 그래프 오른쪽에 + 버튼 생성
};
```
