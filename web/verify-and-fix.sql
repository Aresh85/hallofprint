-- STEP 1: Check current RLS status and policies
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

-- STEP 2: List all current policies on user_profiles
SELECT 
  policyname,
  cmd as "Command Type"
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- STEP 3: FORCE disable RLS and remove ALL policies
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Operators can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;

-- STEP 4: Grant permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO anon;

-- STEP 5: Verify it's fixed
SELECT 
  tablename, 
  rowsecurity as "RLS Enabled (should be FALSE)"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

SELECT 
  COUNT(*) as "Number of Policies (should be 0)"
FROM pg_policies 
WHERE tablename = 'user_profiles';
