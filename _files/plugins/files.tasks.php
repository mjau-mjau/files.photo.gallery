<?php

// ?task=
// create_cache / menu / folders / images / all / force / dir / ignore_max_depth / time_limit
// clear_cache / menu / folders / images / all / force / time_limit
// create_html

// never cache
header('expires: 0');
header('cache-control: no-cache, no-store, must-revalidate, max-age=0');
header('cache-control: post-check=0, pre-check=0', false);
header('pragma: no-cache');

// block direct access
if(!class_exists('config')) exit('ERROR: Tasks plugin cannot be accessed directly!');

// tasks
Class tasks {

  // output
  public static $output = '';
  public static $folders_processed = 0;
  public static $folders_count = 0;
  public static $images_processed = 0;
  public static $images_count = 0;
  public static $menu_processed = 0;
  public static $menu_count = 0;

  // task / 'create_cache', 'clear_cache', 'create_html'
  public static $task = false;

  // tasks
  public static $force = false; // for overwrite / does not apply for images
  public static $all = false; // run all tasks
  public static $menu = false; // menu cache
  public static $folders = false; // recursive folders cache
  public static $images = false; // rescursive images cache
  public static $video_thumbs = false; // part of 'images' task / required ffmpeg

  // resize_types
  public static $resize_types = [];


  // isset
  public static function isset($str){
    return isset($_GET[$str]);
  }

  // output
  public static function add_output($prepend = '', $create = true, $count = 0, $total = 0){
    $action = $create ? 'created' : 'removed';
    $items = $total === 1 ? 'item' : 'items';
    self::$output .= ($prepend ? $prepend . ' ': '') . 'cache items ' . $action . ': <strong>[' . $count . ' / ' . $total . ']</strong>' . ($total && tasks::$force ? ' (force ' . $action . ')' : '') . ($count === $total ? '' : ' (' . ($total - $count) . ' ' . $items . ' still valid)') . '<br>';
  }

  // set_memory_limit
  private function set_memory_limit(){
    $memory_limit = get('memory_limit') ?: config::$config['image_resize_memory_limit'];
    if($memory_limit && is_numeric($memory_limit) && $memory_limit > -1 && function_exists('ini_get') && $memory_limit > (int) @ini_get('memory_limit') && (!function_exists('ini_set') || !@ini_set('memory_limit', $memory_limit . 'M'))) error('Failed to set memory limit [' . $memory_limit . ']');
  }

  // process
  function __construct() {

    // allow_tasks
    $allow = config::$config['allow_tasks'];
    if($allow === false || (!empty($allow) && is_string($allow) && !self::isset($allow)) || (!$allow && !config::$has_login)) error('cannot!', 403);

    // assign task / 'create_cache', 'clear_cache', 'create_html'
    self::$task = get('task');

    // check if tasks if available
    $tasks_array = ['create_cache', 'clear_cache', 'create_html', 'download_assets'];
    if(!in_array(self::$task, $tasks_array)) error('Invalid task <strong>?task=' . (self::$task?:'') . '<br><br>Available tasks</strong><br>[' . implode(', ', $tasks_array) . ']', 400);

    // assign tasks
    self::$force = self::isset('force');
    self::$all = self::isset('all');
    self::$menu = self::$all || self::isset('menu');
    self::$folders = self::$all || self::isset('folders');
    self::$images = self::$all || self::isset('images');

    // assign memory limit (used only when resizing images)
    if(self::$images) self::set_memory_limit();

    // increase time limit ?time_limit=300 (300 seconds, useful when resizing massive amounts of images)
    $time_limit = get('time_limit');
    if($time_limit) set_time_limit(intval($time_limit));

    // get image resize types
    self::$resize_types = array_map(function($key){
      $type = trim(strtolower($key));
      return $type === 'jpg' ? 'jpeg' : $type;
    }, explode(',', config::$config['image_resize_types']));

    // video thumbs array if ffmpeg supported
    self::$video_thumbs = config::$config['video_thumbs'] && config::$config['video_ffmpeg_path'] && @function_exists('exec') && @exec('type -P ' . config::$config['video_ffmpeg_path']) ? ['mp4', 'mkv', 'ogv', 'm4v', 'webm'] : false;
  }
}

// init tasks
new tasks();

