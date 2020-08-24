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

// allow
$allow = config::$config['allow_tasks'];

// allow true || param || login
if($allow === false || (!empty($allow) && is_string($allow) && !isset($_GET[$allow])) || (!$allow && !config::$has_login)) error('cannot!', 403);

// task
$task = get('task');
$tasks_array = ['create_cache', 'clear_cache', 'create_html'];
if(!in_array($task, $tasks_array)) error("Invalid task <strong>?task=$task<br><br>Available tasks</strong><br>[" . implode(', ', $tasks_array) . ']', 400);

// set time limit
$time_limit = get('time_limit');
if($time_limit) set_time_limit(intval($time_limit));

// vars
function iz($p){ return isset($_GET[$p]);}
$output = '';
$force = iz('force');
$do_all = iz('all');
$do_menu = $do_all || iz('menu');
$do_folders = $do_all || iz('folders');
$do_images = $do_all || iz('images');

// memory limit (used when $do_images)
$memory_limit = $do_images ? (get('memory_limit') ?: config::$config['image_resize_memory_limit']) : false;
if($memory_limit && is_numeric($memory_limit) && function_exists('ini_get') && $memory_limit > (int) @ini_get('memory_limit') && (!function_exists('ini_set') || !@ini_set('memory_limit', $memory_limit . 'M'))) error('Failed to set memory limit [' . $memory_limit . ']');

// processed
class processed {
  public static $folders = 0;
  public static $folders_count = 0;
  public static $images = 0;
  public static $images_count = 0;
  public static $menu = 0;
  public static $menu_count = 0;
}

// add output
function add_output($create = true, $count, $total, $force){
  $action = $create ? 'created' : 'removed';
  $items = $total === 1 ? 'item' : 'items';
  return ' cache items ' . $action . ': <strong>[' . $count . ' / ' . $total . ']</strong>' . ($total && $force ? ' (force ' . $action . ')' : '') . ($count === $total ? '' : ' (' . ($total - $count) . ' ' . $items . ' still valid)') . '<br>';
}

