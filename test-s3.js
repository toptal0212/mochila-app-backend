/**
 * Test script to verify S3 configuration and upload functionality
 * Run with: node test-s3.js
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import S3 utilities
const { uploadToS3, deleteFromS3, isS3Enabled, getS3Config } = require('./utils/s3Upload');

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testS3Configuration() {
    console.log('\n' + '='.repeat(60));
    log('AWS S3 Configuration Test', 'cyan');
    console.log('='.repeat(60) + '\n');

    // Step 1: Check configuration
    log('📋 Step 1: Checking S3 Configuration...', 'blue');
    const config = getS3Config();
    
    console.log('Configuration Status:');
    console.log(`  USE_S3_STORAGE: ${process.env.USE_S3_STORAGE}`);
    console.log(`  S3 Enabled: ${config.enabled ? '✅' : '❌'}`);
    console.log(`  Has Credentials: ${config.hasCredentials ? '✅' : '❌'}`);
    console.log(`  Bucket: ${config.bucket}`);
    console.log(`  Region: ${config.region}`);
    
    if (!config.enabled) {
        log('\n⚠️  S3 is not enabled!', 'yellow');
        log('To enable S3, set USE_S3_STORAGE=true in your .env file', 'yellow');
        return false;
    }
    
    if (!config.hasCredentials) {
        log('\n❌ AWS credentials are missing!', 'red');
        log('Please add the following to your .env file:', 'yellow');
        log('  AWS_ACCESS_KEY_ID=your-access-key-id', 'yellow');
        log('  AWS_SECRET_ACCESS_KEY=your-secret-access-key', 'yellow');
        log('  AWS_S3_BUCKET=your-bucket-name', 'yellow');
        log('  AWS_REGION=your-aws-region', 'yellow');
        return false;
    }
    
    log('\n✅ S3 Configuration looks good!\n', 'green');
    
    // Step 2: Create test image
    log('📝 Step 2: Creating test image...', 'blue');
    const testImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
    );
    log('✅ Test image created (1x1 pixel PNG)\n', 'green');
    
    // Step 3: Upload test image
    log('📤 Step 3: Uploading test image to S3...', 'blue');
    let uploadedUrl;
    try {
        uploadedUrl = await uploadToS3(
            testImageBuffer,
            'test-image.png',
            'image/png',
            'test-uploads'
        );
        log(`✅ Upload successful!`, 'green');
        log(`   URL: ${uploadedUrl}`, 'cyan');
    } catch (error) {
        log(`❌ Upload failed: ${error.message}`, 'red');
        log('\nPossible issues:', 'yellow');
        log('  - Check AWS credentials are correct', 'yellow');
        log('  - Verify bucket name and region', 'yellow');
        log('  - Ensure IAM user has S3 PutObject permission', 'yellow');
        return false;
    }
    
    // Step 4: Test public access
    log('\n🌐 Step 4: Testing public access...', 'blue');
    log(`   Try opening this URL in your browser:`, 'cyan');
    log(`   ${uploadedUrl}`, 'cyan');
    log('   (A 1x1 pixel image should load)', 'yellow');
    
    // Step 5: Delete test image
    log('\n🗑️  Step 5: Cleaning up test image...', 'blue');
    try {
        const deleted = await deleteFromS3(uploadedUrl);
        if (deleted) {
            log('✅ Test image deleted successfully', 'green');
        } else {
            log('⚠️  Could not delete test image (may not exist)', 'yellow');
        }
    } catch (error) {
        log(`⚠️  Delete failed: ${error.message}`, 'yellow');
    }
    
    // Final summary
    console.log('\n' + '='.repeat(60));
    log('✅ S3 Test Complete!', 'green');
    console.log('='.repeat(60));
    log('\nYour S3 configuration is working correctly!', 'green');
    log('Images will be uploaded to:', 'cyan');
    log(`  Bucket: ${config.bucket}`, 'cyan');
    log(`  Region: ${config.region}`, 'cyan');
    log(`  Folder: profile-photos/`, 'cyan');
    log('\nYou can now upload images from your app.', 'green');
    console.log('');
    
    return true;
}

// Run the test
testS3Configuration()
    .then((success) => {
        process.exit(success ? 0 : 1);
    })
    .catch((error) => {
        log(`\n❌ Unexpected error: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    });

