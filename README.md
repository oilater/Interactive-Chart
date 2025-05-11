# 📊 Interactive Chart

안녕하세요, 아이엠파인 SD팀에 지원하게 된 프론트엔드 개발자 김성현이라고 합니다!<br>
프로젝트를 참고하실 때 도움이 되실 것 같아 코드를 간략하게 소개하고자 합니다.<br>

### 1. 과제 프리뷰
![interactive-chart](https://github.com/user-attachments/assets/5af65b56-eb4c-4ebc-9e7a-f6f3f033bdf5)


### 2. 프로젝트 구조
```
/interactive-chart
├── index.html
├── style.css
├── main.js
└── data-manager.js
```

### 3. 코드 소개


#### data-manager.js

Data에 관한 클래스를 정의한 스크립트입니다.

- Data
  - 필드로 id, value를 가지고 있음
```
class Data {
    constructor(id, value) {
        this.id = id;
        this.value = Number(value);
    }

    // JSON 객체를 만들어 반환하는 메소드
    toJSON() {
        return { id: this.id, value: this.value };
    }
}
```
- DataManager
  - 여러 Data 객체를 관리하고, 데이터 접근 메서드를 제공
```
class DataManager {
    static #instance = null; 
    
    // Data를 저장하는 dataStore
    #dataStore = {};

    // 싱글톤 인스턴스 반환
    static getInstance() {}

    // dataStore 접근 메서드
    addData(data) {}

    getDataById(id) {}

    updateDataById(id, newValue) {}
    
    deleteData(id) {}

    clear() {}

    // dataStore를 배열로 반환
    getDataList() {}
```


