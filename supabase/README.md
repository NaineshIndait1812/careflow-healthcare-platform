# CareFlow Database Schema

## Tables

| Table | Purpose |
|-------|---------|
| `profiles` | Patient/admin profiles, linked 1:1 to `auth.users` |
| `facilities` | Hospitals, clinics, diagnostic centers, blood banks |
| `appointments` | Patient appointments at facilities |
| `ambulance_requests` | Emergency ambulance coordination |
| `blood_banks` | Blood bank locations |
| `blood_inventory` | Blood units per group per blood bank |
| `notifications` | In-app user notifications |

## Relationships

```
auth.users  ──1:1──▶  profiles
profiles    ──1:N──▶  appointments
facilities  ──1:N──▶  appointments
profiles    ──1:N──▶  ambulance_requests
blood_banks ──1:N──▶  blood_inventory
profiles    ──1:N──▶  notifications
```

## Roles

- **PATIENT** — default role on signup. Can manage own data.
- **ADMIN** — full access. Must be set manually in the database.

## Row Level Security

RLS is enabled on all tables. Key rules:
- Patients see/modify only their own rows.
- Facilities, blood banks, and blood inventory are publicly readable.
- Admins have full access via the `is_admin()` helper function.

## How to Apply

### 1. Run the migration

Open the **Supabase SQL Editor** and paste the contents of:

```
supabase/migrations/001_initial_careflow_schema.sql
```

Execute the entire script.

### 2. Run the seed data (optional)

Paste and execute:

```
supabase/seed.sql
```

This inserts sample facilities, blood banks, and blood inventory.

## Notes

- Passwords are handled by Supabase Auth — never stored in `profiles`.
- The `handle_new_user` trigger auto-creates a profile row on signup.
- `updated_at` columns auto-update via the `handle_updated_at` trigger.
- `ON DELETE RESTRICT` on appointments/ambulance requests prevents accidental deletion of historical records.
