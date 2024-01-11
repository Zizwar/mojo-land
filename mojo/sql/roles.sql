create table
  public.roles (
    id bigint generated by default as identity,
    created_at timestamp with time zone null default now(),
    user_id bigint not null,
    role bigint not null,
    constraint roles_pkey primary key (id),
    constraint roles_role_fkey foreign key (role) references role (id),
    constraint roles_user_id_fkey foreign key (user_id) references users (id)
  ) tablespace pg_default;