<?php

// Files Gallery X3 login plugin @_files/plugins/files.x3-login.php / www.files.gallery
// Gets and uses X3 login credentials if root points inside X3 'content'
// If you want a public accessible Files app for your X3 content, just copy /files/index.php into /yourpublicdir/index.php

// X3 login class
class X3_login {

	// user-specific Files Gallery config (does not include default values) that shouldn't be overridden
	private $user_config;

	// get username and password from X3 config
	public function __construct() {

		// user-specific Files Gallery config (does not include default values)
		$this->user_config = array_replace(Config::$storageconfig, Config::$localconfig);

		// get X3 ['back']['panel'] config
		$config = $this->get_config();

		// get DB login if config use_db
		if(!empty($config['use_db'])) {

			// include full x3 config for DB details
			include X3::path() . '/app/x3.config.inc.php';

			// get full panel config
			$panel = X3Config::$config['back']['panel'];

			// new mysqli connection
			$mysqli = new mysqli($panel['db_host'], $panel['db_user'], $panel['db_pass'], $panel['db_name']);

			// mysqli connection error
			if(empty($mysqli) || $mysqli->connect_errno) U::error('Can\'t connect to X3 database.');

			// fetch login row
			$row = mysqli_query($mysqli, 'select username, password from filemanager_db limit 1')->fetch_row();

			// error missing username and/or password in database
			if(empty($row) || !is_array($row) || count($row) !== 2) U::error('Can\'t get username or password from database.');

			// assign username and password from database
			$username = $row[0];
			$password = $row[1];

		// get non-db login / assign default 'admin' if empty
		} else {
			$username = !empty($config['username']) ? $config['username'] : 'admin';
			$password = !empty($config['password']) ? $config['password'] : 'admin';
		}

		// assume full filemanager permissions when X3 login plugin is present and used
		foreach ([
			'upload',
			'delete',
			'rename',
			'new_folder',
			'new_file',
			'duplicate',
			'text_edit',
			'zip',
			'unzip',
			'move',
			'copy',
			'mass_download',
			'mass_copy_links'
		] as $key) $this->set("allow_$key", true);

		// exclude .json files as we don't want these visible
		$this->set('files_exclude', '/\.json$/i');

		// Assign demo_mode if X3 guest/guest or default admin/admin (because it's insecure)
		if($username === $password && in_array($username, ['guest', 'admin'])) $this->set('demo_mode', true);

		// assign username and password to Files Gallery config
		$this->set('username', $username);
		$this->set('password', $password);
	}

	// override Files Gallery config values, unless they are asigned in user config (config.php or _filesconfig.php)
	private function set($key, $value){
		if(isset($this->user_config[$key])) return;
		Config::$config[$key] = $value;
	}

	// returns X3 ['back']['panel'] config array
	private function get_config(){
		$path = X3::path() . '/config/config.user.json';
		if(!file_exists($path) || !is_readable($path)) return [];
		$arr = json_decode(file_get_contents($path), true);
		return !empty($arr['back']['panel']) ? $arr['back']['panel'] : [];
	}
}

//
new X3_login();
