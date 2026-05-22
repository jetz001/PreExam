const { User } = require('./models');

async function checkColumns() {
    try {
        const tableInfo = await User.describe();
        console.log("Columns in 'users' table:");
        console.log(JSON.stringify(Object.keys(tableInfo), null, 2));
    } catch (error) {
        console.error("Error describing table:", error);
    }
}

checkColumns();
