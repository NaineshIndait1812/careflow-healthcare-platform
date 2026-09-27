-- ============================================================
-- CareFlow Healthcare Platform — Initial Database Schema
-- Migration: 001_initial_careflow_schema.sql
-- Date: 2026-09-27
-- ============================================================
-- Apply this migration via the Supabase SQL Editor.
-- This creates all application tables, indexes, RLS policies,
-- and triggers for the CareFlow platform.
-- ============================================================

-- =========================
-- HELPER: updated_at trigger
-- =========================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================
-- TABLE 1: profiles
-- =========================
CREATE TABLE public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  date_of_birth DATE,
  gender        TEXT,
  blood_group   TEXT,
  address       TEXT,
  emergency_contact TEXT,
  role          TEXT NOT NULL DEFAULT 'PATIENT'
                CHECK (role IN ('PATIENT', 'ADMIN')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Patient and admin profiles, linked 1:1 to auth.users.';

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================
-- TABLE 2: facilities
-- =========================
CREATE TABLE public.facilities (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                TEXT NOT NULL,
  type                TEXT NOT NULL
                      CHECK (type IN ('HOSPITAL', 'CLINIC', 'DIAGNOSTIC_CENTER', 'BLOOD_BANK')),
  address             TEXT NOT NULL,
  phone               TEXT,
  operating_hours     TEXT,
  emergency_available BOOLEAN NOT NULL DEFAULT false,
  latitude            DOUBLE PRECISION,
  longitude           DOUBLE PRECISION,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.facilities IS 'Healthcare facilities: hospitals, clinics, diagnostic centers, blood banks.';

-- =========================
-- TABLE 3: appointments
-- =========================
CREATE TABLE public.appointments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  facility_id      UUID NOT NULL REFERENCES public.facilities(id) ON DELETE RESTRICT,
  doctor_name      TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason           TEXT,
  status           TEXT NOT NULL DEFAULT 'PENDING'
                   CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED')),
  notes            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.appointments IS 'Patient appointments at facilities.';

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================
-- TABLE 4: ambulance_requests
-- =========================
CREATE TABLE public.ambulance_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  pickup_location   TEXT NOT NULL,
  emergency_contact TEXT,
  request_type      TEXT,
  ambulance_id      TEXT,
  driver_name       TEXT,
  driver_phone      TEXT,
  status            TEXT NOT NULL DEFAULT 'REQUESTED'
                    CHECK (status IN ('REQUESTED', 'ASSIGNED', 'ON_THE_WAY', 'ARRIVED', 'COMPLETED', 'CANCELLED')),
  requested_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ambulance_requests IS 'Emergency ambulance request coordination.';

CREATE TRIGGER ambulance_requests_updated_at
  BEFORE UPDATE ON public.ambulance_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================
-- TABLE 5: blood_banks
-- =========================
CREATE TABLE public.blood_banks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  location        TEXT NOT NULL,
  phone           TEXT,
  operating_hours TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.blood_banks IS 'Blood bank locations.';

-- =========================
-- TABLE 6: blood_inventory
-- =========================
CREATE TABLE public.blood_inventory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_bank_id   UUID NOT NULL REFERENCES public.blood_banks(id) ON DELETE CASCADE,
  blood_group     TEXT NOT NULL
                  CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  units_available INTEGER NOT NULL DEFAULT 0
                  CHECK (units_available >= 0),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.blood_inventory IS 'Blood units available per blood group per blood bank.';

CREATE TRIGGER blood_inventory_updated_at
  BEFORE UPDATE ON public.blood_inventory
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================
-- TABLE 7: notifications
-- =========================
CREATE TABLE public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT,
  read       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.notifications IS 'In-app user notifications.';

-- ============================================================
-- INDEXES
-- ============================================================

-- appointments
CREATE INDEX idx_appointments_patient_id ON public.appointments(patient_id);
CREATE INDEX idx_appointments_date       ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status     ON public.appointments(status);

-- ambulance_requests
CREATE INDEX idx_ambulance_requests_patient_id ON public.ambulance_requests(patient_id);
CREATE INDEX idx_ambulance_requests_status     ON public.ambulance_requests(status);

-- blood_inventory
CREATE INDEX idx_blood_inventory_blood_group   ON public.blood_inventory(blood_group);
CREATE INDEX idx_blood_inventory_blood_bank_id ON public.blood_inventory(blood_bank_id);

-- notifications
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read    ON public.notifications(read);

-- facilities
CREATE INDEX idx_facilities_type                ON public.facilities(type);
CREATE INDEX idx_facilities_emergency_available ON public.facilities(emergency_available);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambulance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_banks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_inventory   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications     ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------
-- Helper: check if the current user has ADMIN role.
-- NOTE: This queries the profiles table. Because profiles
-- itself has RLS enabled, we use SECURITY DEFINER to bypass
-- RLS inside this function.
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------
-- profiles
-- ---------------------------------------------------------
-- Patients: read/update own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins: full access
CREATE POLICY "Admins full access to profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

-- Allow insert during signup trigger (service role bypasses RLS,
-- but this policy also allows the trigger function if needed).
CREATE POLICY "Allow profile insert for own user"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------
-- facilities (public read, admin manage)
-- ---------------------------------------------------------
CREATE POLICY "Anyone can read facilities"
  ON public.facilities FOR SELECT
  USING (true);

CREATE POLICY "Admins manage facilities"
  ON public.facilities FOR ALL
  USING (public.is_admin());

-- ---------------------------------------------------------
-- appointments
-- ---------------------------------------------------------
CREATE POLICY "Patients read own appointments"
  ON public.appointments FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients create own appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Admins manage appointments"
  ON public.appointments FOR ALL
  USING (public.is_admin());

-- ---------------------------------------------------------
-- ambulance_requests
-- ---------------------------------------------------------
CREATE POLICY "Patients read own ambulance requests"
  ON public.ambulance_requests FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients create own ambulance requests"
  ON public.ambulance_requests FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Admins manage ambulance requests"
  ON public.ambulance_requests FOR ALL
  USING (public.is_admin());

-- ---------------------------------------------------------
-- blood_banks (public read, admin manage)
-- ---------------------------------------------------------
CREATE POLICY "Anyone can read blood banks"
  ON public.blood_banks FOR SELECT
  USING (true);

CREATE POLICY "Admins manage blood banks"
  ON public.blood_banks FOR ALL
  USING (public.is_admin());

-- ---------------------------------------------------------
-- blood_inventory (public read, admin manage)
-- ---------------------------------------------------------
CREATE POLICY "Anyone can read blood inventory"
  ON public.blood_inventory FOR SELECT
  USING (true);

CREATE POLICY "Admins manage blood inventory"
  ON public.blood_inventory FOR ALL
  USING (public.is_admin());

-- ---------------------------------------------------------
-- notifications
-- ---------------------------------------------------------
CREATE POLICY "Users read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own notification read status"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage notifications"
  ON public.notifications FOR ALL
  USING (public.is_admin());

-- ============================================================
-- AUTH TRIGGER: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email,
    'PATIENT'   -- always default to PATIENT; admins set manually
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- END OF MIGRATION
-- ============================================================
