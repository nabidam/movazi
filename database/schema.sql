DROP TABLE IF EXISTS pages;
CREATE TABLE pages (
    username TEXT PRIMARY KEY,
    title TEXT,
    subtitle TEXT,
    artwork_org TEXT,
    artwork_new TEXT,
    statement TEXT,
    video TEXT,
    sound TEXT
);