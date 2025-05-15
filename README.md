# 📊 React 없이 Interactive Chart 만들기

순수 자바스크립트를 이용해 데이터가 변하면 동적으로 차트가 그려지는 어플리케이션을 개발했습니다. <br>
프로젝트를 보다 쉽게 참고하실 수 있도록, 주요 클래스를 위주로 간단한 소개를 덧붙입니다.<br>


### 사용 언어
```
HTML5, CSS3, Javascript
```


## 1. Preview

![제목-없음](https://github.com/user-attachments/assets/e11cc6b0-a691-4800-9697-530773a9710e)

[👉 자세한 개발 과정 보러가기](https://velog.io/@oilater/%EC%9D%BC%EC%A3%BC%EC%9D%BC-%EA%B0%84-%EA%B3%BC%EC%A0%9C%ED%95%98%EA%B3%A0-1%EB%B6%84%EB%A7%8C%EC%97%90-%EB%96%A8%EC%96%B4%EC%A7%84-SSUL)

<br>
<br>

## 2. 프로젝트 구조

스크립트는 기능에 따라 `main.js`와 `data-manager.js`로 나누어 구성하였습니다. <br>

```
/interactive-chart
├── index.html
├── style.css
├── main.js
└── data-manager.js
```


`main.js`<br>
- UI와 이벤트 처리를 담당하며, 그래프 및 카드 랜더링을 위한 `render()` 함수를 정의합니다.


`data-manager.js`<br>
- `DataManager`를 통해 `(id, value)`형태의 `Data`를 관리하며, 데이터가 변경 시 구독 중인 `main.js`의 `render()` 함수에 알람을 보냅니다.

<br>
<br>

## 3. 구현 흐름

사용자 이벤트가 발생하면, `main.js`에서 `dataManager.addData(data)` 등의 메서드를 호출하여 데이터를 변경합니다.

`DataManager`는 자신의 구독자에게 데이터의 변경을 알리며, <br>

변경된 데이터와 함께 `DataChange.ADD` 등 적절한 `DataChange` 타입을 전달합니다. <br>

`main.js`의 `render()` 함수는 전달받은 `DataChange` 타입에 따라 필요한 UI만 선택적으로 렌더링합니다. <br>

<br>
<br>

## 4. 주요 클래스

### 📉 data-manager.js

---

- <b>Data</b>
  - `id`와 `value` 값을 갖는 `Data` 클래스를 정의합니다.

    ```javascript
    class Data {
        constructor(id, value) {
            this.id = id;
            this.value = Number(value);
        }
    }
    ```

- <b>DataChange</b>
  - 데이터의 변경 유형을 의미합니다. (추가, 수정, 삭제, 초기화)<br>
  - Enum과 유사한 효과를 주기 위해 `Object.freeze()`와 `Symbol()`을 활용했습니다.
 
 
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
  - `dataStore`을 통해 `Data` 인스턴스를 관리하며, 데이터 접근 메서드를 제공합니다.
  - `subscribe()`를 통해 구독자를 `subscriber`에 등록할 수 있습니다.
  - 하단의 `addData(data)`처럼 `this._notify()`를 호출하여 구독자에게 데이터의 변경을 알립니다.


    ```javascript
    class DataManager {
        _dataStore = new Map();
        _subscriber = new Set();
    
        _notify(type, data = null) {      
            for (const callback of this.subscribers) {
                if (!callback) return;
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
    }
    ```

<br>

### 🏁 main.js

---

<br>

- <b>render</b>
  - `DataChange`에 따라 UI를 렌더링 하는 콜백 함수입니다. <br>
  
  - Parameters <br>
      - `status`: `DataChange` 타입 (`ADD`, `UPDATE`, `DELETE`, `CLEAR`) <br>
      - `data`: 변경된 데이터 (`DELETE`와 같이 UI를 업데이트 할 데이터가 필요 없는 경우 `null`) <br>

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
                    graph.remove();
                    card.remove();
                    break;
        
                case DataChange.CLEAR:
                    break;
            }
        
            // 공통로직
            updateJSONTextarea();
        };
        ```
