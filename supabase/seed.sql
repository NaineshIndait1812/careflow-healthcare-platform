-- ============================================================
-- CareFlow — Seed Data
-- ============================================================
-- Safe to run after 001_initial_careflow_schema.sql.
-- Contains only reference data (facilities, blood banks,
-- blood inventory). No user/auth-dependent rows.
-- ============================================================

-- Facilities
INSERT INTO public.facilities (name, type, address, phone, operating_hours, emergency_available, latitude, longitude) VALUES
  ('City General Hospital',     'HOSPITAL',          '123 Main Street, Metro City',      '+91-9000000001', '24/7',               true,  19.0760, 72.8777),
  ('GreenCare Clinic',          'CLINIC',            '45 Park Avenue, Metro City',       '+91-9000000002', '08:00 AM – 08:00 PM', false, 19.0820, 72.8810),
  ('Metro Diagnostics',         'DIAGNOSTIC_CENTER', '78 Health Lane, Metro City',       '+91-9000000003', '07:00 AM – 09:00 PM', false, 19.0700, 72.8750),
  ('LifeLine Blood Bank',       'BLOOD_BANK',        '90 Red Cross Road, Metro City',    '+91-9000000004', '09:00 AM – 06:00 PM', false, 19.0650, 72.8800),
  ('Sunrise Multi-Specialty',   'HOSPITAL',          '200 Sunrise Boulevard, Metro City', '+91-9000000005', '24/7',               true,  19.0900, 72.8900);

-- Blood Banks
INSERT INTO public.blood_banks (name, location, phone, operating_hours) VALUES
  ('LifeLine Blood Bank',   '90 Red Cross Road, Metro City',   '+91-9000000004', '09:00 AM – 06:00 PM'),
  ('CityBlood Centre',      '12 Donation Drive, Metro City',   '+91-9000000006', '08:00 AM – 05:00 PM');

-- Blood Inventory (for the two blood banks above)
-- We use a subquery to reference the blood_bank_id by name.
INSERT INTO public.blood_inventory (blood_bank_id, blood_group, units_available)
SELECT bb.id, bg.blood_group, bg.units
FROM (SELECT id FROM public.blood_banks WHERE name = 'LifeLine Blood Bank' LIMIT 1) bb,
     (VALUES ('A+',12), ('A-',5), ('B+',8), ('B-',3), ('AB+',4), ('AB-',2), ('O+',15), ('O-',6)) AS bg(blood_group, units);

INSERT INTO public.blood_inventory (blood_bank_id, blood_group, units_available)
SELECT bb.id, bg.blood_group, bg.units
FROM (SELECT id FROM public.blood_banks WHERE name = 'CityBlood Centre' LIMIT 1) bb,
     (VALUES ('A+',10), ('A-',3), ('B+',7), ('B-',2), ('AB+',5), ('AB-',1), ('O+',20), ('O-',4)) AS bg(blood_group, units);

-- ============================================================
-- END OF SEED DATA
-- ============================================================
