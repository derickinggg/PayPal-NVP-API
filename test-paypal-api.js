#!/usr/bin/env node

/**
 * PayPal NVP API Test Script
 * This script tests all the NVP API methods and helps debug credential issues
 */

const axios = require('axios');

// Your PayPal API credentials
const CREDENTIALS = {
    username: 'dangthinhan461_api1.gmail.com',
    password: 'MCFMLAD9T5S6KFZA',
    signature: 'A4pjdpHZi6krOedAQhQBjccpo8g5AjJ56G0iL4-KtIlE1tc7CofRIu7p'
};

// Test both sandbox and live environments
const ENVIRONMENTS = ['sandbox', 'live'];

// NVP API endpoints
const ENDPOINTS = {
    sandbox: 'https://api-3t.sandbox.paypal.com/nvp',
    live: 'https://api-3t.paypal.com/nvp'
};

// Helper function to convert params to form data
function toFormUrlEncoded(params) {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            usp.append(key, String(value));
        }
    });
    return usp.toString();
}

// Helper function to parse NVP response
function parseNvp(body) {
    const obj = {};
    body.split('&').forEach((pair) => {
        const [k, v] = pair.split('=');
        if (k) obj[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
    return obj;
}

// Test API credentials
async function testCredentials(env) {
    console.log(`\n🔍 Testing ${env.toUpperCase()} environment...`);
    console.log('=' .repeat(50));
    
    const endpoint = ENDPOINTS[env];
    const payload = {
        METHOD: 'GetBalance',
        VERSION: '204.0',
        USER: CREDENTIALS.username,
        PWD: CREDENTIALS.password,
        SIGNATURE: CREDENTIALS.signature,
        RETURNALLCURRENCIES: 1
    };
    
    try {
        console.log(`📡 Making request to: ${endpoint}`);
        console.log(`👤 Username: ${CREDENTIALS.username}`);
        console.log(`🔑 Password: ${CREDENTIALS.password.substring(0, 8)}...`);
        console.log(`✍️  Signature: ${CREDENTIALS.signature.substring(0, 20)}...`);
        
        const response = await axios.post(endpoint, toFormUrlEncoded(payload), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 30000
        });
        
        const parsed = parseNvp(response.data);
        console.log(`✅ Response received (Status: ${response.status})`);
        
        if (parsed.ACK === 'Success') {
            console.log('🎉 SUCCESS! Credentials are valid.');
            console.log('💰 Balance Information:');
            Object.keys(parsed).forEach(key => {
                if (key.includes('BALANCE') || key.includes('CURRENCY')) {
                    console.log(`   ${key}: ${parsed[key]}`);
                }
            });
            return true;
        } else {
            console.log('❌ FAILED! API returned an error:');
            console.log(`   ACK: ${parsed.ACK}`);
            console.log(`   Error Code: ${parsed.L_ERRORCODE0 || 'N/A'}`);
            console.log(`   Short Message: ${parsed.L_SHORTMESSAGE0 || 'N/A'}`);
            console.log(`   Long Message: ${parsed.L_LONGMESSAGE0 || 'N/A'}`);
            console.log(`   Severity: ${parsed.L_SEVERITYCODE0 || 'N/A'}`);
            console.log(`   Correlation ID: ${parsed.CORRELATIONID || 'N/A'}`);
            return false;
        }
        
    } catch (error) {
        console.log(`💥 Request failed: ${error.message}`);
        if (error.response) {
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data: ${error.response.data}`);
        }
        return false;
    }
}

// Test all NVP methods (if credentials are valid)
async function testAllMethods(env) {
    console.log(`\n🧪 Testing all NVP methods for ${env.toUpperCase()}...`);
    console.log('=' .repeat(50));
    
    const endpoint = ENDPOINTS[env];
    const baseParams = {
        VERSION: '204.0',
        USER: CREDENTIALS.username,
        PWD: CREDENTIALS.password,
        SIGNATURE: CREDENTIALS.signature
    };
    
    const methods = [
        {
            name: 'GetBalance',
            params: { ...baseParams, METHOD: 'GetBalance', RETURNALLCURRENCIES: 1 }
        },
        {
            name: 'TransactionSearch',
            params: { 
                ...baseParams, 
                METHOD: 'TransactionSearch',
                STARTDATE: '2024-01-01T00:00:00Z',
                ENDDATE: new Date().toISOString()
            }
        }
    ];
    
    for (const method of methods) {
        console.log(`\n📡 Testing ${method.name}...`);
        try {
            const response = await axios.post(endpoint, toFormUrlEncoded(method.params), {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 30000
            });
            
            const parsed = parseNvp(response.data);
            if (parsed.ACK === 'Success') {
                console.log(`✅ ${method.name}: SUCCESS`);
                if (method.name === 'GetBalance') {
                    console.log('   Balance details available');
                } else if (method.name === 'TransactionSearch') {
                    console.log(`   Found ${parsed.L_COUNT0 || 0} transactions`);
                }
            } else {
                console.log(`❌ ${method.name}: FAILED`);
                console.log(`   Error: ${parsed.L_SHORTMESSAGE0 || 'Unknown error'}`);
            }
        } catch (error) {
            console.log(`💥 ${method.name}: REQUEST FAILED - ${error.message}`);
        }
    }
}

// Main test function
async function runTests() {
    console.log('🚀 PayPal NVP API Credential Test Script');
    console.log('=' .repeat(50));
    console.log(`Testing credentials for: ${CREDENTIALS.username}`);
    console.log(`Signature length: ${CREDENTIALS.signature.length} characters`);
    
    let validEnv = null;
    
    for (const env of ENVIRONMENTS) {
        const isValid = await testCredentials(env);
        if (isValid) {
            validEnv = env;
            break;
        }
    }
    
    if (validEnv) {
        console.log(`\n🎯 Valid environment found: ${validEnv.toUpperCase()}`);
        await testAllMethods(validEnv);
        
        console.log(`\n🌐 Dashboard Access:`);
        console.log(`   Frontend: http://localhost:5173`);
        console.log(`   Backend:  http://localhost:4000/api`);
        console.log(`\n📝 Next Steps:`);
        console.log(`   1. Open http://localhost:5173 in your browser`);
        console.log(`   2. Enter your credentials in the dashboard`);
        console.log(`   3. Select environment: ${validEnv}`);
        console.log(`   4. Test the API methods interactively`);
        
    } else {
        console.log(`\n❌ No valid environment found. Possible issues:`);
        console.log(`   1. API credentials are incorrect or expired`);
        console.log(`   2. Account doesn't have API access enabled`);
        console.log(`   3. Account is suspended or restricted`);
        console.log(`   4. IP address is not whitelisted`);
        console.log(`\n🔧 Troubleshooting:`);
        console.log(`   1. Verify credentials in your PayPal account`);
        console.log(`   2. Check if API access is enabled`);
        console.log(`   3. Contact PayPal support if needed`);
        console.log(`\n💡 Dashboard still available for testing:`);
        console.log(`   Frontend: http://localhost:5173`);
        console.log(`   Backend:  http://localhost:4000/api`);
    }
}

// Run the tests
runTests().catch(console.error);