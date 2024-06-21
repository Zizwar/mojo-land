create table
  public.users (
    id bigint generated by default as identity,
    username text not null,
    email text not null,
    password text not null,
    phone text not null,
    uuid uuid null default gen_random_uuid (),
    token text null,
    image text null,
    status text null default ''::text,
    is_active boolean null default true,
    bio text null,
    time integer null,
    jid text null,
    address jsonb null,
    firstname text null,
    lastname text null,
    comments text null,
    constraint users_pkey primary key (id),
    constraint unique_email unique (email),
    constraint unique_username unique (username),
    constraint users_token_key unique (token)
  ) tablespace pg_default;