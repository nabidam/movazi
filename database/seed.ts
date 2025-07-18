import db from "./db";

db.exec(`
  INSERT INTO pages (
    username, title, subtitle,
    artwork_org, artwork_new,
    statement, video, sound
  ) VALUES (
    'username', 'Title', 'Subtitle here',
    '/media/artwork_org.png', '/media/artwork_new.png',
    'A long statement text...',
    '/media/video.mp4', '/media/sound.mp3'
  )
`);

console.log("Seeded DB ✅");
