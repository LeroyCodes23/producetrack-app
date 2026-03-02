// test scripts/manuals/test-registration.js
const fetch = require('node-fetch');

const API_URL = 'http://localhost:9002/api';

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function logSuccess(msg) { console.log(`${colors.green}✅ ${msg}${colors.reset}`); }
function logError(msg) { console.log(`${colors.red}❌ ${msg}${colors.reset}`); }
function logInfo(msg) { console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`); }
function logStep(msg) { console.log(`\n${colors.yellow}📌 ${msg}${colors.reset}`); }

async function testRegistration() {
    console.log(`${colors.cyan}${colors.bright}=======================================`);
    console.log('    USER REGISTRATION TEST');
    console.log(`=======================================${colors.reset}\n`);
    
    const timestamp = Date.now();
    const testUser = {
        email: `testuser${timestamp}@example.com`,
        password: 'TestPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'Producer'
    };
    
    logInfo('Test User Data:');
    console.log(`   Email: ${testUser.email}`);
    console.log(`   Name: ${testUser.firstName} ${testUser.lastName}`);
    console.log(`   Role: ${testUser.role}`);
    
    logStep('Step 1: Sending registration request...');
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testUser)
        });

        const data = await response.json();
        
        console.log(`\n📊 Status Code: ${response.status}`);
        
        if (response.ok) {
            logSuccess('Registration successful!');
            console.log('Response:', JSON.stringify(data, null, 2));
            
            logStep('Step 2: Verify in database');
            console.log('\nRun this SQL query:');
            console.log(`SELECT * FROM Users WHERE Email = '${testUser.email}';`);
        } else {
            logError(`Registration failed: ${data.error || 'Unknown error'}`);
            console.log('Full response:', data);
        }
    } catch (error) {
        logError(`Test error: ${error.message}`);
    }
}

testRegistration();
