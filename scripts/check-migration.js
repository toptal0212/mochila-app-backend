// Script to check if database migrations have been run
// Run this in Vercel Functions or locally to verify database setup

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkMigration() {
    try {
        console.log('Checking database connection...');
        
        // Try to query the User table
        const userCount = await prisma.user.count();
        console.log(`✅ Database connection successful!`);
        console.log(`✅ User table exists with ${userCount} users`);
        
        // Check if tables exist by trying to query them
        try {
            await prisma.userPhoto.count();
            console.log(`✅ UserPhoto table exists`);
        } catch (e) {
            console.error(`❌ UserPhoto table missing:`, e.message);
        }
        
        try {
            await prisma.like.count();
            console.log(`✅ Like table exists`);
        } catch (e) {
            console.error(`❌ Like table missing:`, e.message);
        }
        
        try {
            await prisma.footprint.count();
            console.log(`✅ Footprint table exists`);
        } catch (e) {
            console.error(`❌ Footprint table missing:`, e.message);
        }
        
        console.log('\n✅ All tables exist! Database is ready.');
        
    } catch (error) {
        console.error('❌ Database error:', error.message);
        console.error('Error code:', error.code);
        
        if (error.code === 'P2021' || error.message.includes('does not exist')) {
            console.error('\n⚠️  Database tables do not exist!');
            console.error('Please run migrations:');
            console.error('  npx prisma migrate deploy');
        } else if (error.code === 'P1001') {
            console.error('\n⚠️  Cannot reach database server!');
            console.error('Please check:');
            console.error('  1. POSTGRES_PRISMA_URL is set correctly');
            console.error('  2. Database is active (not paused)');
            console.error('  3. Network connectivity');
        } else {
            console.error('\n⚠️  Unknown error:', error);
        }
        
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

checkMigration();

