-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own artwork submissions" ON artwork_submissions;
DROP POLICY IF EXISTS "Users can insert own artwork submissions" ON artwork_submissions;
DROP POLICY IF EXISTS "Admins and operators can view all artwork submissions" ON artwork_submissions;
DROP POLICY IF EXISTS "Admins and operators can update artwork submissions" ON artwork_submissions;

-- Now create the policies fresh
CREATE POLICY "Users can view own artwork submissions"
    ON artwork_submissions FOR SELECT
    USING (
        auth.uid() = user_id
    );

CREATE POLICY "Users can insert own artwork submissions"
    ON artwork_submissions FOR INSERT
    WITH CHECK (
        auth.uid() = user_id OR user_id IS NULL
    );

CREATE POLICY "Admins and operators can view all artwork submissions"
    ON artwork_submissions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'operator')
        )
    );

CREATE POLICY "Admins and operators can update artwork submissions"
    ON artwork_submissions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE user_profiles.id = auth.uid()
            AND user_profiles.role IN ('admin', 'operator')
        )
    );

-- Verify policies were created
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename = 'artwork_submissions';