// task: create_html [beta]
if(tasks::$task === 'download_assets'){

  // requirements
  if(empty(config::$storage_path)) error('config::$storage_path is empty!', 400); // storage_path must exist
  if(!class_exists('ZipArchive')) error('PHP ZipArchive class is required.', 400); // ZipArchive required to unzip downloaded assets.zip
  if(!is_writable(__DIR__)) error(__DIR__ . ' is not writeable. Can\'t download.', 400); // must be able to write assets.zip to current dir
  $assets_path = config::$storage_path . '/assets';
  if(file_exists($assets_path) && !is_writable($assets_path)) error("$assets_path is not writeable!", 400); // $assets_path must be writeable

  // attempt to download
  //$assets_download = 'http://files.test/npm/_files/assets/assets.zip';
  $assets_download = 'https://cdn.jsdelivr.net/npm/files.photo.gallery@' . config::$version . '/_files/assets/assets.zip';
  $assets_downloaded = file_get_contents($assets_download);
  if(empty($assets_downloaded)) error("Can't download <a href=\"$assets_download\">$assets_download</a>", 400); // failed to download

  // write assets.zip temporarily into current __DIR__
  $assets_zip = __DIR__ . '/assets.zip';
  if(empty(file_put_contents($assets_zip, $assets_downloaded))) error("Failed to write $assets_zip", 400);

  // unzip into _files/assets/*
  $zip = new \ZipArchive;
  if(!$zip->open($assets_zip)) error("Failed to open $assets_zip", 400);
  $zip->extractTo($assets_path);
  $zip->close();
  unlink($assets_zip); // delete downloaded zip

  // output
  tasks::$output = "Successfully downloaded assets into <code>$assets_path</code>.";

// task: create_html [beta]
} else if(tasks::$task === 'create_html'){
	if(config::$has_login) error('Cannot create html when login is enabled. Pointless!', 400);
	$time = time();
	$url = 'http' . (!empty($_SERVER['HTTPS']) ? 's' : '' ) . '://' . $_SERVER['SERVER_NAME'] . $_SERVER['PHP_SELF'] . '?index_html=' . $time;
	$content = file_get_contents($url);
  if(!$content) error("Failed to execute <strong>file_get_contents('$url')</strong>;", 500);
  $put = file_put_contents('index.html', '<!-- index_html ' . $time . ' -->' . PHP_EOL . preg_replace('/\s+/', ' ', $content));
  if(!$put) error("Failed to execute <strong>file_put_contents('$url')</strong>;", 500);
  tasks::$output = "Successfully created <a href=\"./index.html?time=$time\">index.html</a> at $time";

// task: create_cache [beta]
} else if(tasks::$task === 'create_cache') {

  // early exit
  if(!config::$config['cache']) exit('cache is disabled.');

  // create folders and images
  if(tasks::$folders || tasks::$images) {

    // create cache loop function
    function create_cache($dir, $depth = 0){

      // skip dir
      if(!is_readable($dir) || is_exclude($dir)) return 0;

      // dir cache path
      tasks::$folders_count ++;
      $cache = get_dir_cache_path($dir);
      $cache_exists = file_exists($cache);
      $cache_recreate = tasks::$force || !$cache_exists ? true : false;
      $get_dir = tasks::$images || $cache_recreate ? true : false;

      // get dir
      if($get_dir){

        // dir from cache or new
        $arr = $cache_recreate ? get_dir($dir, true) : json_decode(file_get_contents($cache), true);

        // resize images
        if(tasks::$images && config::$config['image_resize_enabled'] && config::$config['image_resize_cache'] && !empty($arr) && !empty($arr['files'])){

          //
          $dirs = array();
          $image_sizes = array(config::$config['image_resize_dimensions']);
          if(config::$image_resize_dimensions_retina) $image_sizes[] = config::$image_resize_dimensions_retina;
          foreach ($arr['files'] as $filename => $props) {
            if($props['filetype'] === 'dir'){
              $dirs[] = root_absolute($props['path']);
              continue;
            }

            // video thumb
            if(tasks::$video_thumbs && isset($props['ext']) && in_array(strtolower($props['ext']), tasks::$video_thumbs)){

              // get cache path
              $video_thumb_cache = get_image_cache_path(root_absolute($props['path']), 480, $props['filesize'], $props['mtime']);

              // attempt to create if video thumb does not exist
              if(!file_exists($video_thumb_cache)) {
                // ffmpeg command
                $cmd = escapeshellarg(config::$config['video_ffmpeg_path']) . ' -i ' . escapeshellarg(real_path(root_absolute($props['path']))) . ' -deinterlace -an -ss 1 -t 1 -vf "thumbnail,scale=480:320:force_original_aspect_ratio=increase,crop=480:320" -r 1 -y -f mjpeg ' . $video_thumb_cache . ' 2>&1';
                // try to execute command
                @exec($cmd, $output, $result_code);
                // fail if result_code is anything else than 0
                tasks::$output .= ($result_code ? 'failed to create thumbnail for video ' : 'Video thumbnail created for ') . $props['path'] . '<br>';
              }
            }

            // proceed if image
            if(!isset($props['image'])) continue;

            // exit if image type is not resize type
            if(!in_array(image_type_to_extension($props['image']['type'], false), tasks::$resize_types)) continue;

            // exif orientation
            $orientation = isset($props['image']['exif']['Orientation']) ? $props['image']['exif']['Orientation'] : 0;

            // original dimensions / get physical
            $original_width = $props['image'][($orientation > 4 && $orientation < 9 ? 'height' : 'width')];
            $original_height = $props['image'][($orientation > 4 && $orientation < 9 ? 'width' : 'height')];

            // image_resize_max_pixels early exit
  					if(config::$config['image_resize_max_pixels'] && $original_width * $original_height > config::$config['image_resize_max_pixels']) continue;

            // vars
            $type = $props['image']['type'];
            $path = root_absolute($props['path']);

            // loop image sizes
            foreach ($image_sizes as $index => $image_size) {

              // ratio
              $ratio = max($original_width, $original_height) / $image_size;
              if($ratio < max(config::$config['image_resize_min_ratio'], 1)) continue;

              // cache path
              $image_cache = get_image_cache_path($path, $image_size, $props['filesize'], $props['mtime']);
              $image_cache_exists = file_exists($image_cache);

              // skip if cache exists
              if($image_cache_exists){
                tasks::$images_count ++;

              // create image acche
              } else {

                // image create
                $image = image_create_from($path, $type);
                if(!$image) break;

                // count
                tasks::$images_count ++;

                // Calculate new image dimensions.
                $new_width  = round($original_width / $ratio);
                $new_height = round($original_height / $ratio);

                // new image
                $new_image = imagecreatetruecolor($new_width, $new_height);
                call_user_func(config::$config['image_resize_function'], $new_image, $image, 0, 0, 0, 0, $new_width, $new_height, $original_width, $original_height);

                // destroy original $image resource
  							imagedestroy($image);

  							// fix orientation according to exif
  							exif_orientation($orientation, $new_image);

  							// sharpen resized image
  							if(config::$config['image_resize_sharpen']) sharpen_image($new_image);

                // save as cache
                if(imagejpeg($new_image, $image_cache, config::$config['image_resize_quality'])) tasks::$images_processed ++;

                // detroy $new_image resource
                imagedestroy($new_image);
              }

              // add image resize cache direct to $arr
              if($cache_recreate && config::$image_resize_cache_direct) $arr['files'][$filename]['image']['resize' . $image_size] = get_url_path($image_cache);
            }
          }
        }

        // save json
        if($cache_recreate) {
          $json = empty($arr) ? '{}' : json_encode($arr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PARTIAL_OUTPUT_ON_ERROR);
          if(file_put_contents($cache, $json)) tasks::$folders_processed ++;
        }
      }

      // max depth
      if(!tasks::isset('ignore_max_depth') && config::$config['menu_max_depth'] && $depth >= config::$config['menu_max_depth']) return;

      // subdirs
      if($get_dir){
        if(!isset($dirs)){
          $dirs = array();
          if(isset($arr['files'])) foreach ($arr['files'] as $key => $val) if($val['filetype'] === 'dir') $dirs[] = root_absolute($val['path']);
        }

      // glob subdirs
      } else {
        $dirs = glob($dir . '/*', GLOB_NOSORT|GLOB_ONLYDIR);
      }

      // sub dirs
      if(!empty($dirs)) foreach($dirs as $dir) create_cache($dir, $depth + 1);
    }

    // start create cache loop
    $start_dir = get('dir');
    if($start_dir){
    	$start_dir = real_path($start_dir);
    	if(!$start_dir) error('Dir does not exist <strong>dir=' . get('dir') . '</strong>', 404);
    }
    create_cache($start_dir?:config::$root);
  }

  // create menu
  if(tasks::$menu) {
    $menu_cache_hash = get_menu_cache_hash(get_root_dirs());
    $menu_cache_file = config::$cache_path . DIRECTORY_SEPARATOR . 'menu' . DIRECTORY_SEPARATOR . $menu_cache_hash . '.json';
    tasks::$menu_count = 1;

    // recreate menu
    if(tasks::$force || !get_valid_menu_cache($menu_cache_file)){
      $menu_cache_arr = get_dirs(config::$root);
      $menu_cache_json = empty($menu_cache_arr) ? '{}' : json_encode($menu_cache_arr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES|JSON_PARTIAL_OUTPUT_ON_ERROR);
      if(file_put_contents($menu_cache_file, $menu_cache_json)) tasks::$menu_processed ++;
    }
  }

  // output
  if(tasks::$menu) tasks::add_output('Menu', true, tasks::$menu_processed, tasks::$menu_count);
  if(tasks::$folders || tasks::$images) tasks::add_output('Folders', true, tasks::$folders_processed, tasks::$folders_count);
  if(tasks::$images) tasks::add_output('Images', true, tasks::$images_processed, tasks::$images_count);

// clear cache [beta] / does not not use 'dir'
} else if(tasks::$task === 'clear_cache'){

  // get cache items
  function get_cache_items($dir, $ext){
    $cache_path = config::$cache_path . DIRECTORY_SEPARATOR . $dir;
    if(!file_exists($cache_path)) return array();
    return glob($cache_path . '/*.' . $ext, GLOB_NOSORT);
  }

  // menu
  if(tasks::$menu){
    $menu_cache_items = get_cache_items('menu', 'json');
    tasks::$menu_count = count($menu_cache_items);
    if(tasks::$menu_count){
      $menu_cache_hash = tasks::$force ? false : get_menu_cache_hash(get_root_dirs());
      foreach ($menu_cache_items as $menu_cache_item) {
        if(tasks::$force || basename($menu_cache_item) !== $menu_cache_hash . '.json') {
          if(unlink($menu_cache_item)) tasks::$menu_processed ++;
        }
      }
    }
    tasks::add_output('Menu', false, tasks::$menu_processed, tasks::$menu_count);
  }

  // folders
  if(tasks::$folders){
    $dirs_cache_items = get_cache_items('folders', 'json');
    tasks::$folders_count = count($dirs_cache_items);
    if(tasks::$folders_count){
      foreach ($dirs_cache_items as $dirs_cache_item) {
        if(tasks::$force || strpos(basename($dirs_cache_item), config::$dirs_hash) !== 0) {
          if(unlink($dirs_cache_item)) tasks::$folders_processed ++;
          continue;
        }
        $dir_cache_content = file_get_contents($dirs_cache_item);
        if($dir_cache_content){
          $dir_cache_json = json_decode($dir_cache_content, true);
          $dir_abs_path = root_absolute($dir_cache_json['path']);
          if(!file_exists($dir_abs_path) || $dir_cache_json['mtime'] !== filemtime($dir_abs_path)) {
            if(unlink($dirs_cache_item)) tasks::$folders_processed ++;
          }
        }
      }
    }
    tasks::add_output('Folders', false, tasks::$folders_processed, tasks::$folders_count);
  }

  // clear image cache /
  if(tasks::$images){
    $image_cache_items = get_cache_items('images', 'jpg');
    tasks::$images_count = count($image_cache_items);
    if(tasks::$images_count){
      foreach ($image_cache_items as $image_cache_item) {
        if(tasks::$force){
          if(unlink($image_cache_item)) tasks::$images_processed ++;
          continue;
        }
        $image_cache_item_arr = explode('.', basename($image_cache_item));
        $resize_val = isset($image_cache_item_arr[3]) && is_numeric($image_cache_item_arr[3]) ? intval($image_cache_item_arr[3]) : false;
        if(!$resize_val || !in_array($resize_val, [config::$config['image_resize_dimensions'], config::$image_resize_dimensions_retina])) {
          if(unlink($image_cache_item)) tasks::$images_processed ++;
        }
      }
    }
    tasks::add_output('Image', false, tasks::$images_processed, tasks::$images_count);
  }
}

// output
header('files-msg: task [' . header_memory_time() . ']');
if(!tasks::$output) error('No cache parameters selected [menu, folders, images, all]', 400);
echo tasks::$output . '<br>-<br>Processed in ' . round((microtime(true) - $_SERVER['REQUEST_TIME_FLOAT']), 2) . ' seconds.';
