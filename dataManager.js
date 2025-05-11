// Data에 관한 클래스를 정의한 스크립트

class Data {
    constructor(id, value) {
        this.id = id;
        this.value = Number(value);
    }

    toJSON() {
        return { id: this.id, value: this.value };
    }
}

// 여러 Data 객체를 관리하고, 데이터 접근 메서드를 제공하는 클래스
class DataManager {
    static #instance = null; 
    
    // Data를 저장하는 dataStore
    #dataStore = {};

    // 싱글톤 인스턴스 반환
    static getInstance() {
        if (!this.#instance) {
            this.#instance = new DataManager();
        }
        return this.#instance;
    }

    // dataStore 접근 메서드
    addData(data) {
        if (!data) return;
        
        this.#dataStore[data.id] = data;
    }

    getDataById(id) {
        const data = this.#dataStore[id];

        if (!data) return null;
        
        return this.#dataStore[id];
    }

    updateDataById(id, newValue) {
        const data = this.getDataById(id);
        if (data) {
            data.value = newValue;
        }
    }
    
    deleteData(id) {
        if (!this.#dataStore || !this.#dataStore[id]) return;

        delete this.#dataStore[id];
    }

    clear() {
        this.#dataStore = {};
    }

    // dataStore를 배열로 반환
    getDataList() {
        if (this.#dataStore) {
            return Object.values(this.#dataStore);
        } else {
            return [];
        }
    }
}