// task: create_html [beta]
if($task === 'create_html'){
	if(config::$has_login) error('Cannot create html when login is enabled. Pointless!', 400);
	$time = time();
	$url = 'http' . (!empty($_SERVER['HTTPS']) ? 's' : '' ) . '://' . $_SERVER['SERVER_NAME'] . $_SERVER['PHP_SELF'] . '?index_html=' . $time;
	$content = file_get_contents($url);
  if(!$content) error("Failed to execute <strong>file_get_contents('$url')</strong>;", 500);
  $put = file_put_contents('index.html', '<!-- index_html ' . $time . ' -->' . PHP_EOL . preg_replace('/\s+/', ' ', $content));
  if(!$put) error("Failed to execute <strong>file_put_contents('$url')</strong>;", 500);
  $output = "Successfully created <a href=\"./index.html?time=$time\">index.html</a> at $time";

// task: create_cache [beta]
} else if($task === 'create_cache') {

  // early exit
  if(!config::$config['cache']) exit('cache is disabled.');

  // create folders and images
  if($do_folders || $do_images) {

    // create cache loop function
    function create_cache($dir, $do_folders = false, $do_images = false, $force = false, $depth = 0){

      // exclude
      if(is_exclude($dir)) return 0;

      // dir cache path
      processed::$folders_count ++;
      $cache = get_dir_cache_path($dir);
      $cache_exists = file_exists($cache);
      $cache_recreate = $force || !$cache_exists ? true : false;
      $get_dir = $do_images || $cache_recreate ? true : false;

      // get dir
      if($get_dir){
        
        // dir from cache or new
        $arr = $cache_recreate ? get_dir($dir, true) : json_decode(file_get_contents($cache), true);

        // resize images
        if($do_images && config::$config['image_resize_enabled'] && config::$config['image_resize_cache'] && !empty($arr) && !empty($arr['files'])){
          $dirs = array();
          $image_sizes = array(config::$config['image_resize_dimensions']);
          if(config::$image_resize_dimensions_retina) $image_sizes[] = config::$image_resize_dimensions_retina;
          foreach ($arr['files'] as $filename => $props) {
            if($props['filetype'] === 'dir'){
              $dirs[] = root_absolute($props['path']);
              continue;
            }
            if(!isset($props['image'])) continue;

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
                processed::$images_count ++;

              // create image acche
              } else {

                // image create
                $image = image_create_from($path, $type);
                if(!$image) break;

                // count
                processed::$images_count ++;

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
                if(imagejpeg($new_image, $image_cache, config::$config['image_resize_quality'])) processed::$images ++;

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
          $json = empty($arr) ? '{}' : json_encode($arr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
          if(file_put_contents($cache, $json)) processed::$folders ++;
        }
      }

      // max depth
      if(!iz('ignore_max_depth') && config::$config['menu_max_depth'] && $depth >= config::$config['menu_max_depth']) return;

      // subdirs
      if($get_dir){
        if(!isset($dirs)){
          $dirs = array();
          foreach ($arr['files'] as $key => $val) if($val['filetype'] === 'dir') $dirs[] = root_absolute($val['path']);
        } 

      // glob subdirs
      } else {
        $dirs = glob($dir . '/*', GLOB_NOSORT|GLOB_ONLYDIR);
      }

      // sub dirs
      if(!empty($dirs)) foreach($dirs as $dir) create_cache($dir, $do_folders, $do_images, $force, $depth + 1);
    }

    // start create cache loop
    $start_dir = get('dir');
    if($start_dir){
    	$start_dir = real_path($start_dir);
    	if(!$start_dir) error('Dir does not exist <strong>dir=' . get('dir') . '</strong>', 404);
    }
    create_cache($start_dir?:config::$root, $do_folders, $do_images, $force);
  }
  
  // create menu
  if($do_menu) {
    $menu_cache_hash = get_menu_cache_hash(get_root_dirs());
    $menu_cache_file = config::$cache_path . DIRECTORY_SEPARATOR . 'menu' . DIRECTORY_SEPARATOR . $menu_cache_hash . '.json';
    processed::$menu_count = 1;

    // recreate menu
    if($force || !get_valid_menu_cache($menu_cache_file)){
      $menu_cache_arr = get_dirs(config::$root);
      $menu_cache_json = empty($menu_cache_arr) ? '{}' : json_encode($menu_cache_arr, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
      if(file_put_contents($menu_cache_file, $menu_cache_json)) processed::$menu ++;
    } 
  }

  // output
  if($do_menu) $output .= 'Menu' . add_output(true, processed::$menu, processed::$menu_count, $force);
  if($do_folders || $do_images) $output .= 'Folders' . add_output(true, processed::$folders, processed::$folders_count, $force);
  if($do_images) $output .= 'Images' . add_output(true, processed::$images, processed::$images_count, false);

// clear cache [beta]
} else if($task === 'clear_cache'){

  // get cache items
  function get_cache_items($dir, $ext){
    $cache_path = config::$cache_path . DIRECTORY_SEPARATOR . $dir;
    if(!file_exists($cache_path)) return array();
    return glob($cache_path . '/*.' . $ext, GLOB_NOSORT);
  }

  // menu
  if($do_menu){
    $menu_cache_items = get_cache_items('menu', 'json');
    processed::$menu_count = count($menu_cache_items);
    if(processed::$menu_count){
      $menu_cache_hash = $force ? false : get_menu_cache_hash(get_root_dirs());
      foreach ($menu_cache_items as $menu_cache_item) {
        if($force || basename($menu_cache_item) !== $menu_cache_hash . '.json') {
          if(unlink($menu_cache_item)) processed::$menu ++;
        }
      }
    }
    $output .= 'Menu' . add_output(false, processed::$menu, processed::$menu_count, $force);
  }

  // folders
  if($do_folders){
    $dirs_cache_items = get_cache_items('folders', 'json');
    processed::$folders_count = count($dirs_cache_items);
    if(processed::$folders_count){
      foreach ($dirs_cache_items as $dirs_cache_item) {
        if($force || strpos(basename($dirs_cache_item), config::$dirs_hash) !== 0) {
          if(unlink($dirs_cache_item)) processed::$folders ++;
          continue;
        }
        $dir_cache_content = file_get_contents($dirs_cache_item);
        if($dir_cache_content){
          $dir_cache_json = json_decode($dir_cache_content, true);
          $dir_abs_path = root_absolute($dir_cache_json['path']);
          if(!file_exists($dir_abs_path) || $dir_cache_json['mtime'] !== filemtime($dir_abs_path)) {
            if(unlink($dirs_cache_item)) processed::$folders ++;
          }   
        }
      }
    }
    $output .= 'Folders' . add_output(false, processed::$folders, processed::$folders_count, $force);
  }

  // images
  if($do_images){
    $image_cache_items = get_cache_items('images', 'jpg');
    processed::$images_count = count($image_cache_items);
    if(processed::$images_count){
      foreach ($image_cache_items as $image_cache_item) {
        if($force){
          if(unlink($image_cache_item)) processed::$images ++;
          continue;
        }
        $image_cache_item_arr = explode('.', basename($image_cache_item));
        $resize_val = isset($image_cache_item_arr[3]) && is_numeric($image_cache_item_arr[3]) ? intval($image_cache_item_arr[3]) : false;
        if(!$resize_val || !in_array($resize_val, [config::$config['image_resize_dimensions'], config::$image_resize_dimensions_retina])) {
          if(unlink($image_cache_item)) processed::$images ++;
        }
      }
    }
    $output .= 'Image' . add_output(false, processed::$images, processed::$images_count, $force);
  }

// invalid task command
} else {
  error("Invalid task command <strong>task=$task</strong>", 400);
}

// output
header('files-msg: task [' . header_memory_time() . ']');
if(!$output) error('No cache parameters selected [menu, folders, images, all]', 400);
echo $output . '<br>-<br>Processed in ' . round((microtime(true) - $_SERVER['REQUEST_TIME_FLOAT']), 2) . ' seconds.';


