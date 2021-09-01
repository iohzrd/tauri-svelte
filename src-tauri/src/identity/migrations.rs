pub const CREATE_IDENTITIES_TABLE: &str = "
    create table if not exists identities (
    aux         text,
    av          text,
    dn          text,
    following   text,
    meta        text,
    posts       text,
    publisher   text primary key,
    ts          int
  )";

pub const CREATE_POSTS_TABLE: &str = "
    create table if not exists posts (
    aux         text,
    body        text,
    files       text,
    files_cid   text,
    meta        text,
    publisher   text,
    ts          int primary key
  )";
