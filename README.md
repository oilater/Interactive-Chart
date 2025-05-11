# 📊 Interactive Chart

안녕하세요, 아이엠파인 SD팀에 지원한 프론트엔드 개발자 김성현이라고 합니다!<br>
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


- Data
  - id, value로 이루어진 데이터를 정의합니다. 

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
  - 여러 Data 객체를 관리하고, 데이터 접근 메서드를 제공합니다.


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


이벤트에 따라 데이터를 추가, 수정, 삭제하고 카드와 그래프 UI를 렌더링합니다.

<br>

- RenderStatus
  - 불필요한 UI 렌더링을 방지하기 위해 상태(State)를 정의했습니다.


  - `ALL`: 전체 렌더링 <br>
  - `ADD`: 데이터 추가 시 렌더링 <br>
  - `UPDATE`: 편집한 데이터 전부 렌더링 <br>
  - `DELETE`: 선택한 데이터 제거<br>

```javascript
const RenderStatus = Object.freeze({
    ALL: Symbol('ALL'), // 전체 그래프, 카드 렌더링
    ADD: Symbol('ADD'), // 추가된 데이터에 해당하는 그래프, 카드 렌더링
    DELETE: Symbol('DELETE'), // 수정된 데이터 리스트에 해당하는 그래프, 카드 렌더링
    UPDATE: Symbol('UPDATE'), // 삭제된 데이터에 해당하는 그래프, 카드 삭제
});
```


- renderByStatus
  - RenderStatus 값에 따라 UI 렌더링을 다르게 처리하는 함수입니다. <br>
  - Parameters <br>
  
      - `status`: 렌더링하고자 하는 Status <br>
      - `data`: 추가 또는 삭제하려는 데이터 <br>
      - `dataList`: 수정한 데이터들을 담은 배열 <br>

```javascript
const renderByStatus = (status = RenderStatus.ALL, data = null, dataList = null) => {
    switch (status) {
        case RenderStatus.ALL:

            break;

        case RenderStatus.ADD:
            
            break;

        case RenderStatus.UPDATE:
            
            break;
    
        case RenderStatus.DELETE:
            
            break;
    }

    // 공통로직
    updateJSONTextarea();
};
```
