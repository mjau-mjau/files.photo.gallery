<?php

// CONFIG / https://www.files.gallery/docs/config/z
// Uncomment the parameters you want to edit.
return [
  'root' => './content',
  'start_path' => './content/someguy_startpath',
  //'username' => '',
  'password' => '$2y$12$LVjq.zO/b4tfHaswRdZ9cu871wzgORIkiWYc//0re6dUSH7hVPn62',
  //'load_images' => false,
  'menu_max_depth' => 4,
  'layout' => 'columns',
  'files_exclude' => '/\.php$/',
  'dirs_exclude' => '/^(filemanager|new demo stuff|test)($|\/)/',
  // ALLOW
  'allow_upload' => true,
  'allow_delete' => true,
  'allow_rename' => true,
  'allow_new_folder' => true,
  'allow_new_file' => true,
  'allow_duplicate' => true,
  'allow_text_edit' => true,
  'allow_zip' => true,
  'allow_unzip' => true,
  'allow_move' => true,
  'allow_copy' => true,
  //'allow_download' => true, // default
  'allow_mass_download' => true,
  'allow_mass_copy_links' => true,
  //'demo_mode' => true,
  'upload_allowed_file_types' => 'image/*',
  'upload_max_filesize' => 100000,
  //'lang_default' => 'ja',
  //'lang_auto' => false,
];