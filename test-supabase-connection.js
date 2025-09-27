// Test Supabase Connection Script
// Run this to verify your Supabase setup is working

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://tzljwzbliuzicobzctgi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6bGp3emJsaXV6aWNvYnpjdGdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MTk1NDksImV4cCI6MjA3NDE5NTU0OX0.3dR9y4Hm2DYeYISJTyNxZ9r_q5BOqO76_JhOdli05Mk'

async function testSupabaseConnection() {
  console.log('🔄 Testing Supabase connection...')
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test 1: Check connection
    console.log('✅ Supabase client created successfully')
    
    // Test 2: Try to read subjects table
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .limit(5)
    
    if (subjectsError) {
      console.log('❌ Error reading subjects table:', subjectsError.message)
      console.log('🔧 This means database tables need to be created')
      return false
    }
    
    console.log('✅ Successfully read subjects table')
    console.log(`📊 Found ${subjects.length} subjects in database`)
    
    // Test 3: Try to read profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)
    
    if (profilesError) {
      console.log('❌ Error reading profiles table:', profilesError.message)
      return false
    }
    
    console.log('✅ Successfully read profiles table')
    console.log(`👥 Found ${profiles.length} profiles in database`)
    
    // Test 4: Check authentication settings
    console.log('🔐 Testing authentication...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    
    if (authError) {
      console.log('⚠️ Auth warning (this is normal for anonymous access):', authError.message)
    } else {
      console.log('✅ Authentication service is working')
    }
    
    console.log('🎉 All Supabase tests passed! Your setup is working correctly.')
    return true
    
  } catch (error) {
    console.log('❌ Failed to connect to Supabase:', error.message)
    console.log('🔧 Check your environment variables and network connection')
    return false
  }
}

// Run the test
testSupabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n🎯 Next Steps:')
      console.log('1. Your Supabase is configured correctly')
      console.log('2. Try registering a student in your app')
      console.log('3. Data should now persist after logout')
    } else {
      console.log('\n🔧 To Fix:')
      console.log('1. Run the SQL script in Supabase SQL Editor')
      console.log('2. Disable email confirmations in Auth Settings')
      console.log('3. Set correct redirect URLs')
    }
  })
  .catch(error => {
    console.log('❌ Test failed:', error.message)
  })