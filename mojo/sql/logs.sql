create table
  public.logs (
    id bigint generated by default as identity,
    created_at timestamp with time zone null default now(),
    status text null,
    module text null,
    action text null,
    error text null,
    log text null,
    user_id bigint null,
    mojo_id bigint null,
    constraint logs_pkey primary key (id),
    constraint logs_mojo_id_fkey foreign key (mojo_id) references mojos (id),
    constraint logs_user_id_fkey foreign key (user_id) references users (id)
  ) tablespace pg_default;