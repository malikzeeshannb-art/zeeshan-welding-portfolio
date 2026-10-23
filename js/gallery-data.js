/* =====================================================================
   GALLERY DATA  -  THE ONLY FILE FOR EDIT TO ADD PHOTOS / VIDEOS
   ---------------------------------------------------------------------
   The FIRST item of each list is the one shown on the portfolio card.
   (for putting best photo / and best video on top.)

   ADD A PHOTO (3 steps)
   1. Put the image in:  assets/gallery/photos/
      (tip: max 1600px wide, JPG, under 400 KB)
   2. Copy ONE line below and change the file name + title.
   3. Save, commit, push. Done.

   ADD A VIDEO (YouTube unlisted)
   1. Upload to YouTube as "Unlisted".
   2. Copy the video ID from the link:
        https://www.youtube.com/watch?v=  dQw4w9WgXcQ   <- this part
        https://youtu.be/                 dQw4w9WgXcQ   <- or this part
   3. Copy ONE line below and paste the ID.

   Optional field:  illustration: true  -> shows an "Illustration" badge
   (use it for any picture that is NOT your own work photo).
   ===================================================================== */

var PHOTOS = [
  // To use the examples: delete the two slashes (//) at the start of the line.
  { src: "assets/gallery/photos/pipe-6g-01.WEBP", title: "6G pipe welding", caption: "practice SMAW filling after open-root & hot pass" },
  // { src: "assets/gallery/photos/pipe-6g-01.", title: "6G pipe welding", caption: "SMAW open-root practice" },
  // { src: "assets/gallery/photos/steel-frame.jpg", title: "Steel frame", caption: "Fabrication work" },
];

var VIDEOS = [
  { id: "zymhpN_oJsU", title: "6G practice", caption: "Practicing a 6G weld and finishing a full electrode in one go. Check out my technique!" },
  // { id: "YOUR_YOUTUBE_ID", title: "6G practice", caption: "Open-root pass" },
];
