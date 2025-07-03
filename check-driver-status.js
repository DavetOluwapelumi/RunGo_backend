const { createConnection } = require('typeorm');
const Driver = require('./src/entities/driver.entity').default;

async function checkDriverStatus() {
    try {
        // Create database connection
        const connection = await createConnection({
            type: 'mysql',
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            username: process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'rungo',
            entities: [Driver],
            synchronize: false,
        });

        console.log('🔍 Checking driver availability status...\n');

        // Find all drivers
        const driverRepository = connection.getRepository(Driver);
        const drivers = await driverRepository.find();

        if (drivers.length === 0) {
            console.log('❌ No drivers found in database');
        } else {
            console.log(`📊 Found ${drivers.length} drivers:`);
            drivers.forEach(driver => {
                const status = driver.isAvailable ? '🟢 Available' : '🔴 Unavailable';
                console.log(`  - ${driver.firstName} ${driver.lastName} (${driver.identifier}): ${status}`);
            });
        }

        await connection.close();
    } catch (error) {
        console.error('❌ Error checking driver status:', error.message);
    }
}

checkDriverStatus(); 