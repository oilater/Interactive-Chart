# 📊 Interactive Chart

안녕하세요. 아이엠파인 SD팀에 지원한 프론트엔드 개발자 김성현이라고 합니다!<br>
프로젝트를 참고하실 때 도움이 되실 것 같아 간략하게 소개하고자 합니다.<br>

## 1. Preview
![interactive-chart](https://github.com/user-attachments/assets/5af65b56-eb4c-4ebc-9e7a-f6f3f033bdf5)

<br>
<br>

## 2. 프로젝트 구조
```
/interactive-chart
├── index.html
├── style.css
├── main.js
└── data-manager.js
```
<br>
<br>

## 3. 구현 과정과 흐름

#### 구현 과정


순수 Javascript로 개발을 하며 데이터와 렌더링 간의 관계에 대해 많은 고민을 했습니다.
먼저 데이터와 UI를 분리하였고, UI를 효율적으로 렌더링하기 위해 게임 개발에서 사용하던 상태(State) 패턴을 적용하여 선택적으로 UI를 그리도록 했습니다.
하지만 Data를 다루는 부분과 UI를 그리는 부분이 여전히 따로 호출되고 있는 부분에 계속 아쉬움이 남았고, 
이를 개선하기 위해 Observer 패턴을 학습하고 적용하여 데이터를 변경하면 자동으로 관련된 UI가 업데이트되도록 구현하였습니다.

<br>

#### 구현 흐름

`main.js`에서는 이벤트에 따라 `dataManager.addData(data)` 등을 호출해 데이터를 변경합니다. <br>
DataManager는 등록된 구독자에게 데이터의 변경을 알리며, <br>
변경된 데이터와 함께 `DataChange.ADD`, `DataChange.UPDATE` 등의 `DataChangeType`을 전달합니다. <br>
`main.js`의 `render()` 함수는 데이터를 받아 `DataChangeType`에 따라 필요한 UI만을 렌더링합니다. <br>

<br>
<br>

## 4. 주요 클래스

### 📉 data-manager.js

---

- <b>Data</b>
  - id, value로 이루어진 데이터를 정의합니다.

    ```javascript
    class Data {
        constructor(id, value) {
            this.id = id;
            this.value = Number(value);
        }
    }
    ```

- <b>DataChange</b>
  - 데이터의 변경 상태를 의미합니다. (추가, 업데이트, 삭제, 전체 초기화)
  - Enum과 같은 효과를 주기 위해 `Object.freeze()`와 `Symbol()`을 사용했습니다.
 
 
    ```javascript
    const DataChange = Object.freeze({
        ADD: Symbol('ADD'), // 데이터 추가
        UPDATE: Symbol('UPDATE'), // 데이터 수정
        DELETE: Symbol('DELETE'), // 데이터 삭제
        CLEAR: Symbol('CLEAR'), // 데이터 초기화 (JSON 업데이트 시 호출)
    });
    ```

<br>

- <b>DataManager</b>
  - `subscribe()`를 통해 `subscriber`에 구독자를 등록합니다.
  - Data 객체들을 관리하고, 데이터 접근 메서드를 제공합니다.
  - `addData(data)`와 같이 `this._notify()`를 통해 데이터의 변경을 구독자에게 알립니다.


    ```javascript
    class DataManager {
        _dataStore = new Map();
        _subscriber = new Set();
    
        _notify(type, data = null) {      
            for (const callback of this.subscribers) {
                // 콜백 실행
                callback(type, data);
            }
        }
    
        // 데이터 추가
        addData(data) {
            if (!data) return;
            this._dataStore.set(data.id, data);
            // 구독자 알림 호출
            this._notify(DataChange.ADD, data);
        }
        
        getDataById(id) {} 
        updateDataById(id, newValue) {} 
        ..
    ```

<br>

### 🏁 main.js

---

유저의 이벤트를 받아 처리하고, DOM Element들과 render 함수를 정의한 클래스입니다. 
<br>

- <b>render</b>
  - DataChangeType에 따라 UI를 다르게 렌더링 하는 callback 함수입니다. <br>
  - Parameters <br>
      - `status`: 렌더링하고자 하는 Status <br>
      - `data`: 추가 또는 삭제하려는 데이터 <br>

        ```javascript
        const render = (status, data = null) => {
            switch (status) {
                case DataChange.ADD: 
                    break;
        
                case DataChange.UPDATE:
                    break;
            
                case DataChange.DELETE:
                    break;
        
                case DataChange.CLEAR:
                    break;
            }
        
            // 공통로직
            updateJSONTextarea();
        };
        ```
