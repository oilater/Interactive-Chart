// data-manager.js
// 데이터 매니저를 통해 데이터를 관리하고, 데이터가 변경되면 구독자(main.js의 render 함수)에게 알람을 보내는 역할을 담당

/** 데이터의 변경 타입 
 * ADD: 데이터 추가
 * UPDATE: 데이터 수정
 * DELETE: 데이터 삭제
 * CLEAR: 데이터 초기화 (JSON 업데이트 시 호출)
*/
const DataChange = Object.freeze({
    ADD: Symbol('ADD'),
    UPDATE: Symbol('UPDATE'),
    DELETE: Symbol('DELETE'),
    CLEAR: Symbol('CLEAR'),
});

class Data {
    constructor(id, value) {
        this.id = id;
        this.value = Number(value);
    }

    toJSON() {
        return { id: this.id, value: this.value };
    }
}

/** _dataStore 객체를 통해 데이터를 관리하며, 데이터 접근 메서드를 제공하는 클래스 */
class DataManager {
    static _instance = null; 
    
    // Data를 저장하는 dataStore
    _dataStore = new Map();
    subscribers = new Set();

    // 싱글톤 인스턴스 반환
    static getInstance() {
        if (!this._instance) {
            this._instance = new DataManager();
        }
        return this._instance;
    }

    /** 구독자 추가 */
    subscribe(callback) {
        this.subscribers.add(callback);
    }

    /**
     * 구독자에게 데이터 변경을 알림
     *
     * @params
     * - type: ChangeType (ADD, UPDATE, DELETE, CLEAR)
     * - data: 삭제의 경우에는 data를 받지 않음
     */
    _notify(type, data = null) {
        for (const callback of this.subscribers) {
            // 구독자가 없다면
            if (!callback) return;

            // 콜백 실행
            callback(type, data);
        }
    }

    addData(data) {
        if (!data) return;
        
        this._dataStore.set(data.id, data);
        this._notify(DataChange.ADD, data);
    }

    getDataById(id) {
        const data = this._dataStore.get(id);

        if (!data) return null;
        
        return data;
    }

    updateDataById(id, value) {
        const data = this.getDataById(id);
        if (data) {
            data.value = value;
        }
        this._notify(DataChange.UPDATE, data);
    }
    
    deleteData(id) {
        if (!this._dataStore.has(id)) return;

        this._dataStore.delete(id);
        this._notify(DataChange.DELETE);
    }
    
    clear() {
        this._dataStore.clear();
        this._notify(DataChange.CLEAR);
    }

    /** dataStore를 배열로 반환 */
    getDataList() {
        if (this._dataStore) {
            return [...this._dataStore.values()];
        } else {
            return [];
        }
    }

    hasData() {
        return this.getDataList().length !== 0;
    }

    IsExistId(id) {
        return this._dataStore.has(id.toString());
    }
}
