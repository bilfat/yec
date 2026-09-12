-- SEED SCRIPT FOR YEC PLATFORM

-- 1. Create a dummy Auth User for Admin (Password: admin123)
-- Using pgcrypto for password hash. Email: admin@yec.id
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'b4850125-9c4c-47bc-ae55-16fb50c76595',
    'authenticated',
    'authenticated',
    'admin@yec.id',
    crypt('admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    now(),
    now(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'b4850125-9c4c-47bc-ae55-16fb50c76595',
    'b4850125-9c4c-47bc-ae55-16fb50c76595',
    format('{"sub":"%s","email":"%s"}', 'b4850125-9c4c-47bc-ae55-16fb50c76595', 'admin@yec.id')::jsonb,
    'email',
    now(),
    now(),
    now()
) ON CONFLICT (provider_id, provider) DO NOTHING;

-- 2. Insert into public.users (Admin)
INSERT INTO public.users (id, name, username, role, active)
VALUES (
    'b4850125-9c4c-47bc-ae55-16fb50c76595',
    'Super Admin',
    'admin',
    'ADMIN',
    true
) ON CONFLICT (id) DO NOTHING;

-- 3. Competition Settings
INSERT INTO public.competition_settings (competition_name, bmc_submission_open, bmc_evaluation_open, pitching_submission_open, pitching_evaluation_open, announcement_title, announcement_content, participant_support_phone)
VALUES (
    'Young Entrepreneur Camp 2026',
    false, false, false, false,
    'Selamat Datang!', 'Portal resmi telah dibuka.', '081219843922'
);

-- 4. Subthemes
INSERT INTO public.subthemes (id, name, sort_order) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Teknologi & Digitalisasi', 1),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Ekonomi Kreatif', 2),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Agribisnis & Pangan', 3);

-- 5. Evaluation Templates & Criteria (Example: BMC)
INSERT INTO public.evaluation_templates (id, name, stage, active)
VALUES ('e1f8d4f0-4a8e-4f1d-9e2c-8a1a3e6a2b8b', 'BMC Standard Template 2026', 'BMC', true);

INSERT INTO public.criteria (id, template_id, name, weight, sort_order) VALUES
('c1f8d4f0-4a8e-4f1d-9e2c-8a1a3e6a2b8c', 'e1f8d4f0-4a8e-4f1d-9e2c-8a1a3e6a2b8b', 'Inovasi Produk', 30, 1),
('c1f8d4f0-4a8e-4f1d-9e2c-8a1a3e6a2b8d', 'e1f8d4f0-4a8e-4f1d-9e2c-8a1a3e6a2b8b', 'Market & Potensi Pasar', 25, 2);

INSERT INTO public.criterion_points (criterion_id, name, sort_order) VALUES
('c1f8d4f0-4a8e-4f1d-9e2c-8a1a3e6a2b8c', 'Tingkat keunikan ide', 1),
('c1f8d4f0-4a8e-4f1d-9e2c-8a1a3e6a2b8c', 'Solusi terhadap masalah nyata', 2),
('c1f8d4f0-4a8e-4f1d-9e2c-8a1a3e6a2b8d', 'Ukuran target pasar yang disasar', 1);
