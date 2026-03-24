const mongoose = require('mongoose');

async function clearDB() {
    const uri = 'mongodb+srv://admin:ayush2703@cluster0.n7gwjes.mongodb.net/civicvoice';
    
    try {
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');
        
        const collections = mongoose.connection.collections;
        
        for (const name in collections) {
            await collections[name].deleteMany({});
            console.log(`Cleared collection: ${name}`);
        }
        
        console.log('All collections cleared successfully!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
}

clearDB();
