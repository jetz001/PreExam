const { db: firestore } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

class BaseModel {
    constructor(collectionName) {
        this.collectionName = collectionName;
        this.collection = firestore.collection(collectionName);
    }

    _wrapDoc(doc) {
        if (!doc.exists) return null;
        const data = doc.data();
        const self = this;
        return {
            id: doc.id,
            ...data,
            update: async function(updates) {
                await self.collection.doc(doc.id).update(updates);
                Object.assign(this, updates);
            },
            save: async function() {
                // remove update and save methods before saving
                const toSave = { ...this };
                delete toSave.update;
                delete toSave.save;
                await self.collection.doc(doc.id).set(toSave, { merge: true });
            }
        };
    }

    async findOne(options = {}) {
        let query = this.collection;
        if (options.where) {
            for (const [key, value] of Object.entries(options.where)) {
                if (typeof value === 'object' && value !== null) {
                   const symbols = Object.getOwnPropertySymbols(value);
                   if (symbols.length > 0) {
                      // rough approximation for Sequelize Op
                      query = query.where(key, '>', value[symbols[0]]);
                   }
                } else {
                    query = query.where(key, '==', value);
                }
            }
        }
        const snapshot = await query.limit(1).get();
        if (snapshot.empty) return null;
        return this._wrapDoc(snapshot.docs[0]);
    }

    async findByPk(id, options = {}) {
        if (!id) return null;
        const doc = await this.collection.doc(id.toString()).get();
        return this._wrapDoc(doc);
    }

    async findAll(options = {}) {
        let query = this.collection;
        if (options.where) {
            for (const [key, value] of Object.entries(options.where)) {
                query = query.where(key, '==', value);
            }
        }
        if (options.limit) {
            query = query.limit(options.limit);
        }
        const snapshot = await query.get();
        return snapshot.docs.map(doc => this._wrapDoc(doc));
    }

    async create(data) {
        const id = data.id || Date.now().toString() + Math.floor(Math.random()*1000);
        const docRef = this.collection.doc(id.toString());
        const docData = {
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        if (this.collectionName === 'users') {
            docData.public_id = docData.public_id || uuidv4();
        }
        await docRef.set(docData);
        
        const mockDoc = { exists: true, id: id.toString(), data: () => docData };
        return this._wrapDoc(mockDoc);
    }

    async destroy(options = {}) {
        let query = this.collection;
        if (options.where) {
            for (const [key, value] of Object.entries(options.where)) {
                query = query.where(key, '==', value);
            }
            const snapshot = await query.get();
            const batch = firestore.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            return snapshot.size;
        }
        return 0;
    }
}

module.exports = BaseModel;
