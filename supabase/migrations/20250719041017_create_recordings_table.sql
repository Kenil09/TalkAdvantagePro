-- Create recordings table with file information

CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  filepath TEXT,
  filename TEXT,
  recording_date DATE,
  recording_time TIME,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  transcript TEXT,
  tags JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_recordings_date ON recordings(recording_date);

-- Enable Row Level Security
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Allow users to select their own recordings
CREATE POLICY "Users can access their own recordings"
  ON recordings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
