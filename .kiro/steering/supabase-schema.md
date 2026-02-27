# Supabase Schema Reference – Calyx

profiles
- id                  uuid PK REFERENCES auth.users
- encryption_salt     text NOT NULL (base64 16 bytes)
- test_iv             text
- test_ciphertext     text
- created_at          timestamptz
- updated_at          timestamptz

projects
- id                  uuid PK gen_random_uuid()
- user_id             uuid NOT NULL → auth.users
- name                text NOT NULL
- description         text
- created_at / updated_at

env_vars
- id                  uuid PK
- project_id          uuid → projects
- user_id             uuid → auth.users
- key                 text NOT NULL
- iv                  text NOT NULL (base64 12 bytes)
- ciphertext          text NOT NULL (base64)
- created_at / updated_at

Indexes:
- projects(user_id), projects(name)
- env_vars(project_id, user_id, key)

RLS: all tables USING (auth.uid() = user_id)
Trigger: on auth.users insert → create profiles row with random salt