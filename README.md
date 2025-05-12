# 📊 Interactive Chart

안녕하세요. 아이엠파인 SD팀에 지원한 프론트엔드 개발자 김성현이라고 합니다!<br>
프로젝트를 참고하실 때 도움이 되실 것 같아 간략하게 소개하고자 합니다.<br>

## 1. Preview
![interactive-chart](https://github.com/user-attachments/assets/5af65b56-eb4c-4ebc-9e7a-f6f3f033bdf5)

<br>
<br>

## 2. 프로젝트 구조

스크립트는 `main.js`와 `data-manager`로 나누어 구현하였습니다. <br>


`main.js`<br>
- UI에 관련된 스크립트로, 이벤트 처리, DOM Element 조정, 그래프와 카드를 보여주는 `render()` 함수를 정의하고, 로직을 실행합니다.


`data-manager.js`<br>
- `DataManager`를 통해 데이터`(id, value)`를 관리하며, 데이터가 변경되면 구독자(`main.js`의 `render()`)에게 알람을 보냅니다.
```
/interactive-chart
├── index.html
├── style.css
├── main.js
└── data-manager.js
```
<br>
<br>

## 3. 구현 흐름

`main.js`에서 이벤트를 받으면 `dataManager.addData(data)` 등의 데이터 접근 메서드를 호출해 데이터를 변경합니다. <br>

DataManager는 자신을 구독한 callback 함수에게 데이터의 변경을 알리며, <br>

변경된 데이터와 함께 `DataChange.ADD`, `DataChange.UPDATE` 등의 `DataChange` 타입을 전달합니다. <br>

`main.js`의 `render()` 함수는 데이터를 받아 `DataChange` 타입에 따라 UI를 선택적으로 렌더링합니다. <br>

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
  - 데이터의 변경 상태를 의미합니다. (추가, 업데이트, 삭제, 초기화)<br>
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
  - `dataStore`을 통해 `Data` 인스턴스를 관리하며 접근 메서드를 제공합니다.
  - `subscriber`에 `subscribe()`를 통해 구독자를 등록합니다.
  - 아래의 `addData(data)`와 같이 `this._notify()`를 통해 데이터의 변경을 구독자에게 알립니다.


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

<br>

- <b>render</b>
  - `DataChange`에 따라 UI를 렌더링 하는 callback 함수 <br>
  
  - Parameters <br>
      - `status`: `DataChange` 타입 <br>
      - `data`: 변경한 데이터 <br>

        ```javascript
        const render = (status, data = null) => {
            switch (status) {
                case DataChange.ADD:
                    renderGraph(data);
                    renderCard(data);
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
