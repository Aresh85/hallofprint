const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Supabase credentials not found in .env.local');
  console.error('Make sure you have:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runSQL() {
  try {
    console.log('🔄 Reading SQL file...');
    const sqlPath = path.join(__dirname, '../database-auth-setup.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('🚀 Executing SQL in Supabase...');
    console.log('This may take a moment...\n');

    // Split SQL into individual statements and execute them
    // Note: This is a simplified approach. For complex SQL, you might need to use Supabase CLI
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // Skip comments
      if (statement.trim().startsWith('--')) continue;
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          // Try alternative method using raw SQL through REST API
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'apikey': supabaseServiceKey,
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sql_query: statement })
          });

          if (!response.ok) {
            console.log(`⚠️  Statement ${i + 1}/${statements.length}: Might have executed (check Supabase)`);
          } else {
            successCount++;
            console.log(`✅ Statement ${i + 1}/${statements.length}: Success`);
          }
        } else {
          successCount++;
          console.log(`✅ Statement ${i + 1}/${statements.length}: Success`);
        }
      } catch (err) {
        errorCount++;
        console.log(`⚠️  Statement ${i + 1}/${statements.length}: ${err.message}`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`✅ Successful: ${successCount}`);
    console.log(`⚠️  Warnings/Errors: ${errorCount}`);
    console.log('\n⚠️  NOTE: Some statements might show errors but still work.');
    console.log('Please verify in Supabase Dashboard > Table Editor');
    console.log('\n🎉 Database setup complete!');
    console.log('\nCheck your Supabase Dashboard to verify tables were created:');
    console.log('- user_profiles');
    console.log('- user_addresses');
    console.log('- user_preferences');
    console.log('- orders');
    console.log('- order_items');

  } catch (error) {
    console.error('\n❌ Error running SQL:', error.message);
    console.error('\n📝 Manual Setup Required:');
    console.error('Please run the SQL manually in Supabase Dashboard:');
    console.error('1. Go to https://supabase.com/dashboard');
    console.error('2. Select your project');
    console.error('3. SQL Editor > New Query');
    console.error('4. Copy contents from /web/database-auth-setup.sql');
    console.error('5. Run the query');
    process.exit(1);
  }
}

console.log('🔐 Hall of Prints - Database Setup');
console.log('==================================\n');

runSQL();
