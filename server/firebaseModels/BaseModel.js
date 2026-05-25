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
        let inChunks = null;
        let inKey = null;

        if (options.where) {
            for (const [key, value] of Object.entries(options.where)) {
                if (Array.isArray(value)) {
                    inKey = key;
                    inChunks = [];
                    // Chunk into groups of 10 to avoid Firestore limits
                    for (let i = 0; i < value.length; i += 10) {
                        inChunks.push(value.slice(i, i + 10));
                    }
                } else {
                    if (key === 'id') {
                        const { admin } = require('../config/firebase');
                        query = query.where(admin.firestore.FieldPath.documentId(), '==', value);
                    } else {
                        query = query.where(key, '==', value);
                    }
                }
            }
        }

        if (inChunks && inChunks.length > 0) {
            const allDocs = [];
            for (const chunk of inChunks) {
                if (chunk.length === 0) continue;
                let chunkQuery = query;
                if (inKey === 'id') {
                    const { admin } = require('../config/firebase');
                    chunkQuery = chunkQuery.where(admin.firestore.FieldPath.documentId(), 'in', chunk);
                } else {
                    chunkQuery = chunkQuery.where(inKey, 'in', chunk);
                }
                if (options.limit) {
                    chunkQuery = chunkQuery.limit(options.limit);
                }
                const snapshot = await chunkQuery.get();
                allDocs.push(...snapshot.docs);
            }
            return allDocs.map(doc => this._wrapDoc(doc));
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

    async update(data, options = {}) {
        let query = this.collection;
        if (options.where) {
            for (const [key, value] of Object.entries(options.where)) {
                if (key === 'id') {
                    const { admin } = require('../config/firebase');
                    query = query.where(admin.firestore.FieldPath.documentId(), '==', value.toString());
                } else {
                    query = query.where(key, '==', value);
                }
            }
        }
        const snapshot = await query.get();
        if (snapshot.empty) return [0];

        const batch = firestore.batch();
        snapshot.docs.forEach(doc => {
            batch.update(doc.ref, data);
        });
        await batch.commit();
        
        return [snapshot.size];
    }
}

module.exports = BaseModel;
