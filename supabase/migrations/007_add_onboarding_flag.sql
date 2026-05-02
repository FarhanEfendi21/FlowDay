-- ============================================================
-- FlowDay – Migration 007: Add Onboarding Completed Flag
-- Tambah kolom untuk track apakah user sudah complete onboarding
-- ============================================================

-- Add onboarding_completed column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding 
ON public.profiles (onboarding_completed);

-- Add comment
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Flag untuk track apakah user sudah menyelesaikan onboarding (true = sudah, false = belum)';
